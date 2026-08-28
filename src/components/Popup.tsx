import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface PopupProps {
  message: string | null;
  onDone?: () => void;
}

export const Popup: React.FC<PopupProps> = ({ message, onDone }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (message) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onDone?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [message, onDone]);

  if (!show || !message) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
      <div className="bg-white border border-emerald-200 rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-3 animate-pop-in pointer-events-none">
        <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
        <span className="text-sm font-bold text-slate-900">{message}</span>
      </div>
    </div>
  );
};
