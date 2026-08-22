import React, { useState, useEffect, useCallback, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Download,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Zap,
  Globe,
  MessageCircle,
  Wifi,
  Trash2,
  Clock,
  ChevronDown,
  AlertCircle,
  X,
  CreditCard,
  FileText,
  Lock,
  User,
  MapPin,
  DollarSign,
  Hash,
  Eye,
  EyeOff,
} from 'lucide-react';
import { BannerSlot } from './components/BannerSlot';

interface HistoryItem {
  id: string;
  text: string;
  type: 'url' | 'pix' | 'whatsapp' | 'wifi' | 'text';
  date: string;
}

// Funções para geração do padrão oficial BACEN EMV (PIX Estático)
function formatEMV(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

function crc16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function generatePixBRCode({
  key,
  name,
  city,
  amount,
  txid = '***',
}: {
  key: string;
  name?: string;
  city?: string;
  amount?: string;
  txid?: string;
}): string {
  const cleanKey = key.trim();
  const cleanName = (name || 'RECEBEDOR')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .substring(0, 25);
  const cleanCity = (city || 'SAO PAULO')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .substring(0, 15);
  const cleanTxid = (txid || '***').trim().substring(0, 25) || '***';

  const merchantAccountInfo =
    formatEMV('00', 'br.gov.bcb.pix') + formatEMV('01', cleanKey);

  let payload =
    formatEMV('00', '01') +
    formatEMV('26', merchantAccountInfo) +
    formatEMV('52', '0000') +
    formatEMV('53', '986');

  if (amount && parseFloat(amount) > 0) {
    const formattedAmount = parseFloat(amount).toFixed(2);
    payload += formatEMV('54', formattedAmount);
  }

  payload +=
    formatEMV('58', 'BR') +
    formatEMV('59', cleanName.toUpperCase()) +
    formatEMV('60', cleanCity.toUpperCase()) +
    formatEMV('62', formatEMV('05', cleanTxid));

  payload += '6304';
  payload += crc16(payload);

  return payload;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'url' | 'pix' | 'whatsapp' | 'wifi' | 'text'>('url');
  
  // Inputs separados para cada tipo de conteúdo
  // 1. URL
  const [urlInput, setUrlInput] = useState('');

  // 2. PIX (Campos separados conforme padrão bancário)
  const [pixKeyType, setPixKeyType] = useState<'cpf' | 'cnpj' | 'email' | 'phone' | 'random'>('email');
  const [pixKey, setPixKey] = useState('');
  const [pixName, setPixName] = useState('');
  const [pixCity, setPixCity] = useState('');
  const [pixAmount, setPixAmount] = useState('');
  const [pixTxid, setPixTxid] = useState('');

  // 3. WhatsApp (Campos separados)
  const [waCountryCode, setWaCountryCode] = useState('55');
  const [waPhone, setWaPhone] = useState('');
  const [waMessage, setWaMessage] = useState('');

  // 4. Wi-Fi (Campos separados)
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [wifiType, setWifiType] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);
  const [showWifiPass, setShowWifiPass] = useState(false);

  // 5. Texto Livre
  const [plainText, setPlainText] = useState('');

  // Estado geral do QR Code
  const [generatedContent, setGeneratedContent] = useState('');
  const [dataUrl, setDataUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Contador local
  const [counter, setCounter] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('qr_gen_counter');
      return saved ? parseInt(saved, 10) : 10540;
    } catch {
      return 10540;
    }
  });

  // Histórico
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('qr_history_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.slice(0, 10);
        }
      }
    } catch (e) {
      console.warn('Erro ao ler histórico:', e);
    }
    return [];
  });

  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  // Salvar no localStorage
  useEffect(() => {
    try {
      localStorage.setItem('qr_history_items', JSON.stringify(history));
    } catch (e) {
      console.warn('Erro ao salvar histórico:', e);
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem('qr_gen_counter', counter.toString());
    } catch (e) {
      console.warn('Erro ao salvar contador:', e);
    }
  }, [counter]);

  // Gerar QR Code
  const handleGenerate = useCallback(
    async (overrideContent?: string, itemType?: 'url' | 'pix' | 'whatsapp' | 'wifi' | 'text') => {
      const currentTab = itemType || activeTab;
      let content = '';

      if (overrideContent !== undefined) {
        content = overrideContent.trim();
      } else {
        if (currentTab === 'url') {
          if (!urlInput.trim()) {
            setError('Por favor, informe a URL ou link do site.');
            return;
          }
          let formattedUrl = urlInput.trim();
          if (!/^https?:\/\//i.test(formattedUrl)) {
            formattedUrl = `https://${formattedUrl}`;
          }
          content = formattedUrl;
        } else if (currentTab === 'pix') {
          if (!pixKey.trim()) {
            setError('Por favor, informe a chave PIX do beneficiário.');
            return;
          }
          if (!pixName.trim()) {
            setError('Por favor, informe o nome do beneficiário do PIX.');
            return;
          }
          content = generatePixBRCode({
            key: pixKey.trim(),
            name: pixName.trim(),
            city: pixCity.trim() || 'SAO PAULO',
            amount: pixAmount.trim(),
            txid: pixTxid.trim() || '***',
          });
        } else if (currentTab === 'whatsapp') {
          const cleanPhone = waPhone.replace(/\D/g, '');
          if (!cleanPhone) {
            setError('Por favor, digite o número do WhatsApp com DDD.');
            return;
          }
          const fullPhone = `${waCountryCode.replace(/\D/g, '')}${cleanPhone}`;
          const encodedMsg = waMessage.trim() ? `?text=${encodeURIComponent(waMessage.trim())}` : '';
          content = `https://wa.me/${fullPhone}${encodedMsg}`;
        } else if (currentTab === 'wifi') {
          if (!wifiSsid.trim()) {
            setError('Por favor, informe o nome da rede Wi-Fi (SSID).');
            return;
          }
          const hiddenParam = wifiHidden ? 'H:true;' : '';
          content = `WIFI:S:${wifiSsid.trim()};T:${wifiType};P:${wifiPass.trim()};${hiddenParam};`;
        } else if (currentTab === 'text') {
          if (!plainText.trim()) {
            setError('Por favor, insira o texto a ser codificado no QR Code.');
            return;
          }
          content = plainText.trim();
        }
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
        const url = await QRCode.toDataURL(content, {
          width: 560,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'H',
        });

        setDataUrl(url);
        setGeneratedContent(content);
        setCounter((prev) => prev + 1);

        setHistory((prev) => {
          const filtered = prev.filter((item) => item.text !== content);
          const newItem: HistoryItem = {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            text: content,
            type: currentTab,
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
    [
      activeTab,
      urlInput,
      pixKey,
      pixName,
      pixCity,
      pixAmount,
      pixTxid,
      waCountryCode,
      waPhone,
      waMessage,
      wifiSsid,
      wifiPass,
      wifiType,
      wifiHidden,
      plainText,
      showToast,
    ]
  );

  // Download QR Code PNG
  const handleDownload = () => {
    if (!dataUrl) return;
    try {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `qrcode_${timestamp}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('Download do arquivo PNG iniciado!');
    } catch (err) {
      setError('Erro ao iniciar o download da imagem.');
    }
  };

  // Copiar Conteúdo
  const handleCopyContent = async () => {
    if (!generatedContent) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(generatedContent);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = generatedContent;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopySuccess(true);
      showToast('Conteúdo copiado com sucesso!');
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      setError('Não foi possível copiar automaticamente.');
    }
  };

  // Limpar Histórico
  const handleClearHistory = () => {
    if (history.length === 0) return;
    if (window.confirm('Tem certeza que deseja limpar todo o histórico?')) {
      setHistory([]);
      try {
        localStorage.removeItem('qr_history_items');
      } catch {}
      showToast('Histórico limpo.');
    }
  };

  const faqs = [
    {
      q: 'O gerador de QR Code é realmente 100% gratuito?',
      a: 'Sim! Nossa ferramenta é totalmente gratuita, sem necessidade de cadastro, plano pago ou cartão de crédito. Você pode gerar quantos códigos precisar.',
    },
    {
      q: 'Os QR Codes gerados têm limite de leitura ou data de validade?',
      a: 'Não. Os QR Codes são estáticos: as informações ficam gravadas diretamente nos módulos do código. Eles nunca expiram e aceitam leituras ilimitadas.',
    },
    {
      q: 'Como funciona o QR Code PIX (Padrão Banco Central)?',
      a: 'Nosso gerador cria o código no formato oficial BR Code EMV do Banco Central. Qualquer aplicativo bancário brasileiro (Nubank, Itaú, Bradesco, Inter, Caixa, etc.) reconhece o recebedor, a cidade e o valor instantaneamente.',
    },
    {
      q: 'Qual é a resolução da imagem PNG baixada?',
      a: 'A imagem é exportada em alta definição (560x560 pixels com correção de erro nível H), perfeita para impressão nítida em cardápios, placas, cartões e vitrines.',
    },
    {
      q: 'Meus dados ficam salvos em algum servidor?',
      a: 'Não. Todo o processamento ocorre localmente no seu navegador (Client-Side). Nenhuma informação, chave PIX ou senha é enviada a servidores externos.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-between font-sans selection:bg-sky-500 selection:text-white">
      {/* Toast Feedback */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium shadow-xl flex items-center gap-2 border border-slate-700 animate-fade-in-up">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Banner Estático Topo */}
      <div className="w-full max-w-2xl px-4 pt-4 sm:pt-6">
        <BannerSlot
          id="banner-slot-top"
          position="top"
          imageUrl="/bannertopo.jpg"
          targetUrl="https://apretailer.com.br/click/69f971422bfa811fa651f598/184804/249927/"
          badgeText="Oferta em Destaque"
          title="Promoções e Benefícios Exclusivos"
          subtitle="Aproveite condições especiais e descontos selecionados para você hoje."
          buttonText="Acessar Oferta"
          altText="Oferta em Destaque"
        />
      </div>

      {/* Header Container */}
      <header className="w-full max-w-2xl text-center pt-4 sm:pt-6 pb-3 px-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>Ferramenta Oficial & Gratuita</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          Gerador de <span className="text-sky-600">QR Code</span> Online
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-md mx-auto">
          Crie QR Codes profissionais para sites, PIX, WhatsApp, redes Wi-Fi e textos em segundos.
        </p>

        {/* Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Zap className="w-3.5 h-3.5 text-emerald-500" /> 100% Grátis
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <Globe className="w-3.5 h-3.5 text-sky-500" /> Sem Cadastro
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> Seguro & Privado
          </span>
        </div>
      </header>

      {/* Main Form & QR Box */}
      <main className="w-full max-w-2xl px-4 py-4 space-y-6">
        <section className="bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 sm:p-7">
          {/* Quick Categories Navigation (5 Tipos com Botões Individuais) */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              Escolha o Tipo de Conteúdo:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('url');
                  setError(null);
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  activeTab === 'url'
                    ? 'bg-sky-50 text-sky-700 border-sky-300 ring-2 ring-sky-100 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Link / URL</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('pix');
                  setError(null);
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  activeTab === 'pix'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-100 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">PIX</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('whatsapp');
                  setError(null);
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  activeTab === 'whatsapp'
                    ? 'bg-[#e6f4ea] text-[#0f5132] border-[#a3d9b8] ring-2 ring-emerald-100 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#198754] shrink-0" />
                <span className="truncate">WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('wifi');
                  setError(null);
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  activeTab === 'wifi'
                    ? 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-100 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Wifi className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">Wi-Fi</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('text');
                  setError(null);
                }}
                className={`col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  activeTab === 'text'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-100 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">Texto</span>
              </button>
            </div>
          </div>

          {/* Form Content - Todos os campos com inputs separados */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate();
            }}
            className="space-y-4"
          >
            {/* 1. ABA LINK / URL */}
            {activeTab === 'url' && (
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
                      value={urlInput}
                      onChange={(e) => {
                        setUrlInput(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="https://seusite.com.br"
                      className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none text-slate-800 placeholder:text-slate-400 text-sm font-medium transition-all"
                    />
                    {urlInput && (
                      <button
                        type="button"
                        onClick={() => setUrlInput('')}
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
            )}

            {/* 2. ABA PIX (Formulário estruturado com inputs separados) */}
            {activeTab === 'pix' && (
              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200/70">
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    Dados do PIX (Padrão Banco Central)
                  </span>
                  <span className="text-[11px] text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md font-semibold">
                    BR Code EMV
                  </span>
                </div>

                {/* Input Separado: Tipo de Chave & Chave PIX */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="pix-type" className="block text-xs font-bold text-emerald-900 mb-1">
                      Tipo de Chave:
                    </label>
                    <select
                      id="pix-type"
                      value={pixKeyType}
                      onChange={(e) => setPixKeyType(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-white border border-emerald-300 rounded-lg text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 cursor-pointer"
                    >
                      <option value="email">E-mail</option>
                      <option value="cpf">CPF / CNPJ</option>
                      <option value="phone">Telefone / Celular</option>
                      <option value="random">Chave Aleatória (EVP)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="pix-key" className="block text-xs font-bold text-emerald-900 mb-1">
                      Chave PIX:*
                    </label>
                    <input
                      id="pix-key"
                      type="text"
                      value={pixKey}
                      onChange={(e) => setPixKey(e.target.value)}
                      placeholder={
                        pixKeyType === 'email'
                          ? 'ex: contato@seusite.com.br'
                          : pixKeyType === 'cpf'
                          ? 'ex: 123.456.789-00'
                          : pixKeyType === 'phone'
                          ? 'ex: 11999998888'
                          : 'ex: 123e4567-e89b-12d3-a456-426614174000'
                      }
                      className="w-full px-3 py-2.5 bg-white border border-emerald-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                    />
                  </div>
                </div>

                {/* Input Separado: Nome do Beneficiário */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="pix-name" className="block text-xs font-bold text-emerald-900 mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Nome do Beneficiário:*</span>
                    </label>
                    <input
                      id="pix-name"
                      type="text"
                      maxLength={25}
                      value={pixName}
                      onChange={(e) => setPixName(e.target.value)}
                      placeholder="ex: João da Silva ou Sua Loja"
                      className="w-full px-3 py-2.5 bg-white border border-emerald-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                    />
                  </div>

                  {/* Input Separado: Cidade do Beneficiário */}
                  <div>
                    <label htmlFor="pix-city" className="block text-xs font-bold text-emerald-900 mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Cidade:*</span>
                    </label>
                    <input
                      id="pix-city"
                      type="text"
                      maxLength={15}
                      value={pixCity}
                      onChange={(e) => setPixCity(e.target.value)}
                      placeholder="ex: São Paulo"
                      className="w-full px-3 py-2.5 bg-white border border-emerald-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                    />
                  </div>
                </div>

                {/* Input Separado: Valor em R$ e Identificador TXID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="pix-amount" className="block text-xs font-bold text-emerald-900 mb-1 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Valor em R$ (Opcional):</span>
                    </label>
                    <input
                      id="pix-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={pixAmount}
                      onChange={(e) => setPixAmount(e.target.value)}
                      placeholder="Deixe em branco para valor livre"
                      className="w-full px-3 py-2.5 bg-white border border-emerald-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                    />
                  </div>

                  <div>
                    <label htmlFor="pix-txid" className="block text-xs font-bold text-emerald-900 mb-1 flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Código de Identificação / TXID (Opcional):</span>
                    </label>
                    <input
                      id="pix-txid"
                      type="text"
                      maxLength={25}
                      value={pixTxid}
                      onChange={(e) => setPixTxid(e.target.value)}
                      placeholder="ex: PEDIDO123"
                      className="w-full px-3 py-2.5 bg-white border border-emerald-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. ABA WHATSAPP (Inputs separados para DDI, DDD+Número e Mensagem) */}
            {activeTab === 'whatsapp' && (
              <div className="p-4 bg-emerald-50/50 border border-[#a3d9b8] rounded-xl space-y-3.5">
                <div className="pb-2 border-b border-emerald-200/70">
                  <span className="text-xs font-bold text-[#0f5132] uppercase tracking-wider flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-[#198754]" />
                    Conversa no WhatsApp
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {/* Input Separado: Código do País (DDI) */}
                  <div>
                    <label htmlFor="wa-country" className="block text-xs font-bold text-[#0f5132] mb-1">
                      DDI (País):
                    </label>
                    <input
                      id="wa-country"
                      type="text"
                      value={waCountryCode}
                      onChange={(e) => setWaCountryCode(e.target.value)}
                      placeholder="55"
                      className="w-full px-3 py-2.5 bg-white border border-[#a3d9b8] rounded-lg text-xs sm:text-sm text-center font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-800"
                    />
                  </div>

                  {/* Input Separado: DDD e Telefone */}
                  <div className="sm:col-span-3">
                    <label htmlFor="wa-phone" className="block text-xs font-bold text-[#0f5132] mb-1">
                      DDD + Número do Celular:*
                    </label>
                    <input
                      id="wa-phone"
                      type="tel"
                      value={waPhone}
                      onChange={(e) => setWaPhone(e.target.value)}
                      placeholder="ex: 11999998888"
                      className="w-full px-3 py-2.5 bg-white border border-[#a3d9b8] rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-800"
                    />
                  </div>
                </div>

                {/* Input Separado: Mensagem Pré-definida */}
                <div>
                  <label htmlFor="wa-msg" className="block text-xs font-bold text-[#0f5132] mb-1">
                    Mensagem Pré-configurada (Opcional):
                  </label>
                  <textarea
                    id="wa-msg"
                    rows={2}
                    value={waMessage}
                    onChange={(e) => setWaMessage(e.target.value)}
                    placeholder="ex: Olá! Gostaria de saber mais sobre os produtos..."
                    className="w-full px-3 py-2.5 bg-white border border-[#a3d9b8] rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-800 resize-none"
                  />
                  <p className="text-[11px] text-[#0f5132]/80 mt-1">
                    Ao escanear, o WhatsApp abrirá a conversa com este texto pronto para envio.
                  </p>
                </div>
              </div>
            )}

            {/* 4. ABA WI-FI (Inputs separados para SSID, Senha, Criptografia e Oculta) */}
            {activeTab === 'wifi' && (
              <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-3.5">
                <div className="pb-2 border-b border-amber-200/70">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Wifi className="w-4 h-4 text-amber-600" />
                    Conexão Wi-Fi Instantânea
                  </span>
                </div>

                {/* Input Separado: Nome da Rede (SSID) */}
                <div>
                  <label htmlFor="wifi-ssid" className="block text-xs font-bold text-amber-900 mb-1">
                    Nome da Rede (SSID):*
                  </label>
                  <input
                    id="wifi-ssid"
                    type="text"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    placeholder="ex: Casa_5G ou Cafe_Clientes"
                    className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
                  />
                </div>

                {/* Inputs Separados: Senha e Criptografia */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="wifi-pass" className="block text-xs font-bold text-amber-900 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-amber-700" />
                        Senha da Rede:
                      </span>
                      {wifiPass && (
                        <button
                          type="button"
                          onClick={() => setShowWifiPass(!showWifiPass)}
                          className="text-[11px] text-amber-800 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          {showWifiPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{showWifiPass ? 'Ocultar' : 'Mostrar'}</span>
                        </button>
                      )}
                    </label>
                    <input
                      id="wifi-pass"
                      type={showWifiPass ? 'text' : 'password'}
                      value={wifiPass}
                      onChange={(e) => setWifiPass(e.target.value)}
                      placeholder={wifiType === 'nopass' ? 'Rede aberta (sem senha)' : 'Digite a senha do Wi-Fi'}
                      disabled={wifiType === 'nopass'}
                      className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label htmlFor="wifi-type" className="block text-xs font-bold text-amber-900 mb-1">
                      Tipo de Segurança:
                    </label>
                    <select
                      id="wifi-type"
                      value={wifiType}
                      onChange={(e) => setWifiType(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 cursor-pointer"
                    >
                      <option value="WPA">WPA / WPA2 / WPA3 (Padrão)</option>
                      <option value="WEP">WEP (Antigo)</option>
                      <option value="nopass">Sem Senha (Aberta)</option>
                    </select>
                  </div>
                </div>

                {/* Input Separado: Checkbox de Rede Oculta */}
                <div className="pt-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-amber-900">
                    <input
                      type="checkbox"
                      checked={wifiHidden}
                      onChange={(e) => setWifiHidden(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-amber-300"
                    />
                    <span>Esta é uma rede oculta (não transmite o SSID publicamente)</span>
                  </label>
                </div>
              </div>
            )}

            {/* 5. ABA TEXTO LIVRE */}
            {activeTab === 'text' && (
              <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-xl space-y-3">
                <div>
                  <label htmlFor="plain-text-input" className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      Texto Livre / Mensagem:
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {plainText.length} caracteres
                    </span>
                  </label>
                  <textarea
                    id="plain-text-input"
                    rows={4}
                    value={plainText}
                    onChange={(e) => {
                      setPlainText(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Digite aqui o texto, anotação, código de barras ou mensagem que deseja gravar no QR Code..."
                    className="w-full p-3.5 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none text-slate-800 placeholder:text-slate-400 text-sm font-normal transition-all"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Qualquer smartphone que ler o código exibirá este texto exatamente como escrito.
                  </p>
                </div>
              </div>
            )}

            {/* Mensagem de Erro */}
            {error && (
              <div
                role="alert"
                className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm font-medium animate-fade-in-up"
              >
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Botão Principal de Geração */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-white bg-sky-600 hover:bg-sky-700 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-sky-600/20 transition-all cursor-pointer text-base"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Gerando QR Code...</span>
                </>
              ) : (
                <>
                  <QrCode className="w-5 h-5" />
                  <span>Gerar QR Code</span>
                </>
              )}
            </button>
          </form>

          {/* Exibição do QR Code e Ações de Exportação */}
          {dataUrl && (
            <div className="mt-6 pt-6 border-t border-slate-100 text-center animate-fade-in-up">
              <div className="inline-flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-full shadow-inner">
                <img
                  src={dataUrl}
                  alt={`QR Code gerado para ${generatedContent}`}
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain bg-white rounded-xl shadow-xs border border-slate-100 p-2"
                />
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-600 font-semibold shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{counter.toLocaleString('pt-BR')}+ QR Codes gerados</span>
                </div>
              </div>

              {/* Prévia do Conteúdo Codificado */}
              <div className="mt-3 max-w-md mx-auto text-xs text-slate-500 truncate font-mono bg-slate-100 py-1.5 px-3 rounded-lg border border-slate-200">
                {generatedContent}
              </div>

              {/* Botões de Ação (Baixar PNG e Copiar Conteúdo) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition-all shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar PNG</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyContent}
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
          )}

          {/* Histórico Recente */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                <span>Histórico Recente (Últimos 10)</span>
              </div>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
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
                    const d = new Date(item.date);
                    formattedDate = d.toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                  } catch {}

                  return (
                    <li
                      key={item.id}
                      onClick={() => {
                        handleGenerate(item.text, item.type);
                      }}
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
        </section>

        {/* Banner Estático Central (Após Histórico Recente) */}
        <BannerSlot
          id="banner-slot-middle"
          position="middle"
          imageUrl="/bannermeio.png"
          targetUrl="https://apretailer.com.br/click/686b1a812bfa81137568adf2/183859/249927/"
          badgeText="Recomendação Especial"
          title="Oportunidades e Descontos Imperdíveis"
          subtitle="Explore produtos e serviços com as melhores condições e entrega garantida."
          buttonText="Conferir Agora"
          altText="Recomendação Especial"
        />

        {/* Guia & Perguntas Frequentes */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-6 text-slate-700 text-sm leading-relaxed shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              O que é um QR Code e como utilizá-lo?
            </h2>
            <p className="mt-2 text-slate-600">
              O <strong>QR Code (Quick Response Code)</strong> é um código matricial bidimensional desenvolvido para
              armazenar dados lidos por câmeras de smartphones. Ideal para pagamentos instantâneos com PIX (BR Code oficial),
              links para sites, conexões Wi-Fi imediatas e direcionamento para WhatsApp.
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">Vantagens Desta Ferramenta</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <li className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>
                  <strong>Padrão PIX BACEN:</strong> Compatível com todos os bancos brasileiros.
                </span>
              </li>
              <li className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>
                  <strong>Alta Resolução:</strong> Arquivos PNG em 560x560px prontos para impressão gráfica.
                </span>
              </li>
              <li className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>
                  <strong>Não Expira:</strong> Códigos estáticos permanentes que funcionam para sempre.
                </span>
              </li>
              <li className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>
                  <strong>100% Seguro e Privado:</strong> Processamento executado no seu navegador.
                </span>
              </li>
            </ul>
          </div>

          {/* Acordeão FAQ */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-3">Perguntas Frequentes (FAQ)</h3>
            <div className="space-y-2">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-3.5 text-left font-semibold text-slate-800 hover:bg-slate-100/70 transition-colors cursor-pointer text-xs sm:text-sm"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                        openFaq === idx ? 'rotate-180 text-sky-600' : ''
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="p-3.5 pt-0 text-xs sm:text-sm text-slate-600 bg-white border-t border-slate-100 animate-fade-in-up">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-slate-900 text-slate-400 py-8 px-4 mt-8 border-t border-slate-800 text-center text-xs">
        <div className="max-w-2xl mx-auto space-y-2">
          <p className="text-slate-400">
            © {new Date().getFullYear()} Gerador de QR Code Online. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
