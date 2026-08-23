# 📱 Gerador de QR Code Grátis & Online

Aplicativo 100% Client-Side construído com **React**, **Vite** e **Tailwind CSS**, pronto para deploy na **Vercel**.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## 🚀 Funcionalidades

- ⚡ **Geração Instantânea de QR Codes** para URLs, textos, redes Wi-Fi, contatos e mensagens.
- 💸 **Modo Rápido PIX**: Insira sua chave e gere o código em 1 clique.
- 💬 **Modo Rápido WhatsApp**: Cria link direto `wa.me/` com DDD.
- 💾 **Download em Alta Resolução (PNG)**: Imagens nítidas (560x560px) com correção de erro nível H.
- 📋 **Copiar Conteúdo**: Copia o texto codificado diretamente para a área de transferência.
- 🔗 **Compartilhamento Inteligente**:
  - Tenta utilizar a **Web Share API** nativa do dispositivo.
  - Fallback automático para modal com botões para **WhatsApp**, **Facebook**, **Twitter / X** e **Copiar**.
- 🕒 **Histórico Local**: Armazena os últimos 10 QR Codes no `localStorage` com clique para restaurar.
- 🔢 **Contador de QR Codes**: Persistido no `localStorage` com formatação dinâmica (ex: 10.000+).
- 🛡️ **100% Privado e Seguro**: Nenhuma informação é enviada a servidores externos.
- 🔍 **SEO Completo**: Open Graph, Twitter Cards, Schema.org JSON-LD (WebApplication & FAQPage), sitemap.xml e robots.txt.

---

## 🛠️ Tecnologias Utilizadas

- **React 19**
- **Vite 6**
- **Tailwind CSS v4**
- **qrcode / qrcodejs**
- **Lucide React** (Ícones)

---

## 📦 Como Rodar Localmente

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/gerador-qr-code.git
cd gerador-qr-code

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🚀 Como Fazer Deploy na Vercel

### Opção 1: Via Vercel CLI (Rápido)

```bash
npm i -g vercel
vercel
```

Para produção:
```bash
vercel --prod
```

### Opção 2: Via GitHub / Dashboard da Vercel

1. Suba o código para seu repositório no **GitHub**.
2. Acesse [vercel.com/new](https://vercel.com/new) e importe o repositório.
3. As configurações serão detectadas automaticamente:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Clique em **Deploy**.

---

## 📄 Licença

Distribuído sob a licença MIT. Consulte `LICENSE` para mais detalhes.
