/**
 * ==========================================================================
 * QRCodeGenerator - Classe Principal de Funcionalidades
 * Gerador de QR Code com foco em SEO, Acessibilidade e Performance
 * ==========================================================================
 */

class QRCodeGenerator {
  constructor() {
    // Inicialização dos elementos do DOM
    this.form = document.getElementById("qr-form");
    this.input = document.getElementById("qr-input");
    this.errorMsg = document.getElementById("error-message");
    this.qrResultContainer = document.getElementById("qr-result-container");
    this.qrPlaceholder = document.getElementById("qr-placeholder");
    this.qrCodeDiv = document.getElementById("qr-code");
    this.historyContainer = document.getElementById("history-container");
    this.historyList = document.getElementById("history-list");
    this.qrCountSpan = document.getElementById("qr-count");
    this.btnGenerate = document.getElementById("btn-generate");

    // Botões de Ação e Rápidos
    this.btnPix = document.getElementById("btn-pix");
    this.btnWhatsapp = document.getElementById("btn-whatsapp");
    this.btnClearHistory = document.getElementById("btn-clear-history");
    this.btnDownload = document.getElementById("btn-download");
    this.btnCopy = document.getElementById("btn-copy");
    this.btnShare = document.getElementById("btn-share");

    // Estado da Aplicação
    this.currentQRCode = null;
    this.generatedText = "";
    this.qrCount = parseInt(localStorage.getItem("qrCount") || "0");
    this.qrHistory = JSON.parse(localStorage.getItem("qrHistory") || "[]");

    // Configuração Padrão do QR Code
    this.qrConfig = {
      width: 280,
      height: 280,
      colorDark: '#1a1a1a',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    };

    // Inicializar Contador e Histórico na Interface
    if (this.qrCountSpan) {
      this.qrCountSpan.textContent = this.qrCount;
    }
    this.updateHistoryUI();

    // Bind dos métodos e inicialização de Event Listeners
    this.init();
  }

