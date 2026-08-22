import { useState, useEffect, useRef, useCallback } from 'react';
import QRCodeLib from 'qrcode';

export interface HistoryItem {
  id: string;
  text: string;
  date: string;
  dataUrl?: string;
}

export function useQRCode() {
  const [text, setText] = useState('https://gerador-qr-code.vercel.app/');
  const [generatedContent, setGeneratedContent] = useState('https://gerador-qr-code.vercel.app/');
  const [dataUrl, setDataUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [counter, setCounter] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('qrCounter');
      return saved ? parseInt(saved, 10) : 10000;
    } catch {
      return 10000;
    }
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('qrHistory');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((item, idx) => {
            if (typeof item === 'string') {
              return {
                id: `legacy-${idx}-${Date.now()}`,
                text: item,
                date: new Date().toISOString(),
              };
            }
            return {
              id: item.id || `hist-${idx}-${Date.now()}`,
              text: item.text,
              date: item.date || new Date().toISOString(),
              dataUrl: item.dataUrl,
            };
          });
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar histórico:', e);
    }
    return [];
  });

  const qrContainerRef = useRef<HTMLDivElement | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  const isValidUrl = useCallback((str: string): boolean => {
    try {
      const url = new URL(str);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }, []);

  // Salvar histórico no localStorage
  useEffect(() => {
    try {
      localStorage.setItem('qrHistory', JSON.stringify(history));
    } catch (e) {
      console.warn('Erro ao salvar histórico:', e);
    }
  }, [history]);

  // Salvar contador no localStorage
  useEffect(() => {
    try {
      localStorage.setItem('qrCounter', counter.toString());
    } catch (e) {
      console.warn('Erro ao salvar contador:', e);
    }
  }, [counter]);

  const generateQRCode = useCallback(async (contentToGenerate?: string) => {
    const targetText = (contentToGenerate !== undefined ? contentToGenerate : text).trim();

    if (!targetText) {
      setError('Por favor, insira um texto ou URL válido.');
      return;
    }

    if (targetText.length > 2000) {
      setError('Texto muito longo. Use menos de 2000 caracteres.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // Gera Data URL em alta resolução (width: 560px para nitidez 2x em telas retina)
      const url = await QRCodeLib.toDataURL(targetText, {
        width: 560,
        margin: 2,
        color: {
          dark: '#1a1a1a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      });

      setDataUrl(url);
      setGeneratedContent(targetText);

      // Incrementa contador
      setCounter((prev) => prev + 1);

      // Atualiza histórico com últimos 10 itens
      setHistory((prev) => {
        const filtered = prev.filter((item) => item.text !== targetText);
        const newItem: HistoryItem = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          text: targetText,
          date: new Date().toISOString(),
          dataUrl: url,
        };
        return [newItem, ...filtered].slice(0, 10);
      });

      setTimeout(() => {
        setIsLoading(false);
      }, 100);
    } catch (err: any) {
      setIsLoading(false);
      setError('Erro ao gerar o QR Code: ' + (err.message || 'Tente novamente.'));
      console.error('QRCode Generation Error:', err);
    }
  }, [text]);

  // Gerar o primeiro QR Code na montagem
  useEffect(() => {
    generateQRCode('https://gerador-qr-code.vercel.app/');
  }, []);

  const downloadQRCode = useCallback(() => {
    if (!dataUrl) {
      setError('Nenhum QR Code gerado para download.');
      return;
    }

    try {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `qrcode_${timestamp}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('Download do PNG iniciado com sucesso!');
    } catch (err: any) {
      setError('Erro ao baixar o QR Code: ' + (err.message || 'Tente novamente.'));
    }
  }, [dataUrl, showToast]);

  const copyContent = useCallback(async () => {
    if (!generatedContent) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(generatedContent);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = generatedContent;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (!successful) throw new Error('Falha no comando de cópia fallback.');
      }

      setCopySuccess(true);
      showToast('Conteúdo copiado para a área de transferência!');
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      setError('Não foi possível copiar o conteúdo automaticamente.');
    }
  }, [generatedContent, showToast]);

  const generatePIX = useCallback(() => {
    const chave = prompt('Digite sua chave PIX (CPF, CNPJ, email, telefone ou aleatória):');
    if (chave === null) return;

    const chaveLimpa = chave.trim();
    if (!chaveLimpa) {
      setError('Chave PIX inválida ou vazia.');
      return;
    }

    setText(chaveLimpa);
    generateQRCode(chaveLimpa);
    showToast('QR Code PIX gerado!');
  }, [generateQRCode, showToast]);

  const generateWhatsApp = useCallback(() => {
    const numero = prompt('Digite o número do WhatsApp (com DDD, ex: 11999999999):');
    if (numero === null) return;

    const numeroLimpo = numero.replace(/\D/g, '');
    if (!numeroLimpo) {
      setError('Número de WhatsApp inválido ou vazio.');
      return;
    }

    const numeroFinal = numeroLimpo.length <= 11 && !numeroLimpo.startsWith('55')
      ? `55${numeroLimpo}`
      : numeroLimpo;

    const whatsappUrl = `https://wa.me/${numeroFinal}`;
    setText(whatsappUrl);
    generateQRCode(whatsappUrl);
    showToast('QR Code do WhatsApp gerado!');
  }, [generateQRCode, showToast]);

  const clearHistory = useCallback(() => {
    if (history.length === 0) {
      showToast('O histórico já está vazio.');
      return;
    }

    if (confirm('Tem certeza que deseja limpar todo o histórico de QR Codes?')) {
      setHistory([]);
      try {
        localStorage.removeItem('qrHistory');
      } catch {}
      showToast('Histórico limpo.');
    }
  }, [history.length, showToast]);

  return {
    text,
    setText,
    generatedContent,
    dataUrl,
    isLoading,
    error,
    setError,
    toast,
    copySuccess,
    counter,
    history,
    qrContainerRef,
    isValidUrl,
    generateQRCode,
    downloadQRCode,
    copyContent,
    generatePIX,
    generateWhatsApp,
    clearHistory,
    showToast,
  };
}
