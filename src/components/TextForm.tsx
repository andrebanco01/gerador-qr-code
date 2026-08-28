import React from 'react';
import { FileText } from 'lucide-react';

interface TextFormProps {
  value: string;
  onChange: (v: string) => void;
}

export const TextForm: React.FC<TextFormProps> = ({ value, onChange }) => (
  <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-xl space-y-3">
    <div>
      <label htmlFor="plain-text-input" className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-indigo-600" />
          Texto Livre / Mensagem:
        </span>
        <span className="text-[11px] text-slate-400 font-mono">
          {value.length} caracteres
        </span>
      </label>
      <textarea
        id="plain-text-input"
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Digite aqui o texto, anotação, código de barras ou mensagem que deseja gravar no QR Code..."
        className="w-full p-3.5 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none text-slate-800 placeholder:text-slate-400 text-sm font-normal transition-all"
      />
      <p className="text-[11px] text-slate-500 mt-1">
        Qualquer smartphone que ler o código exibirá este texto exatamente como escrito.
      </p>
    </div>
  </div>
);