  /**
   * Registra todos os Event Listeners necessários
   */
  init() {
    if (this.form) {
      this.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.generateQRCode();
      });
    }

    if (this.input) {
      // Limpa erro quando o usuário digita
      this.input.addEventListener("input", () => this.clearError());

      // Previne submit duplicado ou comportamento inadequado ao teclar Enter
      this.input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.generateQRCode();
        }
      });
    }

    // Eventos dos botões de ação do QR Code gerado
    if (this.btnDownload) {
      this.btnDownload.addEventListener("click", () => this.downloadQRCode());
    }

    if (this.btnCopy) {
      this.btnCopy.addEventListener("click", () => this.copyContent());
    }

    if (this.btnShare) {
      this.btnShare.addEventListener("click", () => this.shareQRCode());
    }

    // Eventos dos botões rápidos de conteúdo
    if (this.btnPix) {
      this.btnPix.addEventListener("click", () => {
        const pixPayload = "00020101021126330014br.gov.bcb.pix0111SEUTELEFONE5204000053039865802BR5913NOME RECEBEDOR6008BRASILIA62070503***63041D3D";
        if (this.input) this.input.value = pixPayload;
        this.generateQRCode(pixPayload);
      });
    }

    if (this.btnWhatsapp) {
      this.btnWhatsapp.addEventListener("click", () => {
        const waLink = "https://wa.me/5511999999999?text=Olá!";
        if (this.input) this.input.value = waLink;
        this.generateQRCode(waLink);
      });
    }

    if (this.btnClearHistory) {
      this.btnClearHistory.addEventListener("click", () => this.clearHistory());
    }
  }

  /**
   * Gera o QR Code a partir do input ou texto específico fornecido
   * @param {string|null} customText - Texto alternativo para geração direta
   */
  generateQRCode(customText = null) {
    const text = (customText !== null ? customText : this.input.value).trim();

    // Validações obrigatórias
    if (!text) {
      this.showError("Por favor, insira um texto ou URL válido.");
      if (this.qrResultContainer) this.qrResultContainer.classList.add("hidden");
      if (this.qrPlaceholder) this.qrPlaceholder.classList.remove("hidden");
      return;
    }

    if (text.length > 2000) {
      this.showError("Texto muito longo. Use menos de 2000 caracteres.");
      return;
    }

    this.clearError();
    this.setLoading(true);

    try {
      // Limpa QR Code anterior
      this.clearQRCode();

      // Renderiza novo QR Code usando qrcode.js
      this.currentQRCode = new QRCode(this.qrCodeDiv, {
        text: text,
        ...this.qrConfig
      });

      this.generatedText = text;

      // Armazena no Histórico se não for duplicado imediato
      if (!this.qrHistory.includes(text)) {
        this.qrHistory = [text, ...this.qrHistory].slice(0, 5);
      } else {
        this.qrHistory = [text, ...this.qrHistory.filter(h => h !== text)].slice(0, 5);
      }
      localStorage.setItem("qrHistory", JSON.stringify(this.qrHistory));
      this.updateHistoryUI();

      // Incrementa e salva contador
      this.qrCount++;
      localStorage.setItem("qrCount", this.qrCount);
      if (this.qrCountSpan) {
        this.qrCountSpan.textContent = this.qrCount;
      }

      // Exibe container de resultado com animação (gerenciado via CSS)
      setTimeout(() => {
        if (this.qrPlaceholder) this.qrPlaceholder.classList.add("hidden");
        if (this.qrResultContainer) {
          this.qrResultContainer.classList.remove("hidden");
          this.qrResultContainer.style.display = "flex";
        }
        this.setLoading(false);
      }, 100);

    } catch (err) {
      console.error("Erro na geração do QR Code:", err);
      this.showError("Erro ao gerar QR Code. Tente novamente.");
      this.setLoading(false);
    }
  }

  /**
   * Limpa a instância do QR Code atual e reseta elementos visuais
   */
  clearQRCode() {
    if (this.currentQRCode) {
      if (typeof this.currentQRCode.clear === 'function') {
        this.currentQRCode.clear();
      }
    }
    if (this.qrCodeDiv) {
      this.qrCodeDiv.innerHTML = "";
    }
    this.generatedText = "";
    this.currentQRCode = null;
  }

  /**
   * Executa o download da imagem do QR Code em formato PNG
   */
  downloadQRCode() {
    try {
      // Busca a imagem ou canvas gerado pelo qrcode.js
      const img = this.qrCodeDiv.querySelector("img");
      const canvas = this.qrCodeDiv.querySelector("canvas");
      let src = "";

      if (img && img.src && img.src.startsWith("data:image")) {
        src = img.src;
      } else if (canvas) {
        src = canvas.toDataURL("image/png", 1.0);
      }

      if (!src) {
        this.showError("Imagem do QR Code não encontrada para download.");
        return;
      }

      const link = document.createElement("a");
      link.download = this.generateFileName();
      link.href = src;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Erro ao baixar QR Code:", err);
      this.showError("Falha ao baixar o QR Code.");
    }
  }

  /**
   * Copia o conteúdo textual gerado para a área de transferência
   */
  copyContent() {
    if (!this.generatedText) return;

    try {
      navigator.clipboard.writeText(this.generatedText)
        .then(() => {
          const originalText = this.btnCopy.textContent;
          this.btnCopy.textContent = "Copiado!";
          this.btnCopy.style.backgroundColor = "var(--success)";
          this.btnCopy.style.color = "#ffffff";

          setTimeout(() => {
            this.btnCopy.textContent = originalText;
            this.btnCopy.style.backgroundColor = "";
            this.btnCopy.style.color = "";
          }, 2000);
        })
        .catch(err => {
          console.error("Erro navigator.clipboard:", err);
          this.fallbackCopy();
        });
    } catch (err) {
      this.fallbackCopy();
    }
  }

  /**
   * Fallback de cópia usando textarea temporária
   */
  fallbackCopy() {
    try {
      const tempTextArea = document.createElement("textarea");
      tempTextArea.value = this.generatedText;
      document.body.appendChild(tempTextArea);
      tempTextArea.select();
      document.execCommand("copy");
      document.body.removeChild(tempTextArea);

      const originalText = this.btnCopy.textContent;
      this.btnCopy.textContent = "Copiado!";
      this.btnCopy.style.backgroundColor = "var(--success)";
      
      setTimeout(() => {
        this.btnCopy.textContent = originalText;
        this.btnCopy.style.backgroundColor = "";
      }, 2000);
    } catch (err) {
      this.showError("Não foi possível copiar automaticamente.");
    }
  }

  /**
   * Compartilha o conteúdo gerado se suportado pelo navegador
   */
  shareQRCode() {
    if (!this.generatedText) return;

    if (navigator.share) {
      navigator.share({
        title: "QR Code Gerado",
        text: "Gerado gratuitamente no Gerador de QR Code Online",
        url: window.location.href
      }).catch(err => console.error("Erro ao compartilhar:", err));
    } else {
      alert("Compartilhamento nativo não suportado neste navegador. Copie o conteúdo ou faça o download!");
    }
  }

  /**
   * Atualiza a interface gráfica com os itens salvos no histórico
   */
  updateHistoryUI() {
    if (!this.historyContainer || !this.historyList) return;

    if (this.qrHistory.length > 0) {
      this.historyContainer.classList.remove("hidden");
      this.historyList.innerHTML = "";
      
      this.qrHistory.forEach(item => {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.className = "history-item";
        btn.textContent = item;
        btn.title = item;
        
        btn.addEventListener("click", () => {
          if (this.input) this.input.value = item;
          this.generateQRCode(item);
        });

        li.appendChild(btn);
        this.historyList.appendChild(li);
      });
    } else {
      this.historyContainer.classList.add("hidden");
    }
  }

  /**
   * Limpa o histórico de geração de QR Codes
   */
  clearHistory() {
    this.qrHistory = [];
    localStorage.removeItem("qrHistory");
    this.updateHistoryUI();
  }

  /**
   * Exibe mensagens de erro amigáveis
   */
  showError(message) {
    if (this.errorMsg) {
      this.errorMsg.textContent = message;
    }
  }

  /**
   * Limpa a visualização de erros
   */
  clearError() {
    if (this.errorMsg) {
      this.errorMsg.textContent = "";
    }
  }

  /**
   * Ativa/Desativa o estado de carregamento dos botões e campos
   */
  setLoading(isLoading) {
    if (isLoading) {
      if (this.btnGenerate) {
        this.btnGenerate.disabled = true;
        this.btnGenerate.textContent = "Gerando...";
      }
      if (this.input) this.input.disabled = true;
    } else {
      if (this.btnGenerate) {
        this.btnGenerate.disabled = false;
        this.btnGenerate.textContent = "Gerar QR Code";
      }
      if (this.input) this.input.disabled = false;
    }
  }

  /**
   * Cria um nome de arquivo único para download baseado no timestamp atual
   */
  generateFileName() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    return `qrcode_${timestamp}.png`;
  }
}

// Inicialização segura após o carregamento total do DOM
document.addEventListener("DOMContentLoaded", () => {
  window.qrGenerator = new QRCodeGenerator();
});

// Evento beforeunload para liberação segura de recursos e limpeza automática de memória
window.addEventListener("beforeunload", () => {
  if (window.qrGenerator) {
    window.qrGenerator.clearQRCode();
  }
});
