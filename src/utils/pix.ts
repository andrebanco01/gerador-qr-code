/**
 * PIX EMV Payload Generator (BR Code / Banco Central do Brasil)
 */

function formatField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

function crc16(str: string): string {
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

export interface PixParams {
  key: string;
  name: string;
  city: string;
  amount?: string;
  txId?: string;
  description?: string;
}

export function generatePixPayload({
  key,
  name,
  city,
  amount,
  txId = '***',
  description,
}: PixParams): string {
  const cleanKey = key.trim();
  const cleanName = (name.trim() || 'RECEBEDOR').substring(0, 25);
  const cleanCity = (city.trim() || 'BRASIL').substring(0, 15);
  const cleanTxId = (txId.trim() || '***').substring(0, 25);

  let merchantInfo = formatField('00', 'br.gov.bcb.pix') + formatField('01', cleanKey);
  if (description && description.trim()) {
    merchantInfo += formatField('02', description.trim().substring(0, 40));
  }

  let payload =
    formatField('00', '01') + // Format Indicator
    formatField('26', merchantInfo) + // Merchant Account Info
    formatField('52', '0000') + // Merchant Category Code
    formatField('53', '986') + // Currency: BRL
    (amount && parseFloat(amount) > 0 ? formatField('54', parseFloat(amount).toFixed(2)) : '') +
    formatField('58', 'BR') + // Country Code
    formatField('59', cleanName) + // Beneficiary Name
    formatField('60', cleanCity) + // Beneficiary City
    formatField('62', formatField('05', cleanTxId)); // Additional Data (TxID)

  payload += '6304';
  const checksum = crc16(payload);
  return payload + checksum;
}
