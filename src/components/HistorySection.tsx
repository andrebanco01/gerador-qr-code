import React from 'react';
import { QrCode, Clock, Trash2 } from 'lucide-react';
import type { HistoryItem } from '../hooks/useQRCode';

interface HistorySectionProps {
  history: HistoryItem[];
  onReuse: (text: string, type: HistoryItem['type']) => void;
  onClear: () => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({ history, onReuse, onClear }) => (
  <div className="mt-6 pt-5 border-t border-slate-100">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
        <Clock className="w-3.5 h-3.5" />
        <span>Histórico Recente (Últimos 10)</span>
      </div>
      {history.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
          <span>Limpar</span>
        </button>
      )}
    </div>

    {history.length === 0 ? (
      <p className="text-xs text-slate-400 italic py-2 text-center">Nenhum QR Code gerado recentemente.</p>
    ) : (
      <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {history.map((item) => {
          let formattedDate = '';
          try {
            formattedDate = new Date(item.date).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            });
          } catch {}

          return (
            <li
              key={item.id}
              onClick={() => onReuse(item.text, item.type)}
              className="group flex items-center justify-between gap-2 p-2 sm:p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer text-xs"
              title="Clique para reutilizar este QR Code"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <QrCode className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-slate-700 font-medium truncate group-hover:text-sky-600 transition-colors">
                    {item.text}
                  </p>
                  {formattedDate && <span className="text-[10px] text-slate-400">{formattedDate}</span>}
                </div>
              </div>
              <span className="text-[11px] font-semibold text-sky-600 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md group-hover:bg-sky-100 transition-colors shrink-0">
                Usar
              </span>
            </li>
          );
        })}
      </ul>
    )}
  </div>
);
