import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [message]);

  if (!message || !visible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-slate-900 text-white px-3 py-1.5 rounded-full text-[11px] font-semibold shadow-lg flex items-center gap-1.5 border border-slate-700 animate-fade-in-up">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
      <span>{message}</span>
    </div>
  );
};
