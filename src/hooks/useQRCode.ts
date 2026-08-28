import { useState, useEffect, useCallback, useRef } from 'react';
import QRCodeLib from 'qrcode';
import { generatePixPayload } from '../utils/pix';

export type TabType = 'url' | 'pix' | 'whatsapp' | 'wifi' | 'text';

export interface HistoryItem {
  id: string;
  text: string;
  type: TabType;
  date: string;
}

const INITIAL_COUNTER = 10000;

function buildContent(
  tab: TabType,
  fields: FormFields,
): string | null {
  switch (tab) {
    case 'url': {
      const url = fields.urlInput.trim();
      if (!url) return null;
      return /^https?:\/\//i.test(url) ? url : `https://${url}`;
    }
    case 'pix': {
      if (!fields.pixKey.trim() || !fields.pixName.trim()) return null;
      return generatePixPayload({
        key: fields.pixKey.trim(),
        name: fields.pixName.trim(),
        city: fields.pixCity.trim() || 'SAO PAULO',
        amount: fields.pixAmount.trim(),
        txid: fields.pixTxid.trim() || '***',
      });
    }
    case 'whatsapp': {
      const phone = fields.waPhone.replace(/\D/g, '');
      if (!phone) return null;
      const full = `${fields.waCountryCode.replace(/\D/g, '')}${phone}`;
      const msg = fields.waMessage.trim()
        ? `?text=${encodeURIComponent(fields.waMessage.trim())}`
        : '';
      return `https://wa.me/${full}${msg}`;
    }
    case 'wifi': {
      if (!fields.wifiSsid.trim()) return null;
      const hidden = fields.wifiHidden ? 'H:true;' : '';
      return `WIFI:S:${fields.wifiSsid.trim()};T:${fields.wifiType};P:${fields.wifiPass.trim()};${hidden};`;
    }
    case 'text': {
      return fields.plainText.trim() || null;
    }
  }
}

function getValidationMessage(tab: TabType, fields: FormFields): string | null {
  switch (tab) {
    case 'url':
      return !fields.urlInput.trim() ? 'Por favor, informe a URL ou link do site.' : null;
    case 'pix':
      if (!fields.pixKey.trim()) return 'Por favor, informe a chave PIX do beneficiário.';
      if (!fields.pixName.trim()) return 'Por favor, informe o nome do beneficiário do PIX.';
      return null;
    case 'whatsapp':
      return !fields.waPhone.replace(/\D/g, '') ? 'Por favor, digite o número do WhatsApp com DDD.' : null;
    case 'wifi':
      return !fields.wifiSsid.trim() ? 'Por favor, informe o nome da rede Wi-Fi (SSID).' : null;
    case 'text':
      return !fields.plainText.trim() ? 'Por favor, insira o texto a ser codificado no QR Code.' : null;
  }
}

export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';

export interface FormFields {
  urlInput: string;
  pixKeyType: PixKeyType;
  pixKey: string;
  pixName: string;
  pixCity: string;
  pixAmount: string;
  pixTxid: string;
  waCountryCode: string;
  waPhone: string;
  waMessage: string;
  wifiSsid: string;
  wifiPass: string;
  wifiType: 'WPA' | 'WEP' | 'nopass';
  wifiHidden: boolean;
  plainText: string;
}

export function useQRCode() {
  const [activeTab, setActiveTab] = useState<TabType>('url');
  const [fields, setFields] = useState<FormFields>({
    urlInput: '',
    pixKeyType: 'email',
    pixKey: '',
    pixName: '',
    pixCity: '',
    pixAmount: '',
    pixTxid: '',
    waCountryCode: '55',
    waPhone: '',
    waMessage: '',
    wifiSsid: '',
    wifiPass: '',
    wifiType: 'WPA',
    wifiHidden: false,
    plainText: '',
  });

  const [generatedContent, setGeneratedContent] = useState('');
  const [dataUrl, setDataUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const [counter, setCounter] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('qr_gen_counter');
      return saved ? parseInt(saved, 10) : INITIAL_COUNTER;
    } catch {
      return INITIAL_COUNTER;
    }
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('qr_history_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.slice(0, 10);
      }
    } catch {}
    return [];
  });

  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem('qr_history_items', JSON.stringify(history));
    } catch {}
  }, [history]);

  // Persist counter
  useEffect(() => {
    try {
      localStorage.setItem('qr_gen_counter', counter.toString());
    } catch {}
  }, [counter]);

  const updateField = useCallback(
    <K extends keyof FormFields>(key: K, value: FormFields[K]) => {
      setFields((prev) => ({ ...prev, [key]: value }));
      if (error) setError(null);
    },
    [error],
  );

  const generate = useCallback(
    async (overrideContent?: string, overrideTab?: TabType) => {
      const tab = overrideTab || activeTab;

      let content: string | null;
      if (overrideContent !== undefined) {
        content = overrideContent.trim();
      } else {
        const validationMsg = getValidationMessage(tab, fields);
        if (validationMsg) {
          setError(validationMsg);
          return;
        }
        content = buildContent(tab, fields);
      }

      if (!content) {
        setError('Por favor, preencha as informações para gerar o QR Code.');
        return;
      }

      if (content.length > 2500) {
        setError('O conteúdo excede o limite máximo suportado.');
        return;
      }

      setError(null);
      setIsLoading(true);

      try {
        const url = await QRCodeLib.toDataURL(content, {
          width: 560,
          margin: 2,
          color: { dark: '#0f172a', light: '#ffffff' },
          errorCorrectionLevel: 'H',
        });

        setDataUrl(url);
        setGeneratedContent(content);
        setCounter((prev) => prev + 1);

        setHistory((prev) => {
          const filtered = prev.filter((item) => item.text !== content);
          const newItem: HistoryItem = {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            text: content!,
            type: tab,
            date: new Date().toISOString(),
          };
          return [newItem, ...filtered].slice(0, 10);
        });

        showToast('QR Code gerado com sucesso!');
      } catch (err: any) {
        setError(`Erro ao gerar QR Code: ${err.message || 'Tente novamente.'}`);
      } finally {
        setIsLoading(false);
      }
    },
    [activeTab, fields, showToast],
  );

  const download = useCallback(() => {
    if (!dataUrl) return;
    try {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `qrcode_${ts}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Download do arquivo PNG iniciado!');
    } catch {
      setError('Erro ao iniciar o download da imagem.');
    }
  }, [dataUrl, showToast]);

  const copy = useCallback(async () => {
    if (!generatedContent) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(generatedContent);
      } else {
        const ta = document.createElement('textarea');
        ta.value = generatedContent;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopySuccess(true);
      showToast('Conteúdo copiado com sucesso!');
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      setError('Não foi possível copiar automaticamente.');
    }
  }, [generatedContent, showToast]);

  const clearHistory = useCallback(() => {
    if (history.length === 0) return;
    if (window.confirm('Tem certeza que deseja limpar todo o histórico?')) {
      setHistory([]);
      try {
        localStorage.removeItem('qr_history_items');
      } catch {}
      showToast('Histórico limpo.');
    }
  }, [history.length, showToast]);

  return {
    activeTab,
    setActiveTab,
    fields,
    updateField,
    generatedContent,
    dataUrl,
    isLoading,
    error,
    setError,
    toast,
    copySuccess,
    counter,
    history,
    generate,
    download,
    copy,
    clearHistory,
  };
}
