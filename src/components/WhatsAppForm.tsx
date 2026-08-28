import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppFormProps {
  countryCode: string;
  onCountryCodeChange: (v: string) => void;
  phone: string;
  onPhoneChange: (v: string) => void;
  message: string;
  onMessageChange: (v: string) => void;
}

export const WhatsAppForm: React.FC<WhatsAppFormProps> = ({
  countryCode,
  onCountryCodeChange,
  phone,
  onPhoneChange,
  message,
  onMessageChange,
}) => (
  <div className="p-4 bg-emerald-50/50 border border-[#a3d9b8] rounded-xl space-y-3.5">
    <div className="pb-2 border-b border-emerald-200/70">
      <span className="text-xs font-bold text-[#0f5132] uppercase tracking-wider flex items-center gap-1.5">
        <MessageCircle className="w-4 h-4 text-[#198754]" />
        Conversa no WhatsApp
      </span>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
      <div>
        <label htmlFor="wa-country" className="block text-xs font-bold text-[#0f5132] mb-1">
          DDI (País):
        </label>
        <input
          id="wa-country"
          type="text"
          value={countryCode}
          onChange={(e) => onCountryCodeChange(e.target.value)}
          placeholder="55"
          className="w-full px-3 py-2.5 bg-white border border-[#a3d9b8] rounded-lg text-xs sm:text-sm text-center font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-800"
        />
      </div>
      <div className="sm:col-span-3">
        <label htmlFor="wa-phone" className="block text-xs font-bold text-[#0f5132] mb-1">
          DDD + Número do Celular:*
        </label>
        <input
          id="wa-phone"
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="ex: 11999998888"
          className="w-full px-3 py-2.5 bg-white border border-[#a3d9b8] rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-800"
        />
      </div>
    </div>

    <div>
      <label htmlFor="wa-msg" className="block text-xs font-bold text-[#0f5132] mb-1">
        Mensagem Pré-configurada (Opcional):
      </label>
      <textarea
        id="wa-msg"
        rows={2}
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        placeholder="ex: Olá! Gostaria de saber mais sobre os produtos..."
        className="w-full px-3 py-2.5 bg-white border border-[#a3d9b8] rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-800 resize-none"
      />
      <p className="text-[11px] text-[#0f5132]/80 mt-1">
        Ao escanear, o WhatsApp abrirá a conversa com este texto pronto para envio.
      </p>
    </div>
  </div>
);
