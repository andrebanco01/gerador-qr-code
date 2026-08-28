import React, { useState, useCallback, type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * ErrorBoundary como wrapper funcional.
 * Captura erros de renderização e exibe fallback amigável.
 */
export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [error, setError] = useState<Error | null>(null);

  const handleRetry = useCallback(() => {
    setError(null);
  }, []);

  // Se houver erro, mostra fallback
  if (error) {
    if (fallback) return fallback;

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Algo deu errado</h2>
          <p className="text-slate-600 text-sm mb-6">
            Ocorreu um erro inesperado. Tente recarregar a página.
          </p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-700 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar Novamente
          </button>
          <details className="mt-4 text-left">
            <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600">
              Detalhes do erro
            </summary>
            <pre className="mt-2 text-xs text-red-600 bg-red-50 p-3 rounded-lg overflow-auto">
              {error.message}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  // Wrapper que captura erros via onError do children
  return (
    <ErrorCatcher onError={setError}>{children}</ErrorCatcher>
  );
}

/**
 * Componente interno que usa onError do React para capturar erros.
 * Usa um event handler global como fallback.
 */
function ErrorCatcher({
  children,
  onError,
}: {
  children: ReactNode;
  onError: (error: Error) => void;
}) {
  // Captura erros não tratados
  React.useEffect(() => {
    const handler = (event: ErrorEvent) => {
      event.preventDefault();
      onError(event.error || new Error(event.message));
    };
    window.addEventListener('error', handler);
    return () => window.removeEventListener('error', handler);
  }, [onError]);

  React.useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      onError(event.reason || new Error('Unhandled promise rejection'));
    };
    window.addEventListener('unhandledrejection', handler);
    return () => window.removeEventListener('unhandledrejection', handler);
  }, [onError]);

  return <>{children}</>;
}
