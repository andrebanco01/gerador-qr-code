import React from 'react';
import { MessageCircle, Phone } from 'lucide-react';

interface WhatsAppContactProps {
  phoneNumber?: string;
  message?: string;
  developerName?: string;
  className?: string;
  variant?: 'button' | 'floating' | 'compact';
}

/**
 * Componente de Contato WhatsApp
 * Permite contato direto com o desenvolvedor via WhatsApp
 */
export const WhatsAppContact: React.FC<WhatsAppContactProps> = ({
  phoneNumber = '5511999999999',
  message = 'Olá! Gostaria de entrar em contato sobre o Gerador de QR Code.',
  developerName = 'Desenvolvedor',
  className = '',
  variant = 'floating',
}) => {
  // Formatar número para o padrão wa.me (apenas dígitos)
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

  if (variant === 'button') {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white bg-[#198754] hover:bg-[#157347] active:scale-[0.98] transition-all shadow-lg border border-[#157347] ${className}`}
      >
        <MessageCircle className="w-4 h-4" />
        <span>Contato via WhatsApp</span>
      </a>
    );
  }

  if (variant === 'compact') {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#198754] hover:bg-[#157347] active:scale-[0.95] transition-all shadow-md ${className}`}
      >
        <Phone className="w-3 h-3" />
        <span>WhatsApp</span>
      </a>
    );
  }

  // Variante floating (padrão) - Botão flutuante no canto da tela
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-[#198754] hover:bg-[#157347] active:scale-[0.95] transition-all shadow-lg hover:shadow-xl group ${className}`}
      title="Contate o desenvolvedor para sugestões e parcerias"
      aria-label="Contate o desenvolvedor para sugestões e parcerias"
    >
      <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      
      {/* Tooltip ao passar o mouse */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg border border-slate-700">
        Contate o desenvolvedor para sugestões e parcerias
        <div className="absolute top-full right-3 w-2 h-2 bg-slate-900 rotate-45" />
      </div>
    </a>
  );
};
