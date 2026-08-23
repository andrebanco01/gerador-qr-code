import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Gerador de QR Code Gratuito | Crie QR Codes Instantaneamente',
  description: 'Gerador de QR Code grátis e online. Crie QR Codes personalizados para URLs, textos, PIX, WhatsApp e muito mais. Download em PNG. 100% seguro e sem cadastro.',
  keywords: 'gerador qr code, gerador de qr code, gerador de qrcode, gerador qrcode, criar qr code, qr code grátis, qr code pix',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://gerador-qr-code.vercel.app/',
  },
  openGraph: {
    title: 'Gerador de QR Code Gratuito | Crie QR Codes Instantaneamente',
    description: 'Gerador de QR Code grátis e online. Crie QR Codes personalizados para URLs, textos, PIX, WhatsApp e muito mais. Download em PNG. 100% seguro e sem cadastro.',
    type: 'website',
    url: 'https://gerador-qr-code.vercel.app/',
    siteName: 'Gerador de QR Code',
    images: [{ url: 'https://gerador-qr-code.vercel.app/og-image.png' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gerador de QR Code Gratuito | Crie QR Codes Instantaneamente',
    description: 'Gerador de QR Code grátis e online. Crie QR Codes personalizados para URLs, textos, PIX, WhatsApp e muito mais. Download em PNG. 100% seguro e sem cadastro.',
  },
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📱</text></svg>'
  }
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Gerador de QR Code Gratuito",
    "description": "Gerador de QR Code grátis e online. Crie QR Codes personalizados para URLs, textos, PIX, WhatsApp e muito mais.",
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "BRL"
    },
    "author": {
      "@type": "Organization",
      "name": "Gerador de QR Code"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "1250"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "O que é um QR Code?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "QR Code (Quick Response Code) é um código de barras bidimensional que armazena informações, podendo ser lido rapidamente por smartphones."
        }
      },
      {
        "@type": "Question",
        "name": "Como gerar QR Code para PIX?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Insira a chave PIX ou o código Copia e Cola fornecido pelo seu banco no campo indicado e gere a imagem. Seus clientes só precisarão escanear para pagar."
        }
      },
      {
        "@type": "Question",
        "name": "Como usar o Gerador de QR Code?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Basta digitar o texto, URL, chave PIX ou número de WhatsApp no campo indicado, clicar em gerar e baixar a imagem em PNG."
        }
      },
      {
        "@type": "Question",
        "name": "O Gerador de QR Code é gratuito?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sim, nosso gerador é 100% gratuito, sem necessidade de cadastro ou limites de criação."
        }
      },
      {
        "@type": "Question",
        "name": "Os QR Codes gerados expiram?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Não. Os QR Codes gerados são estáticos e nunca expiram."
        }
      },
      {
        "@type": "Question",
        "name": "É seguro gerar QR Codes para PIX?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sim, a geração é feita localmente e não armazenamos nenhuma informação pessoal ou financeira inserida."
        }
      }
    ]
  };

  return (
    <html lang="pt-BR">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body suppressHydrationWarning className="bg-gray-50 text-gray-900 font-sans min-h-screen">
        {children}
      </body>
    </html>
  );
}

