import React from 'react';
import { ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';

interface BannerSlotProps {
  id: string;
  position: 'top' | 'middle';
  imageUrl?: string;
  targetUrl?: string;
  badgeText?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  altText?: string;
  className?: string;
}

export const BannerSlot: React.FC<BannerSlotProps> = ({
  id,
  position,
  imageUrl,
  targetUrl = '#',
  badgeText = position === 'top' ? 'Destaque Especial' : 'Recomendação Exclusiva',
  title = position === 'top'
    ? 'Ofertas e Vantagens Exclusivas para Você'
    : 'Aproveite Condições Imperdíveis Hoje',
  subtitle = position === 'top'
    ? 'Confira os melhores produtos com descontos exclusivos e entrega rápida.'
    : 'Garanta acesso a benefícios especiais selecionados para o seu perfil.',
  buttonText = 'Conferir Agora',
  altText = 'Oferta Especial',
  className = '',
}) => {
  const isLinkActive = Boolean(targetUrl && targetUrl !== '#');

  return (
    <aside
      id={id}
      className={`w-full max-w-2xl mx-auto rounded-2xl border border-slate-200 bg-white hover:border-sky-300 hover:shadow-md transition-all overflow-hidden ${className}`}
    >
      <a
        href={isLinkActive ? targetUrl : undefined}
        target={isLinkActive ? '_blank' : undefined}
        rel={isLinkActive ? 'noopener noreferrer sponsored' : undefined}
        className={`flex flex-col sm:flex-row items-center justify-between gap-3.5 p-3.5 sm:p-4 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-2xl`}
      >
        {/* Imagem Compacta / Ícone */}
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          {imageUrl ? (
            <div className="w-20 h-20 sm:w-24 sm:h-20 shrink-0 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center p-1">
              <img
                src={imageUrl}
                alt={altText}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-6 h-6" />
            </div>
          )}

          {/* Texto de Vendas (Mobile view layout adjustment) */}
          <div className="flex-1 text-left min-w-0">
            <div className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200/80 px-2 py-0.5 rounded-full mb-1">
              <Sparkles className="w-3 h-3 text-sky-500 shrink-0" />
              <span className="truncate">{badgeText}</span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug group-hover:text-sky-600 transition-colors line-clamp-1">
              {title}
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-tight line-clamp-2">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Botão de Vendas / CTA */}
        <div className="w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
          <span className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 group-hover:bg-sky-700 active:scale-[0.98] shadow-xs shadow-sky-600/20 transition-all">
            <span>{buttonText}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </a>
    </aside>
  );
};
