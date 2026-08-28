/**
 * PIX EMV Payload Generator (BR Code / Banco Central do Brasil)
 * Padrão oficial BACEN para PIX Estático.
 */

function formatField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

export function crc16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Remove acentos e normaliza string para ASCII puro (requisito BACEN).
 */
function stripAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export interface PixParams {
  key: string;
  name?: string;
  city?: string;
  amount?: string;
  txid?: string;
}

/**
 * Gera o payload PIX no formato BR Code EMV oficial do Banco Central.
 * Compatível com todos os bancos brasileiros (Nubank, Itaú, Bradesco, Inter, Caixa, etc.)
 */
export function generatePixPayload({
  key,
  name,
  city,
  amount,
  txid = '***',
}: PixParams): string {
  const cleanKey = key.trim();
  const cleanName = stripAccents((name || 'RECEBEDOR').trim()).substring(0, 25);
  const cleanCity = stripAccents((city || 'SAO PAULO').trim()).substring(0, 15);
  const cleanTxid = (txid || '***').trim().substring(0, 25) || '***';

  const merchantAccountInfo =
    formatField('00', 'br.gov.bcb.pix') + formatField('01', cleanKey);

  let payload =
    formatField('00', '01') +
    formatField('26', merchantAccountInfo) +
    formatField('52', '0000') +
    formatField('53', '986');

  if (amount && parseFloat(amount) > 0) {
    const formattedAmount = parseFloat(amount).toFixed(2);
    payload += formatField('54', formattedAmount);
  }

  payload +=
    formatField('58', 'BR') +
    formatField('59', cleanName.toUpperCase()) +
    formatField('60', cleanCity.toUpperCase()) +
    formatField('62', formatField('05', cleanTxid));

  payload += '6304';
  payload += crc16(payload);

  return payload;
}
