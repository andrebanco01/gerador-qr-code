/**
 * ==========================================================================
 * GERADOR DE QR CODE - SCRIPT.JS (Vanilla JS Moderno, Acessível e Seguro)
 * Classe principal QRCodeGenerator com:
 * - Histórico persistente em LocalStorage (com dataURL e limite de 10 itens)
 * - Contador global dinâmico com formatação (ex: 10.000+)
 * - Modos dedicados (URL, PIX, WhatsApp, Wi-Fi e Texto) sem uso de prompts intrusivos
 * - Geração de BR Code PIX (EMVCo + CRC16) e esquemas padronizados (WIFI:, wa.me)
 * - Download confiável via Blob e URL.createObjectURL com fallback
 * - Compartilhamento via Web Share API com modal seguro (DOM createElement)
 * - Foco acessível, scroll suave e atributos ARIA (WCAG AA)
 * ==========================================================================
 */

/**
 * Classe principal para geração, customização, histórico e manipulação de QR Codes.
 */
class QRCodeGenerator {
  /**
   * Construtor da classe: inicializa os elementos DOM, configurações do QR Code e carrega estados persistentes.
   */
  constructor() {
    // 1. Elementos do DOM (com múltiplos seletores de fallback para segurança de layout)
    this.form = document.getElementById('qr-form') || document.querySelector('form');
    this.textInput =
      document.getElementById('qr-input') ||
      document.getElementById('textInput') ||
      document.getElementById('url-input') ||
      document.querySelector('input[name="qr-content"]');
    this.generateBtn = document.getElementById('btn-generate') || document.getElementById('generateBtn');
    this.clearInputBtn = document.getElementById('btn-clear-input') || document.getElementById('clearInputBtn');

    this.qrCodeContainer = document.getElementById('qrcode') || document.getElementById('qrCodeContainer');
    this.resultContainer = document.getElementById('result-container') || document.getElementById('resultContainer');
    this.previewText = document.getElementById('qr-content-preview') || document.getElementById('previewText');
    this.counterEl = document.getElementById('qr-counter') || document.getElementById('counterNumber') || document.getElementById('qrCounter');

    this.errorBox = document.getElementById('error-message') || document.getElementById('errorMessage');
    this.errorText = document.getElementById('error-text') || document.getElementById('errorText');
    this.toastBox = document.getElementById('toast-message') || document.getElementById('toastMessage');
    this.toastText = document.getElementById('toast-text') || document.getElementById('toastText');

    this.downloadBtn = document.getElementById('btn-download-png') || document.getElementById('downloadBtn');
    this.copyBtn = document.getElementById('btn-copy-content') || document.getElementById('copyBtn');
    this.shareBtn = document.getElementById('btn-share') || document.getElementById('shareBtn');

    this.historyList = document.getElementById('history-list') || document.getElementById('historyList');
    this.clearHistoryBtn = document.getElementById('btn-clear-history') || document.getElementById('clearHistoryBtn');

    // Botões de Modos / Abas de Tipo
    this.urlBtn = document.getElementById('btn-quick-url') || document.getElementById('urlBtn') || document.querySelector('[data-mode="url"]');
    this.pixBtn = document.getElementById('btn-quick-pix') || document.getElementById('pixBtn') || document.querySelector('.btn-pix') || document.querySelector('[data-mode="pix"]');
    this.whatsappBtn = document.getElementById('btn-quick-whatsapp') || document.getElementById('whatsappBtn') || document.querySelector('.btn-whatsapp') || document.querySelector('[data-mode="whatsapp"]');
    this.wifiBtn = document.getElementById('btn-quick-wifi') || document.getElementById('wifiBtn') || document.querySelector('[data-mode="wifi"]');
    this.textBtn = document.getElementById('btn-quick-text') || document.getElementById('textBtn') || document.querySelector('[data-mode="text"]');

    // Possíveis campos dedicados no HTML (para suporte a formulários visuais específicos)
    this.pixKeyInput = document.getElementById('pix-key') || document.getElementById('pixKey');
    this.pixNameInput = document.getElementById('pix-name') || document.getElementById('pixName');
    this.pixCityInput = document.getElementById('pix-city') || document.getElementById('pixCity');
    this.pixAmountInput = document.getElementById('pix-amount') || document.getElementById('pixAmount');

    this.whatsappNumberInput = document.getElementById('whatsapp-number') || document.getElementById('whatsappNumber');
    this.whatsappMessageInput = document.getElementById('whatsapp-message') || document.getElementById('whatsappMessage');

    this.wifiSsidInput = document.getElementById('wifi-ssid') || document.getElementById('wifiSsid');
    this.wifiPasswordInput = document.getElementById('wifi-password') || document.getElementById('wifiPassword');
    this.wifiTypeSelect = document.getElementById('wifi-type') || document.getElementById('wifiType');
    this.wifiHiddenCheckbox = document.getElementById('wifi-hidden') || document.getElementById('wifiHidden');

    // 2. Estados da Aplicação
    this.currentQRCode = null;
    this.generatedText = '';
    this.isSubmitting = false;
    this.activeMode = 'url'; // 'url' | 'pix' | 'whatsapp' | 'wifi' | 'text'

    // 3. Configurações padrão do QRCode (Correção de erro nível H para máxima nitidez)
    this.qrConfig = {
      width: 280,
      height: 280,
      colorDark: '#1a1a1a',
      colorLight: '#ffffff',
      correctLevel: typeof QRCode !== 'undefined' && QRCode.CorrectLevel ? QRCode.CorrectLevel.H : 2,
    };

    // 4. Carregamento do Contador (Chave 'qrCounter' ou valor inicial padrão 10000)
    const savedCounter = localStorage.getItem('qrCounter');
    this.counter = savedCounter !== null ? parseInt(savedCounter, 10) : 10000;
    if (isNaN(this.counter)) this.counter = 10000;
    this.updateCounterDisplay();

    // 5. Carregamento do Histórico (Chave 'qrHistory')
    this.history = [];
    this.loadHistory();

    // 6. Configuração de Acessibilidade Inicial
    this.setupAccessibility();

    // 7. Inicialização dos Event Listeners
    this.init();
  }

