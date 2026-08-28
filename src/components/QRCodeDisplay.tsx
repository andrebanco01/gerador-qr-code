import React from 'react';
import { QrCode, Download, Copy, Check } from 'lucide-react';

interface QRCodeDisplayProps {
  dataUrl: string;
  content: string;
  counter: number;
  copySuccess: boolean;
  onDownload: () => void;
  onCopy: () => void;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  dataUrl,
  content,
  counter,
  copySuccess,
  onDownload,
  onCopy,
}) => (
  <div className="mt-6 pt-6 border-t border-slate-100 text-center animate-fade-in-up">
    <div className="inline-flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-full shadow-inner">
      <img
        src={dataUrl}
        alt={`QR Code gerado para ${content}`}
        className="w-56 h-56 sm:w-64 sm:h-64 object-contain bg-white rounded-xl shadow-xs border border-slate-100 p-2"
      />
      <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-600 font-semibold shadow-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>{counter.toLocaleString('pt-BR')}+ QR Codes gerados</span>
      </div>
    </div>

    <div className="mt-3 max-w-md mx-auto text-left">
      <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mb-1 px-1">
        <span className="inline-flex items-center gap-1">
          <QrCode className="w-3 h-3 text-sky-600" />
          <span>Conteúdo codificado no QR Code acima:</span>
        </span>
        <span className="text-[10px] text-slate-400 font-mono">Em visualização</span>
      </div>
      <div className="text-xs text-slate-700 truncate font-mono bg-slate-100 py-2 px-3 rounded-lg border border-slate-200 shadow-2xs select-all">
        {content}
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 max-w-md mx-auto">
      <button
        type="button"
        onClick={onDownload}
        className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition-all shadow-xs cursor-pointer"
      >
        <Download className="w-4 h-4" />
        <span>Baixar PNG</span>
      </button>
      <button
        type="button"
        onClick={onCopy}
        className={`inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-bold transition-all border shadow-xs cursor-pointer ${
          copySuccess
            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
        }`}
      >
        {copySuccess ? (
          <>
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Copiado!</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 text-slate-600" />
            <span>Copiar Conteúdo</span>
          </>
        )}
      </button>
    </div>
  </div>
);
