/**
 * ==========================================================================
 * GERADOR DE QR CODE - SCRIPT.JS
 * Classe principal QRCodeGenerator com funcionalidades avançadas:
 * - Histórico persistente em LocalStorage (com dataURL e limite de 10 itens)
 * - Contador global dinâmico com formatação (ex: 10.000+)
 * - Modos interativos com prompt (PIX e WhatsApp)
 * - Compartilhamento inteligente via Web Share API com fallback
 * - Validação, Download PNG, Cópia de texto e ciclo de vida
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
    // 1. Elementos do DOM (suportando variações de IDs)
    this.form = document.getElementById('qr-form') || document.querySelector('form');
    this.textInput = document.getElementById('qr-input') || document.getElementById('textInput') || document.querySelector('input[name="qr-content"]');
    this.generateBtn = document.getElementById('btn-generate') || document.getElementById('generateBtn');
    this.clearInputBtn = document.getElementById('btn-clear-input');

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

    // Botões de Ação Rápida / Modos
    this.pixBtn = document.getElementById('btn-quick-pix') || document.getElementById('pixBtn') || document.querySelector('.btn-pix');
    this.whatsappBtn = document.getElementById('btn-quick-whatsapp') || document.getElementById('whatsappBtn') || document.querySelector('.btn-whatsapp');
    this.urlBtn = document.getElementById('btn-quick-url') || document.getElementById('urlBtn');
    this.wifiBtn = document.getElementById('btn-quick-wifi') || document.getElementById('wifiBtn');

    // 2. Estados da Aplicação
    this.currentQRCode = null;
    this.generatedText = '';
    this.isSubmitting = false;

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

    // 6. Inicialização dos Event Listeners e Primeiro QR Code
    this.init();
  }

  /**
   * Adiciona todos os event listeners da aplicação.
   */
  init() {
    // 1. Submit do Formulário
    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.generateQRCode();
      });
    }

    // 2. Eventos no textInput
    if (this.textInput) {
      // Limpa mensagem de erro ao digitar e gerencia botão de limpar
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

      // Keydown Enter (evita envios múltiplos acidentais)
      this.textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          if (this.isSubmitting) {
            e.preventDefault();
            return;
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

    // 8. Botão Modo PIX
    if (this.pixBtn) {
      this.pixBtn.addEventListener('click', () => this.generatePIX());
    }

    // 9. Botão Modo WhatsApp
    if (this.whatsappBtn) {
      this.whatsappBtn.addEventListener('click', () => this.generateWhatsApp());
    }

    // 10. Botões de atalho URL e Wi-Fi
    if (this.urlBtn) {
      this.urlBtn.addEventListener('click', () => {
        if (this.textInput) {
          this.textInput.value = 'https://gerador-qr-code.vercel.app/';
          this.generateQRCode();
        }
      });
    }

    if (this.wifiBtn) {
      this.wifiBtn.addEventListener('click', () => {
        const ssid = prompt('Digite o nome da rede Wi-Fi (SSID):');
        if (ssid && ssid.trim()) {
          const pass = prompt('Digite a senha da rede Wi-Fi (deixe em branco se for aberta):') || '';
          const wifiPayload = `WIFI:S:${ssid.trim()};T:${pass ? 'WPA' : 'nopass'};P:${pass.trim()};;`;
          if (this.textInput) {
            this.textInput.value = wifiPayload;
            this.generateQRCode();
            this.showToast('Modelo Wi-Fi gerado com sucesso!');
          }
        }
      });
    }

    // 11. Geração automática inicial caso haja valor ou valor padrão
    if (this.textInput && this.textInput.value.trim().length > 0) {
      this.generateQRCode();
    } else if (this.textInput) {
      this.textInput.value = 'https://gerador-qr-code.vercel.app/';
      this.generateQRCode();
    }
  }

  /**
   * Método principal para validar o input e gerar o QR Code.
   */
  generateQRCode() {
    if (!this.textInput || !this.qrCodeContainer) return;

    const text = this.textInput.value.trim();

    // Validações
    if (!text) {
      this.showError('Por favor, insira um texto ou URL válido.');
      return;
    }

    if (text.length > 2000) {
      this.showError('Texto muito longo. Use menos de 2000 caracteres.');
      return;
    }

    // Limpa erro e ativa loading
    this.clearError();
    this.setLoading(true);

    try {
      // Limpa QR Code anterior
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

      // Atualiza preview de texto se existir
      if (this.previewText) {
        this.previewText.textContent = text;
      }

      // Mostra containers e botões de ação (remove hidden)
      if (this.resultContainer) this.resultContainer.classList.remove('hidden');
      if (this.downloadBtn) this.downloadBtn.classList.remove('hidden');
      if (this.copyBtn) this.copyBtn.classList.remove('hidden');
      if (this.shareBtn) this.shareBtn.classList.remove('hidden');

      // Incrementa o contador de QR Codes
      this.incrementCounter();

      // Salva no histórico com o DataURL do canvas (se disponível)
      setTimeout(() => {
        let dataURL = '';
        const canvas = this.qrCodeContainer.querySelector('canvas');
        if (canvas) {
          try {
            dataURL = canvas.toDataURL('image/png', 0.8);
          } catch (_) {}
        }
        this.saveToHistory(text, dataURL);
      }, 50);

      // Restaura o estado de loading após 100ms
      setTimeout(() => {
        this.setLoading(false);
      }, 100);

    } catch (error) {
      this.setLoading(false);
      this.showError('Erro ao gerar o QR Code: ' + (error.message || 'Tente novamente.'));
      console.error('[QRCodeGenerator Generate Error]', error);
    }
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
   * Faz o download do QR Code gerado em formato PNG de alta definição.
   */
  downloadQRCode() {
    try {
      if (!this.qrCodeContainer) {
        throw new Error('Elemento do QR Code não encontrado.');
      }

      const canvas = this.qrCodeContainer.querySelector('canvas');
      const img = this.qrCodeContainer.querySelector('img');

      let dataUrl = '';

      if (canvas) {
        dataUrl = canvas.toDataURL('image/png', 1.0);
      } else if (img && img.src) {
        dataUrl = img.src;
      }

      if (!dataUrl) {
        throw new Error('A imagem do QR Code ainda não está pronta para download.');
      }

      const fileName = `qrcode_${this.generateFileName()}.png`;
      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      this.showToast('Download do PNG iniciado com sucesso!');
    } catch (err) {
      this.showError('Erro ao baixar o QR Code: ' + (err.message || 'Tente novamente.'));
      console.error('[QRCodeGenerator Download Error]', err);
    }
  }

  /**
   * Copia o conteúdo textual gerado para a área de transferência com feedback visual.
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

      // Feedback visual no botão: muda texto para "Copiado!" com cor verde e restaura após 2s
      if (this.copyBtn) {
        const originalHTML = this.copyBtn.innerHTML;
        this.copyBtn.innerHTML = `
          <svg style="width:16px;height:16px;display:inline-block;vertical-align:middle;margin-right:4px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg> Copiado!
        `;
        this.copyBtn.style.color = '#10b981';
        this.copyBtn.style.borderColor = '#10b981';

        setTimeout(() => {
          this.copyBtn.innerHTML = originalHTML;
          this.copyBtn.style.color = '';
          this.copyBtn.style.borderColor = '';
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
   * Tenta usar Web Share API; se falhar, exibe modal com opções manuais.
   */
  async shareQRCode() {
    if (!this.generatedText) {
      this.showError('Nenhum conteúdo para compartilhar.');
      return;
    }

    // Detecta se o conteúdo é uma URL
    const isUrl = this.isValidUrl(this.generatedText);
    const shareData = {
      title: 'QR Code Gerado',
      text: isUrl ? 'Confira este link:' : 'Confira este QR Code:',
      url: isUrl ? this.generatedText : undefined,
    };

    // 1. Tenta a Web Share API
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return; // Sucesso, sai da função
      } catch (error) {
        // Se o usuário cancelou, não faz nada
        if (error.name === 'AbortError') {
          console.log('Compartilhamento cancelado.');
          return;
        }
        // Outros erros: fallback para modal
        console.warn('Web Share API falhou, usando fallback.', error);
      }
    }

    // 2. Fallback: modal com opções manuais
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
   * Exibe modal com opções de compartilhamento manuais
   */
  showShareModal(isUrl) {
    // Remove modal anterior se existir
    const oldModal = document.getElementById('shareModal');
    if (oldModal) oldModal.remove();

    const modal = document.createElement('div');
    modal.id = 'shareModal';
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeInUp 0.3s ease;
      padding: 20px;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: #fff;
      border-radius: 16px;
      max-width: 400px;
      width: 100%;
      padding: 2rem;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      position: relative;
    `;

    // Construção dinâmica dos botões
    let buttonsHtml = `
      <h3 style="margin:0 0 0.5rem; font-size:1.3rem; color:#111827; font-weight:700;">Compartilhar</h3>
      <p style="color:#666; margin-bottom:1.2rem; font-size:0.9rem;">Escolha uma opção:</p>
      <div style="display:flex; flex-direction:column; gap:0.6rem;">
    `;

    // Se for URL, adiciona botões de redes sociais
    if (isUrl) {
      const encoded = encodeURIComponent(this.generatedText);
      buttonsHtml += `
        <button onclick="window.open('https://wa.me/?text=${encoded}','_blank')" 
                style="background:#25d366;color:#fff;border:none;padding:0.8rem;border-radius:10px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:0.5rem;justify-content:center;">
          💬 WhatsApp
        </button>
        <button onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=${encoded}','_blank')" 
                style="background:#1877f2;color:#fff;border:none;padding:0.8rem;border-radius:10px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:0.5rem;justify-content:center;">
          📘 Facebook
        </button>
        <button onclick="window.open('https://twitter.com/intent/tweet?url=${encoded}','_blank')" 
                style="background:#000;color:#fff;border:none;padding:0.8rem;border-radius:10px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:0.5rem;justify-content:center;">
          🐦 Twitter
        </button>
      `;
    }

    // Botão copiar (sempre disponível)
    const escapedText = this.generatedText.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    buttonsHtml += `
      <button onclick="navigator.clipboard.writeText('${escapedText}').then(() => alert('Conteúdo copiado!')).catch(() => alert('Erro ao copiar.'))" 
              style="background:#0070f3;color:#fff;border:none;padding:0.8rem;border-radius:10px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:0.5rem;justify-content:center;">
        📋 Copiar Conteúdo
      </button>
    `;

    // Botão fechar
    buttonsHtml += `
      <button onclick="document.getElementById('shareModal').remove()" 
              style="background:#e5e7eb;color:#333;border:none;padding:0.8rem;border-radius:10px;font-weight:600;cursor:pointer;margin-top:0.3rem;">
        Fechar
      </button>
    `;

    buttonsHtml += `</div>`;
    content.innerHTML = buttonsHtml;
    modal.appendChild(content);

    // Fecha ao clicar fora do modal
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    document.body.appendChild(modal);

    // Adiciona estilo de animação se não existir
    if (!document.getElementById('shareModalStyles')) {
      const style = document.createElement('style');
      style.id = 'shareModalStyles';
      style.textContent = `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Abre prompt para criação rápida de QR Code para PIX.
   */
  generatePIX() {
    const chave = prompt('Digite sua chave PIX (CPF, CNPJ, email, telefone ou aleatória):');
    if (chave === null) return; // Cancelado

    const chaveFormatada = chave.trim();
    if (!chaveFormatada) {
      this.showError('Chave PIX inválida ou vazia.');
      return;
    }

    if (this.textInput) {
      this.textInput.value = chaveFormatada;
      this.generateQRCode();
      this.showToast('QR Code PIX gerado com sucesso!');
    }
  }

  /**
   * Abre prompt para criação rápida de QR Code de redirecionamento para o WhatsApp.
   */
  generateWhatsApp() {
    const numero = prompt('Digite o número do WhatsApp (com DDD, ex: 11999999999):');
    if (numero === null) return; // Cancelado

    const numeroLimpo = numero.replace(/\D/g, '');
    if (!numeroLimpo) {
      this.showError('Número de WhatsApp inválido ou vazio.');
      return;
    }

    // Adiciona código do país 55 se o usuário digitou apenas DDD + número (10 ou 11 dígitos)
    const numeroFinal = numeroLimpo.length <= 11 && !numeroLimpo.startsWith('55')
      ? `55${numeroLimpo}`
      : numeroLimpo;

    const whatsappUrl = `https://wa.me/${numeroFinal}`;

    if (this.textInput) {
      this.textInput.value = whatsappUrl;
      this.generateQRCode();
      this.showToast('QR Code para WhatsApp gerado com sucesso!');
    }
  }

  /**
   * Salva um item gerado no histórico do localStorage.
   * Mantém os últimos 10 itens.
   * @param {string} text - Conteúdo do QR Code
   * @param {string} [dataURL] - Imagem base64 opcional
   */
  saveToHistory(text, dataURL = '') {
    if (!text) return;

    // Remove duplicatas imediatas anteriores
    this.history = this.history.filter((item) => item.text !== text);

    // Insere novo objeto no início
    const newItem = {
      text: text,
      date: new Date().toISOString(),
      dataURL: dataURL || '',
    };

    this.history.unshift(newItem);

    // Mantém no máximo 10 itens
    if (this.history.length > 10) {
      this.history = this.history.slice(0, 10);
    }

    // Salva no localStorage (chave 'qrHistory')
    try {
      localStorage.setItem('qrHistory', JSON.stringify(this.history));
    } catch (e) {
      console.warn('[QRCodeGenerator Save History Error]', e);
    }

    // Renderiza a lista atualizada
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
          // Suporte tanto a formato legado (strings) quanto novo formato (objetos)
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
   * Renderiza a lista de histórico recente no elemento DOM.
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
      li.setAttribute('title', 'Clique para gerar este QR Code novamente');

      // Formatação da data
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

      li.innerHTML = `
        <div class="flex items-center gap-2 min-w-0 flex-1">
          <span class="text-slate-400 group-hover:text-sky-600 transition-colors shrink-0">
            <svg style="width:14px;height:14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </span>
          <div class="min-w-0 flex-1">
            <div class="font-mono truncate text-slate-800 font-medium group-hover:text-sky-600 transition-colors">${this.escapeHtml(item.text)}</div>
            ${formattedDate ? `<div class="text-[10px] text-slate-400">${formattedDate}</div>` : ''}
          </div>
        </div>
        <button type="button" class="text-xs font-semibold text-sky-600 hover:text-sky-700 group-hover:underline shrink-0 px-2 py-1 rounded bg-sky-50 border border-sky-200">
          Usar
        </button>
      `;

      // Event listener de clique no item para preencher input e gerar novamente
      li.addEventListener('click', () => {
        if (this.textInput) {
          this.textInput.value = item.text;
          this.generateQRCode();
          if (this.clearInputBtn) this.clearInputBtn.classList.remove('hidden');
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
      // Formata no padrão brasileiro com separador de milhar
      const formatted = this.counter.toLocaleString('pt-BR');
      this.counterEl.textContent = `${formatted}+`;
    }
  }

  /**
   * Exibe mensagem de erro na interface.
   * @param {string} message - Texto da mensagem de erro
   */
  showError(message) {
    if (!this.errorBox) return;
    if (this.errorText) {
      this.errorText.textContent = message;
    } else {
      this.errorBox.textContent = message;
    }
    this.errorBox.classList.remove('hidden');
    if (this.toastBox) this.toastBox.classList.add('hidden');
  }

  /**
   * Oculta mensagem de erro.
   */
  clearError() {
    if (this.errorBox) {
      this.errorBox.classList.add('hidden');
    }
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

    if (this.textInput) {
      this.textInput.disabled = isLoading;
    }
  }

  /**
   * Retorna um timestamp formatado para o nome do arquivo PNG (ex: 20260821_201530).
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