  /**
   * Configura atributos ARIA e tags de acessibilidade iniciais nos elementos.
   */
  setupAccessibility() {
    if (this.clearInputBtn) {
      this.clearInputBtn.setAttribute('aria-label', 'Limpar campo');
    }

    if (this.errorBox) {
      this.errorBox.setAttribute('role', 'alert');
      this.errorBox.setAttribute('aria-live', 'polite');
    }

    if (this.toastBox) {
      this.toastBox.setAttribute('role', 'status');
      this.toastBox.setAttribute('aria-live', 'polite');
    }

    if (this.resultContainer) {
      this.resultContainer.setAttribute('tabindex', '-1');
    }

    // Inicializa botões de modo com atributos ARIA
    const modeButtons = [this.urlBtn, this.pixBtn, this.whatsappBtn, this.wifiBtn, this.textBtn];
    modeButtons.forEach((btn) => {
      if (btn) {
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-pressed', 'false');
      }
    });
  }

  /**
   * Adiciona todos os event listeners da aplicação.
   */
  init() {
    // 1. Submit do Formulário Principal
    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.generateQRCode();
      });
    }

    // 2. Eventos no textInput principal
    if (this.textInput) {
      this.textInput.addEventListener('input', () => {
        this.clearError();
        if (this.clearInputBtn) {
          if (this.textInput.value.length > 0) {
            this.clearInputBtn.classList.remove('hidden');
          } else {
            this.clearInputBtn.classList.add('hidden');
          }
        }
      });

      this.textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          if (this.isSubmitting) {
            e.preventDefault();
          }
        }
      });
    }

    // 3. Botão de Limpar Campo de Texto
    if (this.clearInputBtn && this.textInput) {
      this.clearInputBtn.addEventListener('click', () => {
        this.textInput.value = '';
        this.clearInputBtn.classList.add('hidden');
        this.textInput.focus();
        this.clearError();
      });
    }

    // 4. Botão Baixar QR Code
    if (this.downloadBtn) {
      this.downloadBtn.addEventListener('click', () => this.downloadQRCode());
    }

    // 5. Botão Copiar Conteúdo
    if (this.copyBtn) {
      this.copyBtn.addEventListener('click', () => this.copyContent());
    }

    // 6. Botão Compartilhar
    if (this.shareBtn) {
      this.shareBtn.addEventListener('click', () => this.shareQRCode());
    }

    // 7. Botão Limpar Histórico
    if (this.clearHistoryBtn) {
      this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
    }

    // 8. Botões de Modos / Abas
    if (this.urlBtn) {
      this.urlBtn.addEventListener('click', () => this.handleModeChange('url'));
    }
    if (this.pixBtn) {
      this.pixBtn.addEventListener('click', () => this.handleModeChange('pix'));
    }
    if (this.whatsappBtn) {
      this.whatsappBtn.addEventListener('click', () => this.handleModeChange('whatsapp'));
    }
    if (this.wifiBtn) {
      this.wifiBtn.addEventListener('click', () => this.handleModeChange('wifi'));
    }
    if (this.textBtn) {
      this.textBtn.addEventListener('click', () => this.handleModeChange('text'));
    }

    // 9. Configura modo inicial ativo
    this.setActiveMode('url');

    // 10. GERAÇÃO CONDICIONAL: Gera apenas se o input já veio preenchido no HTML.
    // Caso contrário, inicia com o resultado limpo e oculto.
    if (this.textInput && this.textInput.value.trim().length > 0) {
      this.generateQRCode();
    } else {
      this.clearResult();
    }
  }

  /**
   * Define e atualiza o modo ativo da interface (URL, PIX, WhatsApp, Wi-Fi, Texto).
   * @param {'url' | 'pix' | 'whatsapp' | 'wifi' | 'text'} mode
   */
  setActiveMode(mode) {
    this.activeMode = mode;

    const modeMap = {
      url: this.urlBtn,
      pix: this.pixBtn,
      whatsapp: this.whatsappBtn,
      wifi: this.wifiBtn,
      text: this.textBtn,
    };

    // Atualiza estado visual e ARIA de cada botão de modo
    Object.entries(modeMap).forEach(([key, btn]) => {
      if (btn) {
        const isActive = key === mode;
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');

        if (isActive) {
          btn.classList.add('active', 'bg-sky-600', 'text-white', 'shadow-xs');
          btn.classList.remove('bg-white', 'bg-slate-100', 'text-slate-700', 'text-slate-600');
        } else {
          btn.classList.remove('active', 'bg-sky-600', 'text-white', 'shadow-xs');
          btn.classList.add('bg-white', 'text-slate-700');
        }
      }
    });

    // Se existirem containers/painéis dedicados para cada modo no HTML, alterna-os
    const panels = ['url', 'pix', 'whatsapp', 'wifi', 'text'];
    panels.forEach((p) => {
      const panelEl = document.getElementById(`panel-${p}`) || document.getElementById(`form-${p}`);
      if (panelEl) {
        if (p === mode) {
          panelEl.classList.remove('hidden');
        } else {
          panelEl.classList.add('hidden');
        }
      }
    });

    // Atualiza placeholder e labels contextuais do textInput principal caso não existam formulários separados
    if (this.textInput) {
      switch (mode) {
        case 'url':
          this.textInput.placeholder = 'https://seusite.com.br';
          this.textInput.type = 'url';
          break;
        case 'pix':
          this.textInput.placeholder = 'Digite a Chave PIX (CPF, CNPJ, E-mail, Telefone ou Aleatória)';
          this.textInput.type = 'text';
          break;
        case 'whatsapp':
          this.textInput.placeholder = 'DDD + Número (ex: 11999998888)';
          this.textInput.type = 'tel';
          break;
        case 'wifi':
          this.textInput.placeholder = 'Nome da Rede Wi-Fi (SSID)';
          this.textInput.type = 'text';
          break;
        case 'text':
          this.textInput.placeholder = 'Digite seu texto, mensagem ou anotação...';
          this.textInput.type = 'text';
          break;
      }
    }
  }

  /**
   * Gerencia a troca de modo de forma consistente:
   * Atualiza abas, limpa o QR anterior, limpa erros e foca no campo.
   * @param {'url' | 'pix' | 'whatsapp' | 'wifi' | 'text'} mode
   */
  handleModeChange(mode) {
    this.setActiveMode(mode);
    this.clearResult();
    this.clearError();

    // Foca no campo correspondente ao modo
    const activeField = this.getActiveField();
    if (activeField) {
      activeField.focus();
    }
  }

  /**
   * Retorna o campo de entrada prioritário conforme o modo ativo.
   * @returns {HTMLElement|null}
   */
  getActiveField() {
    if (this.activeMode === 'pix' && this.pixKeyInput) return this.pixKeyInput;
    if (this.activeMode === 'whatsapp' && this.whatsappNumberInput) return this.whatsappNumberInput;
    if (this.activeMode === 'wifi' && this.wifiSsidInput) return this.wifiSsidInput;
    return this.textInput;
  }

  /**
   * Constrói o payload de dados a ser codificado no QR Code conforme o modo e campos disponíveis.
   * @returns {{ text: string, field: HTMLElement|null }}
   */
  getPayloadForCurrentMode() {
    // 1. MODO PIX
    if (this.activeMode === 'pix') {
      if (this.pixKeyInput) {
        const key = this.pixKeyInput.value.trim();
        if (!key) {
          return { text: '', field: this.pixKeyInput };
        }
        const name = this.pixNameInput ? this.pixNameInput.value.trim() : '';
        const city = this.pixCityInput ? this.pixCityInput.value.trim() : '';
        const amount = this.pixAmountInput ? this.pixAmountInput.value.trim() : '';
        const payload = this.buildPixBRCode({ key, name, city, amount });
        return { text: payload, field: this.pixKeyInput };
      }
    }

    // 2. MODO WHATSAPP
    if (this.activeMode === 'whatsapp') {
      if (this.whatsappNumberInput) {
        const rawNumber = this.whatsappNumberInput.value.replace(/\D/g, '');
        if (!rawNumber) {
          return { text: '', field: this.whatsappNumberInput };
        }
        const fullNumber = rawNumber.length <= 11 && !rawNumber.startsWith('55') ? `55${rawNumber}` : rawNumber;
        const msg = this.whatsappMessageInput ? this.whatsappMessageInput.value.trim() : '';
        const url = msg ? `https://wa.me/${fullNumber}?text=${encodeURIComponent(msg)}` : `https://wa.me/${fullNumber}`;
        return { text: url, field: this.whatsappNumberInput };
      }
    }

    // 3. MODO WI-FI
    if (this.activeMode === 'wifi') {
      if (this.wifiSsidInput) {
        const ssid = this.wifiSsidInput.value.trim();
        if (!ssid) {
          return { text: '', field: this.wifiSsidInput };
        }
        const pass = this.wifiPasswordInput ? this.wifiPasswordInput.value.trim() : '';
        const type = this.wifiTypeSelect ? this.wifiTypeSelect.value : pass ? 'WPA' : 'nopass';
        const hidden = this.wifiHiddenCheckbox && this.wifiHiddenCheckbox.checked ? 'true' : 'false';
        const payload = `WIFI:T:${type};S:${ssid};P:${pass};H:${hidden};;`;
        return { text: payload, field: this.wifiSsidInput };
      }
    }

    // 4. MODO PADRÃO / FALLBACK (Usando textInput principal)
    if (!this.textInput) {
      return { text: '', field: null };
    }

    const rawValue = this.textInput.value.trim();
    if (!rawValue) {
      return { text: '', field: this.textInput };
    }

    // Formatações auxiliares para quando usado no campo único
    if (this.activeMode === 'whatsapp') {
      const cleanNum = rawValue.replace(/\D/g, '');
      if (cleanNum.length >= 8) {
        const full = cleanNum.length <= 11 && !cleanNum.startsWith('55') ? `55${cleanNum}` : cleanNum;
        return { text: `https://wa.me/${full}`, field: this.textInput };
      }
    }

    return { text: rawValue, field: this.textInput };
  }

  /**
   * Método principal para validar o input e gerar o QR Code.
   */
  generateQRCode() {
    if (!this.qrCodeContainer) return;

    const { text, field } = this.getPayloadForCurrentMode();
    const targetField = field || this.getActiveField() || this.textInput;

    // Validações
    if (!text) {
      this.showError('Por favor, preencha o campo obrigatório para gerar o QR Code.', targetField);
      return;
    }

    if (text.length > 2000) {
      this.showError('Texto muito longo. O limite para geração é de 2000 caracteres.', targetField);
      return;
    }

    // Limpa erro e ativa loading
    this.clearError();
    this.setLoading(true);

    try {
      // Limpa visualização anterior
      this.clearQRCode();

      // Instancia novo QR Code
      if (typeof QRCode !== 'undefined') {
        this.currentQRCode = new QRCode(this.qrCodeContainer, {
          text: text,
          width: this.qrConfig.width,
          height: this.qrConfig.height,
          colorDark: this.qrConfig.colorDark,
          colorLight: this.qrConfig.colorLight,
          correctLevel: this.qrConfig.correctLevel,
        });
      } else {
        throw new Error('Biblioteca QRCode não encontrada no ambiente.');
      }

      // Armazena o texto gerado
      this.generatedText = text;

      // Adiciona texto alternativo descritivo na imagem gerada para leitores de tela
      setTimeout(() => {
        const img = this.qrCodeContainer.querySelector('img');
        if (img) {
          img.setAttribute('alt', `QR Code gerado para: ${text.substring(0, 50)}`);
        }
        const canvas = this.qrCodeContainer.querySelector('canvas');
        if (canvas) {
          canvas.setAttribute('role', 'img');
          canvas.setAttribute('aria-label', `QR Code gerado para: ${text.substring(0, 50)}`);
        }
      }, 50);

      // Atualiza preview de texto se existir
      if (this.previewText) {
        this.previewText.textContent = text;
      }

      // Mostra containers de resultado e botões de ação
      if (this.resultContainer) this.resultContainer.classList.remove('hidden');
      if (this.downloadBtn) this.downloadBtn.classList.remove('hidden');
      if (this.copyBtn) this.copyBtn.classList.remove('hidden');
      if (this.shareBtn) this.shareBtn.classList.remove('hidden');

      // Incrementa o contador global de QR Codes gerados
      this.incrementCounter();

      // Salva no histórico com o DataURL do canvas gerado
      setTimeout(() => {
        let dataURL = '';
        const canvas = this.qrCodeContainer.querySelector('canvas');
        if (canvas) {
          try {
            dataURL = canvas.toDataURL('image/png', 0.8);
          } catch (_) {}
        }
        this.saveToHistory(text, dataURL);
      }, 60);

      // Rola suavemente até o resultado e aplica foco acessível
      setTimeout(() => {
        this.scrollToResult();
        this.setLoading(false);
      }, 120);

    } catch (error) {
      this.setLoading(false);
      this.showError('Erro ao gerar o QR Code: ' + (error.message || 'Tente novamente.'), targetField);
      console.error('[QRCodeGenerator Generate Error]', error);
    }
  }

  /**
   * Rola suavemente a página até a área de resultado e aplica foco acessível.
   */
  scrollToResult() {
    if (!this.resultContainer) return;

    this.resultContainer.setAttribute('tabindex', '-1');
    this.resultContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Foco programático sem duplicar a rolagem
    setTimeout(() => {
      if (this.resultContainer && typeof this.resultContainer.focus === 'function') {
        this.resultContainer.focus({ preventScroll: true });
      }
    }, 250);
  }

  /**
   * Limpa o QR Code, oculta containers de resultado e botões sem apagar o histórico.
   */
  clearResult() {
    this.clearQRCode();

    if (this.resultContainer) this.resultContainer.classList.add('hidden');
    if (this.downloadBtn) this.downloadBtn.classList.add('hidden');
    if (this.copyBtn) this.copyBtn.classList.add('hidden');
    if (this.shareBtn) this.shareBtn.classList.add('hidden');
    if (this.previewText) this.previewText.textContent = '';
  }

  /**
   * Limpa a instância atual do QR Code e esvazia o container.
   */
  clearQRCode() {
    if (this.currentQRCode && typeof this.currentQRCode.clear === 'function') {
      try {
        this.currentQRCode.clear();
      } catch (_) {}
    }

    if (this.qrCodeContainer) {
      this.qrCodeContainer.innerHTML = '';
    }

    this.generatedText = '';
    this.currentQRCode = null;
  }

  /**
   * Faz o download do QR Code gerado em formato PNG de alta definição usando Blob para maior confiabilidade.
   */
  downloadQRCode() {
    try {
      if (!this.qrCodeContainer) {
        throw new Error('Elemento do QR Code não encontrado.');
      }

      const canvas = this.qrCodeContainer.querySelector('canvas');
      const img = this.qrCodeContainer.querySelector('img');
      const fileName = `qrcode_${this.generateFileName()}.png`;

      // 1. Download confiável via Canvas e Blob
      if (canvas && typeof canvas.toBlob === 'function') {
        canvas.toBlob((blob) => {
          if (!blob) {
            this.fallbackDownload(canvas.toDataURL('image/png', 1.0), fileName);
            return;
          }
          const blobUrl = URL.createObjectURL(blob);
          const downloadLink = document.createElement('a');
          downloadLink.href = blobUrl;
          downloadLink.download = fileName;
          downloadLink.style.display = 'none';
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(blobUrl);
          this.showToast('Download do PNG iniciado com sucesso!');
        }, 'image/png', 1.0);
        return;
      }

      // 2. Fallback para DataURL / Imagem direta
      let dataUrl = '';
      if (canvas) {
        dataUrl = canvas.toDataURL('image/png', 1.0);
      } else if (img && img.src) {
        dataUrl = img.src;
      }

      if (!dataUrl) {
        throw new Error('A imagem do QR Code ainda não está pronta para download.');
      }

      this.fallbackDownload(dataUrl, fileName);
      this.showToast('Download do PNG iniciado com sucesso!');
    } catch (err) {
      this.showError('Erro ao baixar o QR Code: ' + (err.message || 'Tente novamente.'));
      console.error('[QRCodeGenerator Download Error]', err);
    }
  }

  /**
   * Download de fallback via Data URL
   */
  fallbackDownload(dataUrl, fileName) {
    const downloadLink = document.createElement('a');
    downloadLink.href = dataUrl;
    downloadLink.download = fileName;
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  /**
   * Copia o conteúdo textual gerado para a área de transferência com feedback visual e sonoro acessível.
   */
  async copyContent() {
    if (!this.generatedText) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(this.generatedText);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = this.generatedText;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (!successful) throw new Error('Falha no comando de cópia fallback.');
      }

      // Feedback acessível e visual no botão de cópia
      if (this.copyBtn) {
        const originalHTML = this.copyBtn.innerHTML;
        this.copyBtn.innerHTML = `
          <svg style="width:16px;height:16px;display:inline-block;vertical-align:middle;margin-right:4px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg> Copiado!
        `;
        this.copyBtn.setAttribute('aria-label', 'Conteúdo copiado para a área de transferência');
        this.copyBtn.classList.add('text-emerald-600', 'border-emerald-500');

        setTimeout(() => {
          this.copyBtn.innerHTML = originalHTML;
          this.copyBtn.removeAttribute('aria-label');
          this.copyBtn.classList.remove('text-emerald-600', 'border-emerald-500');
        }, 2000);
      }

      this.showToast('Conteúdo copiado para a área de transferência!');
    } catch (err) {
      this.showError('Não foi possível copiar o conteúdo automaticamente.');
      console.error('[QRCodeGenerator Copy Error]', err);
    }
  }

  /**
   * Compartilha o conteúdo gerado (URL ou texto)
   * Tenta usar Web Share API; se falhar, exibe modal seguro com opções manuais.
   */
  async shareQRCode() {
    if (!this.generatedText) {
      this.showError('Nenhum conteúdo para compartilhar.');
      return;
    }

    const isUrl = this.isValidUrl(this.generatedText);
    const shareData = {
      title: 'QR Code Gerado',
      text: isUrl ? 'Confira este link gerado via QR Code:' : 'Confira este QR Code:',
      url: isUrl ? this.generatedText : undefined,
    };

    // 1. Tenta a Web Share API nativa
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error.name === 'AbortError') {
          return;
        }
        console.warn('Web Share API falhou, abrindo modal seguro.', error);
      }
    }

    // 2. Fallback: modal seguro construído via DOM API
    this.showShareModal(isUrl);
  }

  /**
   * Verifica se uma string é uma URL válida (http/https)
   */
  isValidUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }

  /**
   * Exibe modal seguro de compartilhamento construído puramente com createElement e addEventListener.
   */
  showShareModal(isUrl) {
    const oldModal = document.getElementById('shareModal');
    if (oldModal) oldModal.remove();

    const modal = document.createElement('div');
    modal.id = 'shareModal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'shareModalTitle');
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 1rem;
    `;

    const card = document.createElement('div');
    card.style.cssText = `
      background: #ffffff;
      border-radius: 16px;
      max-width: 400px;
      width: 100%;
      padding: 1.5rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      border: 1px solid #e2e8f0;
    `;

    // Título do modal
    const title = document.createElement('h3');
    title.id = 'shareModalTitle';
    title.textContent = 'Compartilhar QR Code';
    title.style.cssText = 'font-size: 1.125rem; font-weight: 700; color: #0f172a; margin-bottom: 0.25rem;';
    card.appendChild(title);

    const desc = document.createElement('p');
    desc.textContent = 'Escolha como deseja compartilhar este código:';
    desc.style.cssText = 'font-size: 0.875rem; color: #64748b; margin-bottom: 1.25rem;';
    card.appendChild(desc);

    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = 'display: flex; flex-direction: column; gap: 0.5rem;';

    const encoded = encodeURIComponent(this.generatedText);

    // Botão WhatsApp
    const waBtn = document.createElement('button');
    waBtn.type = 'button';
    waBtn.textContent = 'WhatsApp';
    waBtn.style.cssText = 'display:flex;align-items:center;justify-content:center;padding:0.625rem;border-radius:10px;font-weight:600;font-size:0.875rem;color:#ffffff;background:#25d366;border:none;cursor:pointer;';
    waBtn.addEventListener('click', () => {
      window.open(`https://wa.me/?text=${encoded}`, '_blank', 'noopener,noreferrer');
    });
    btnContainer.appendChild(waBtn);

    // Se for URL, adiciona Facebook e Twitter/X
    if (isUrl) {
      const fbBtn = document.createElement('button');
      fbBtn.type = 'button';
      fbBtn.textContent = 'Facebook';
      fbBtn.style.cssText = 'display:flex;align-items:center;justify-content:center;padding:0.625rem;border-radius:10px;font-weight:600;font-size:0.875rem;color:#ffffff;background:#1877f2;border:none;cursor:pointer;';
      fbBtn.addEventListener('click', () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encoded}`, '_blank', 'noopener,noreferrer');
      });
      btnContainer.appendChild(fbBtn);

      const twBtn = document.createElement('button');
      twBtn.type = 'button';
      twBtn.textContent = 'Twitter / X';
      twBtn.style.cssText = 'display:flex;align-items:center;justify-content:center;padding:0.625rem;border-radius:10px;font-weight:600;font-size:0.875rem;color:#ffffff;background:#0f172a;border:none;cursor:pointer;';
      twBtn.addEventListener('click', () => {
        window.open(`https://twitter.com/intent/tweet?url=${encoded}`, '_blank', 'noopener,noreferrer');
      });
      btnContainer.appendChild(twBtn);
    }

    // Botão Copiar Conteúdo
    const copyModalBtn = document.createElement('button');
    copyModalBtn.type = 'button';
    copyModalBtn.textContent = 'Copiar Conteúdo';
    copyModalBtn.style.cssText = 'display:flex;align-items:center;justify-content:center;padding:0.625rem;border-radius:10px;font-weight:600;font-size:0.875rem;color:#0284c7;background:#f0f9ff;border:1px solid #bae6fd;cursor:pointer;';
    copyModalBtn.addEventListener('click', () => {
      this.copyContent();
      modal.remove();
    });
    btnContainer.appendChild(copyModalBtn);

    // Botão Fechar
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.textContent = 'Fechar';
    closeBtn.style.cssText = 'margin-top:0.5rem;padding:0.625rem;border-radius:10px;font-weight:600;font-size:0.875rem;color:#475569;background:#f1f5f9;border:none;cursor:pointer;';
    closeBtn.addEventListener('click', () => {
      modal.remove();
    });
    btnContainer.appendChild(closeBtn);

    card.appendChild(btnContainer);
    modal.appendChild(card);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    document.body.appendChild(modal);
  }

  /**
   * Helper para formatar campos no padrão EMVCo (ID + Tamanho 2 dígitos + Valor).
   */
  formatEMV(id, value) {
    const len = value.length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
  }

  /**
   * Calcula o checksum CRC16-CCITT (Polinômio 0x1021) para padrão PIX Banco Central.
   */
  computeCRC16(str) {
    let crc = 0xFFFF;
    const polynomial = 0x1021;
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      crc ^= (c << 8);
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) !== 0) {
          crc = ((crc << 1) ^ polynomial) & 0xFFFF;
        } else {
          crc = (crc << 1) & 0xFFFF;
        }
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }

  /**
   * Monta o código BR Code padronizado para pagamentos PIX.
   * Se apenas a chave estiver presente, gera o payload estático padrão do Banco Central.
   */
  buildPixBRCode({ key, name = '', city = '', amount = '' }) {
    if (!key) return '';

    // Se o usuário apenas inseriu a chave sem campos bancários adicionais
    if (!name && !city && !amount) {
      const cleanKey = key.trim();
      // Formato direto de chave caso simples
      return cleanKey;
    }

    // Construção EMVCo completa
    let payload = '';
    payload += this.formatEMV('00', '01'); // Payload Format Indicator
    payload += this.formatEMV('01', '12'); // Point of Initiation (12 = estático)

    // Merchant Account Information - PIX (26)
    let mai = this.formatEMV('00', 'br.gov.bcb.pix');
    mai += this.formatEMV('01', key.trim());
    payload += this.formatEMV('26', mai);

    payload += this.formatEMV('52', '0000'); // Merchant Category Code
    payload += this.formatEMV('53', '986');  // Currency BRL (986)

    if (amount && parseFloat(amount) > 0) {
      payload += this.formatEMV('54', parseFloat(amount).toFixed(2));
    }

    payload += this.formatEMV('58', 'BR'); // Country Code

    const formattedName = (name || 'RECEBEDOR').substring(0, 25).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    payload += this.formatEMV('59', formattedName);

    const formattedCity = (city || 'BRASIL').substring(0, 15).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    payload += this.formatEMV('60', formattedCity);

    // Additional Data Field (62) com txid
    const additionalData = this.formatEMV('05', '***');
    payload += this.formatEMV('62', additionalData);

    // CRC16 (6304)
    payload += '6304';
    const crc = this.computeCRC16(payload);
    return payload + crc;
  }

  /**
   * Salva um item gerado no histórico do localStorage (limite de 10 itens).
   * @param {string} text - Conteúdo do QR Code
   * @param {string} [dataURL] - Imagem base64 opcional
   */
  saveToHistory(text, dataURL = '') {
    if (!text) return;

    // Remove duplicatas imediatas anteriores
    this.history = this.history.filter((item) => item.text !== text);

    const newItem = {
      text: text,
      date: new Date().toISOString(),
      dataURL: dataURL || '',
    };

    this.history.unshift(newItem);

    if (this.history.length > 10) {
      this.history = this.history.slice(0, 10);
    }

    try {
      localStorage.setItem('qrHistory', JSON.stringify(this.history));
    } catch (e) {
      console.warn('[QRCodeGenerator Save History Error]', e);
    }

    this.renderHistory();
  }

  /**
   * Carrega o histórico do localStorage e atualiza a interface.
   */
  loadHistory() {
    try {
      const saved = localStorage.getItem('qrHistory');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          this.history = parsed.map((item) => {
            if (typeof item === 'string') {
              return { text: item, date: new Date().toISOString(), dataURL: '' };
            }
            return item;
          });
        }
      }
    } catch (e) {
      console.warn('[QRCodeGenerator Load History Error]', e);
      this.history = [];
    }

    this.renderHistory();
  }

  /**
   * Renderiza a lista de histórico recente no elemento DOM com botões e labels acessíveis.
   */
  renderHistory() {
    if (!this.historyList) return;

    this.historyList.innerHTML = '';

    if (!this.history || this.history.length === 0) {
      const emptyLi = document.createElement('li');
      emptyLi.className = 'text-xs text-slate-500 italic py-2 text-center';
      emptyLi.textContent = 'Nenhum QR Code gerado ainda.';
      this.historyList.appendChild(emptyLi);
      return;
    }

    this.history.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'history-item flex items-center justify-between gap-2 p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-700 transition-colors cursor-pointer group';
      li.setAttribute('title', `Usar QR Code: ${item.text}`);

      let formattedDate = '';
      if (item.date) {
        try {
          const d = new Date(item.date);
          formattedDate = d.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          });
        } catch (_) {}
      }

      const leftDiv = document.createElement('div');
      leftDiv.className = 'flex items-center gap-2 min-w-0 flex-1';

      const iconSpan = document.createElement('span');
      iconSpan.className = 'text-slate-400 group-hover:text-sky-600 transition-colors shrink-0';
      iconSpan.innerHTML = `
        <svg style="width:14px;height:14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      `;
      leftDiv.appendChild(iconSpan);

      const textDiv = document.createElement('div');
      textDiv.className = 'min-w-0 flex-1';

      const textTitle = document.createElement('div');
      textTitle.className = 'font-mono truncate text-slate-800 font-medium group-hover:text-sky-600 transition-colors';
      textTitle.textContent = item.text;
      textDiv.appendChild(textTitle);

      if (formattedDate) {
        const dateSpan = document.createElement('div');
        dateSpan.className = 'text-[10px] text-slate-400';
        dateSpan.textContent = formattedDate;
        textDiv.appendChild(dateSpan);
      }
      leftDiv.appendChild(textDiv);

      const useBtn = document.createElement('button');
      useBtn.type = 'button';
      useBtn.className = 'text-xs font-semibold text-sky-600 hover:text-sky-700 group-hover:underline shrink-0 px-2 py-1 rounded bg-sky-50 border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500';
      useBtn.textContent = 'Usar';
      useBtn.setAttribute('aria-label', `Usar QR Code salvo: ${item.text}`);

      li.appendChild(leftDiv);
      li.appendChild(useBtn);

      li.addEventListener('click', () => {
        if (this.textInput) {
          this.textInput.value = item.text;
          if (this.clearInputBtn) this.clearInputBtn.classList.remove('hidden');
          this.generateQRCode();
          this.showToast('QR Code carregado do histórico!');
        }
      });

      this.historyList.appendChild(li);
    });
  }

  /**
   * Limpa todo o histórico após confirmação do usuário.
   */
  clearHistory() {
    if (this.history.length === 0) {
      this.showToast('O histórico já está vazio.');
      return;
    }

    const confirmClear = confirm('Tem certeza que deseja limpar todo o histórico de QR Codes?');
    if (!confirmClear) return;

    this.history = [];
    try {
      localStorage.removeItem('qrHistory');
    } catch (e) {
      console.warn('[QRCodeGenerator Clear History Error]', e);
    }

    this.renderHistory();
    this.showToast('Histórico limpo com sucesso.');
  }

  /**
   * Incrementa o contador de QR codes gerados, salva no localStorage e atualiza a interface.
   */
  incrementCounter() {
    this.counter++;
    try {
      localStorage.setItem('qrCounter', this.counter.toString());
    } catch (e) {
      console.warn('[QRCodeGenerator Counter Save Error]', e);
    }
    this.updateCounterDisplay();
  }

  /**
   * Atualiza a exibição formatada do contador na interface (ex: "10.000+").
   */
  updateCounterDisplay() {
    if (this.counterEl) {
      const formatted = this.counter.toLocaleString('pt-BR');
      this.counterEl.textContent = `${formatted}+`;
    }
  }

  /**
   * Exibe mensagem de erro na interface e aplica destaque acessível no campo inválido.
   * @param {string} message - Texto da mensagem de erro
   * @param {HTMLElement|null} [field] - Elemento de entrada com o erro
   */
  showError(message, field = null) {
    if (this.errorBox) {
      if (this.errorText) {
        this.errorText.textContent = message;
      } else {
        this.errorBox.textContent = message;
      }
      this.errorBox.setAttribute('role', 'alert');
      this.errorBox.setAttribute('aria-live', 'polite');
      this.errorBox.classList.remove('hidden');
    }

    if (this.toastBox) {
      this.toastBox.classList.add('hidden');
    }

    // Destaque visual no campo com erro
    if (field) {
      field.setAttribute('aria-invalid', 'true');
      field.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-200', 'border-2');

      const removeErrorOnInput = () => {
        this.clearError();
        field.removeEventListener('input', removeErrorOnInput);
      };
      field.addEventListener('input', removeErrorOnInput, { once: true });

      try {
        field.focus();
      } catch (_) {}
    }
  }

  /**
   * Oculta mensagem de erro e limpa estados de erro de todos os campos.
   */
  clearError() {
    if (this.errorBox) {
      this.errorBox.classList.add('hidden');
    }

    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach((input) => {
      input.removeAttribute('aria-invalid');
      input.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-200', 'border-2');
    });
  }

  /**
   * Exibe notificação temporária tipo Toast.
   * @param {string} message - Texto do toast
   */
  showToast(message) {
    if (!this.toastBox) return;
    if (this.toastText) {
      this.toastText.textContent = message;
    } else {
      this.toastBox.textContent = message;
    }
    this.toastBox.classList.remove('hidden');

    setTimeout(() => {
      if (this.toastBox) this.toastBox.classList.add('hidden');
    }, 3500);
  }

  /**
   * Gerencia o estado de loading nos controles de formulário.
   * @param {boolean} isLoading
   */
  setLoading(isLoading) {
    this.isSubmitting = isLoading;

    if (this.generateBtn) {
      this.generateBtn.disabled = isLoading;
      if (isLoading) {
        this.generateBtn.dataset.originalHtml = this.generateBtn.innerHTML;
        this.generateBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg> Gerando...
        `;
        this.generateBtn.style.opacity = '0.7';
        this.generateBtn.style.cursor = 'not-allowed';
      } else {
        if (this.generateBtn.dataset.originalHtml) {
          this.generateBtn.innerHTML = this.generateBtn.dataset.originalHtml;
        } else {
          this.generateBtn.textContent = 'Gerar QR Code';
        }
        this.generateBtn.style.opacity = '1';
        this.generateBtn.style.cursor = 'pointer';
      }
    }

    const activeField = this.getActiveField();
    if (activeField) {
      activeField.disabled = isLoading;
    }
  }

  /**
   * Retorna um timestamp formatado para o nome do arquivo PNG (ex: 20260822_121530).
   * @returns {string}
   */
  generateFileName() {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  }

  /**
   * Escapa caracteres especiais para inserção segura no DOM.
   * @param {string} str
   * @returns {string}
   */
  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Inicialização automática após carregamento do DOM
let qrAppInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  qrAppInstance = new QRCodeGenerator();
});

// Limpeza automática de recursos e instâncias ao descarregar a página
window.addEventListener('beforeunload', () => {
  if (qrAppInstance && typeof qrAppInstance.clearQRCode === 'function') {
    qrAppInstance.clearQRCode();
  }
});
