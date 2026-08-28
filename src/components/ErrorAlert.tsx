import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message }) => (
  <div
    role="alert"
    className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm font-medium animate-fade-in-up"
  >
    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
    <span>{message}</span>
  </div>
);
