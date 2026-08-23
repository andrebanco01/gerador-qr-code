"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { QrCode, Download, Copy, Share2, Trash2, Smartphone, MessageCircle, AlertCircle, CheckCircle2 } from "lucide-react";

export default function Page() {
  const [input, setInput] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const storedHistory = localStorage.getItem("qrHistory");
        return storedHistory ? JSON.parse(storedHistory) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [count, setCount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const storedCount = localStorage.getItem("qrCount");
        return storedCount ? parseInt(storedCount, 10) : 0;
      } catch (e) {
        return 0;
      }
    }
    return 0;
  });
  const [copySuccess, setCopySuccess] = useState(false);

  const saveCount = (newCount: number) => {
    setCount(newCount);
    localStorage.setItem("qrCount", newCount.toString());
  };

  const generateQR = async (text: string) => {
    if (!text.trim()) {
      setError("Por favor, insira um texto ou URL válido.");
      setQrDataUrl("");
      return;
    }

    setError("");
    try {
      const url = await QRCode.toDataURL(text, { 
        width: 300, 
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      setQrDataUrl(url);
      saveCount(count + 1);
      
      const updatedHistory = [text, ...history.filter(h => h !== text)].slice(0, 5);
      setHistory(updatedHistory);
      localStorage.setItem("qrHistory", JSON.stringify(updatedHistory));
    } catch (err) {
      setError("Erro ao gerar QR Code. Tente novamente.");
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateQR(input);
  };

  const handlePixClick = () => {
    const pixPayload = "00020101021126330014br.gov.bcb.pix0111SEUTELEFONE5204000053039865802BR5913NOME RECEBEDOR6008BRASILIA62070503***63041D3D";
    setInput(pixPayload);
    generateQR(pixPayload);
  };

  const handleWhatsAppClick = () => {
    const waLink = "https://wa.me/5511999999999?text=Olá!";
    setInput(waLink);
    generateQR(waLink);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async () => {
    if (!qrDataUrl) return;
    try {
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Erro ao copiar imagem:", err);
      navigator.clipboard.writeText(input);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!qrDataUrl) return;
    if (navigator.share) {
      try {
        const response = await fetch(qrDataUrl);
        const blob = await response.blob();
        const file = new File([blob], 'qrcode.png', { type: 'image/png' });
        await navigator.share({
          title: 'Meu QR Code',
          text: 'Confira este QR Code gerado gratuitamente!',
          files: [file]
        });
      } catch (err) {
        console.error("Erro ao compartilhar:", err);
      }
    } else {
      alert("Compartilhamento nativo não suportado neste navegador.");
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("qrHistory");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b border-gray-200 py-12 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Gerador de QR Code Gratuito
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-6">
            Crie QR Codes Instantaneamente para links, textos, PIX, WhatsApp e muito mais.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">100% Grátis</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Sem Cadastro</span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">Seguro</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-12 grid gap-12">
        <section className="tool-section bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-10 grid md:grid-cols-2 gap-10 items-start">
          <div className="space-y-6">
            <form role="form" onSubmit={handleFormSubmit} aria-label="Formulário de criação de QR Code">
              <label htmlFor="qr-input" className="visually-hidden sr-only">Insira sua URL ou Texto</label>
              <div className="relative">
                <textarea
                  id="qr-input"
                  className="w-full min-h-[120px] p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y text-gray-900 text-lg shadow-sm"
                  placeholder="https://exemplo.com ou qualquer texto..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  aria-required="true"
                  autoFocus
                />
              </div>
              
              <div aria-live="polite" className="mt-2 min-h-[24px]">
                {error && (
                  <div className="flex items-center text-red-600 text-sm font-medium">
                    <AlertCircle className="w-4 h-4 mr-1.5" />
                    {error}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl transition-colors duration-200 shadow-sm flex justify-center items-center text-lg"
              >
                <QrCode className="w-6 h-6 mr-2" />
                Gerar QR Code
              </button>
            </form>

            <div className="pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-3 font-medium">Botões rápidos:</p>
              <div className="flex gap-3">
                <button onClick={handlePixClick} className="flex-1 flex justify-center items-center py-2.5 px-4 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-sm font-semibold transition-colors">
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Code para PIX
                </button>
                <button onClick={handleWhatsAppClick} className="flex-1 flex justify-center items-center py-2.5 px-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-semibold transition-colors">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  QR Code WhatsApp
                </button>
              </div>
            </div>

            {history.length > 0 && (
              <div className="pt-6 border-t border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm text-gray-500 font-medium">Seu Histórico (Local):</p>
                  <button onClick={clearHistory} className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center">
                    <Trash2 className="w-3 h-3 mr-1" /> Limpar
                  </button>
                </div>
                <ul className="space-y-2">
                  {history.map((item, idx) => (
                    <li key={idx}>
                      <button 
                        onClick={() => {
                          setInput(item);
                          generateQR(item);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg truncate transition-colors"
                        title={item}
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 flex flex-col items-center justify-center min-h-[400px]">
            {qrDataUrl ? (
              <div className="flex flex-col items-center w-full animate-in fade-in zoom-in duration-300">
                <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-200">
                  <img src={qrDataUrl} alt="QR Code Gerado" className="w-64 h-64 object-contain" />
                </div>
                
                <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  <button onClick={handleDownload} className="flex flex-col justify-center items-center py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium text-sm transition-colors shadow-sm">
                    <Download className="w-5 h-5 mb-1 text-indigo-600" />
                    Baixar PNG
                  </button>
                  <button onClick={handleCopy} className="flex flex-col justify-center items-center py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium text-sm transition-colors shadow-sm">
                    {copySuccess ? <CheckCircle2 className="w-5 h-5 mb-1 text-green-600" /> : <Copy className="w-5 h-5 mb-1 text-indigo-600" />}
                    {copySuccess ? "Copiado!" : "Copiar"}
                  </button>
                  <button onClick={handleShare} className="flex flex-col justify-center items-center py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium text-sm transition-colors shadow-sm">
                    <Share2 className="w-5 h-5 mb-1 text-indigo-600" />
                    Compartilhar
                  </button>
                </div>

                <p className="text-sm text-gray-500 font-medium flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mr-1.5" />
                  {count} QR Codes gerados no total
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <QrCode className="w-24 h-24 mb-4 opacity-50" />
                <p className="text-center font-medium">Seu QR Code aparecerá aqui</p>
              </div>
            )}
          </div>
        </section>

        <section className="seo-content prose prose-indigo max-w-none text-gray-700 bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">O que é um QR Code e como usar?</h2>
          <p>O QR Code (Quick Response Code) é um código de barras bidimensional que pode ser facilmente escaneado usando a maioria dos smartphones equipados com câmera. Ele é capaz de armazenar uma grande quantidade de informações, como URLs, textos, números de telefone e muito mais, proporcionando um acesso rápido e direto ao conteúdo digital.</p>
          
          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Como gerar QR Code para PIX</h3>
          <p>Gerar um QR Code para receber pagamentos via PIX facilita muito a vida de quem vende. Para criar o seu, clique no botão &quot;QR Code para PIX&quot;, insira a sua chave PIX no formato padrão (Payload PIX) fornecido pelo seu banco, e gere a imagem. Seus clientes só precisarão escanear para pagar.</p>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Benefícios do nosso Gerador de QR Code</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>100% Gratuito:</strong> Sem custos ocultos ou necessidade de assinaturas.</li>
            <li><strong>Sem Cadastro:</strong> Comece a usar imediatamente sem preencher formulários longos.</li>
            <li><strong>Privacidade Garantida:</strong> Todo o processamento é feito no seu navegador. Não salvamos seus dados.</li>
            <li><strong>Alta Resolução:</strong> Faça o download das imagens em PNG de alta qualidade.</li>
            <li><strong>Geração Instantânea:</strong> Seu QR Code é gerado em milissegundos.</li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Para que serve um QR Code?</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Compartilhamento de links para sites e redes sociais.</li>
            <li>Facilitar pagamentos instantâneos (ex: PIX).</li>
            <li>Redirecionamento para conversas no WhatsApp (Link Direto).</li>
            <li>Acesso rápido a cardápios digitais em restaurantes.</li>
            <li>Armazenamento de informações de contato (vCards) em cartões de visita.</li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Como usar o Gerador de QR Code</h3>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Digite ou cole a URL, texto, número de WhatsApp ou chave PIX no campo principal.</li>
            <li>Clique no botão &quot;Gerar QR Code&quot;.</li>
            <li>Visualize o QR Code gerado instantaneamente na tela.</li>
            <li>Clique em &quot;Baixar PNG&quot; para salvar a imagem no seu dispositivo, ou &quot;Copiar&quot; para colar onde quiser.</li>
          </ol>

          <h3 className="text-xl font-bold text-gray-900 mt-12 mb-6 border-b pb-2">Perguntas Frequentes sobre QR Code</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-gray-900">O que é um QR Code?</h4>
              <p className="mt-1">QR Code (Quick Response Code) é um código de barras bidimensional que armazena informações, podendo ser lido rapidamente por smartphones.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Como usar o Gerador de QR Code?</h4>
              <p className="mt-1">Basta digitar o texto, URL, chave PIX ou número de WhatsApp no campo indicado, clicar em gerar e baixar a imagem em PNG.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900">O Gerador de QR Code é gratuito?</h4>
              <p className="mt-1">Sim, nosso gerador é 100% gratuito, sem necessidade de cadastro ou limites de criação.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Os QR Codes gerados expiram?</h4>
              <p className="mt-1">Não. Os QR Codes gerados são estáticos e nunca expiram.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Posso usar para fins comerciais?</h4>
              <p className="mt-1">Sim, você pode usar os QR Codes gerados em materiais impressos, sites, embalagens e qualquer outra finalidade comercial sem restrições.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900">É seguro gerar QR Codes para PIX?</h4>
              <p className="mt-1">Sim, a geração é feita localmente e não armazenamos nenhuma informação pessoal ou financeira inserida.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-12 mt-auto">
        <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-sm">
              Privacidade em primeiro lugar: Seus QR Codes são gerados no seu próprio dispositivo. Não rastreamos ou armazenamos o conteúdo que você digita.
            </p>
          </div>
          <div className="flex flex-col md:items-end space-y-4">
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Política de Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
              <a href="https://wa.me/5551991251325?text=Ol%C3%A1%21%20Gostaria%20de%20conversar%20sobre%20sugest%C3%B5es%20ou%20oportunidades%20de%20neg%C3%B3cios%20com%20o%20Gerador%20de%20QR%20Code." target="_blank" rel="noopener noreferrer" aria-label="Entrar em contato via WhatsApp" className="text-green-400 hover:text-green-300 font-medium transition-colors flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4" /> WhatsApp do Desenvolvedor
              </a>
            </div>
            <p className="text-sm">
              &copy; {new Date().getFullYear()} Gerador de QR Code. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
