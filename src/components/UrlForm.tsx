import React from 'react';
import { Globe, X } from 'lucide-react';

interface UrlFormProps {
  value: string;
  onChange: (value: string) => void;
}

export const UrlForm: React.FC<UrlFormProps> = ({ value, onChange }) => (
  <div className="space-y-3 p-4 bg-sky-50/40 border border-sky-100 rounded-xl">
    <div>
      <label htmlFor="url-input" className="block text-xs font-bold text-slate-700 mb-1.5">
        Endereço da URL ou Site:
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Globe className="w-4 h-4" />
        </div>
        <input
          id="url-input"
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://seusite.com.br"
          className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none text-slate-800 placeholder:text-slate-400 text-sm font-medium transition-all"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            title="Limpar campo"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <p className="text-[11px] text-slate-500 mt-1.5">
        Insira o link completo para o qual a pessoa será redirecionada ao ler o QR Code.
      </p>
    </div>
  </div>
);
