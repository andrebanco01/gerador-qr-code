import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const faqs = [
  {
    q: 'O gerador de QR Code é realmente 100% gratuito?',
    a: 'Sim! Nossa ferramenta é totalmente gratuita, sem necessidade de cadastro, plano pago ou cartão de crédito. Você pode gerar quantos códigos precisar.',
  },
  {
    q: 'Os QR Codes gerados têm limite de leitura ou data de validade?',
    a: 'Não. Os QR Codes são estáticos: as informações ficam gravadas diretamente nos módulos do código. Eles nunca expiram e aceitam leituras ilimitadas.',
  },
  {
    q: 'Como funciona o QR Code PIX (Padrão Banco Central)?',
    a: 'Nosso gerador cria o código no formato oficial BR Code EMV do Banco Central. Qualquer aplicativo bancário brasileiro (Nubank, Itaú, Bradesco, Inter, Caixa, etc.) reconhece o recebedor, a cidade e o valor instantaneamente.',
  },
  {
    q: 'Qual é a resolução da imagem PNG baixada?',
    a: 'A imagem é exportada em alta definição (560x560 pixels com correção de erro nível H), perfeita para impressão nítida em cardápios, placas, cartões e vitrines.',
  },
  {
    q: 'Meus dados ficam salvos em algum servidor?',
    a: 'Não. Todo o processamento ocorre localmente no seu navegador (Client-Side). Nenhuma informação, chave PIX ou senha é enviada a servidores externos.',
  },
];

export const FAQSection: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-6 text-slate-700 text-sm leading-relaxed shadow-xs">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          O que é um QR Code e como utilizá-lo?
        </h2>
        <p className="mt-2 text-slate-600">
          O <strong>QR Code (Quick Response Code)</strong> é um código matricial bidimensional desenvolvido para
          armazenar dados lidos por câmeras de smartphones. Ideal para pagamentos instantâneos com PIX (BR Code oficial),
          links para sites, conexões Wi-Fi imediatas e direcionamento para WhatsApp.
        </p>
      </div>

      <div>
        <h3 className="text-base font-bold text-slate-900">Vantagens Desta Ferramenta</h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <li className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <span><strong>Padrão PIX BACEN:</strong> Compatível com todos os bancos brasileiros.</span>
          </li>
          <li className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <span><strong>Alta Resolução:</strong> Arquivos PNG em 560x560px prontos para impressão gráfica.</span>
          </li>
          <li className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <span><strong>Não Expira:</strong> Códigos estáticos permanentes que funcionam para sempre.</span>
          </li>
          <li className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <span><strong>100% Seguro e Privado:</strong> Processamento executado no seu navegador.</span>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-base font-bold text-slate-900 mb-3">Perguntas Frequentes (FAQ)</h3>
        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 transition-colors">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-3.5 text-left font-semibold text-slate-800 hover:bg-slate-100/70 transition-colors cursor-pointer text-xs sm:text-sm"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 transition-transform duration-200 shrink-0 ${
                    openFaq === idx ? 'rotate-180 text-sky-600' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="p-3.5 pt-0 text-xs sm:text-sm text-slate-600 bg-white border-t border-slate-100 animate-fade-in-up">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
