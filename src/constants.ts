/**
 * Constantes centralizadas da aplicação.
 * Evita hardcoding em múltiplos componentes.
 */

/** Número de WhatsApp do desenvolvedor (apenas dígitos, com DDI) */
export const DEVELOPER_WHATSAPP = '5551991251325';

/** Mensagem padrão para contato via WhatsApp */
export const DEVELOPER_WHATSAPP_MESSAGE =
  'Olá! Gostaria de conversar sobre sugestões ou oportunidades de negócios com o Gerador de QR Code.';

/** URLs de afiliados (banners) */
export const AFFILIATE_URLS = {
  top: 'https://apretailer.com.br/click/69f971422bfa811fa651f598/184804/249927/',
  middle: 'https://apretailer.com.br/click/686b1a812bfa81137568adf2/183859/249927/',
} as const;

/** Domínio canônico do site */
export const CANONICAL_DOMAIN = 'https://gerador-qr-code-lake.vercel.app';
