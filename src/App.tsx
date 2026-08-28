import React from 'react';
import { QrCode, Sparkles, ShieldCheck, Zap, Globe } from 'lucide-react';
import { useQRCode } from './hooks/useQRCode';
import { Toast } from './components/Toast';
import { TabSelector } from './components/TabSelector';
import { UrlForm } from './components/UrlForm';
import { PixForm } from './components/PixForm';
import { WhatsAppForm } from './components/WhatsAppForm';
import { WifiForm } from './components/WifiForm';
import { TextForm } from './components/TextForm';
import { QRCodeDisplay } from './components/QRCodeDisplay';
import { HistorySection } from './components/HistorySection';
import { FAQSection } from './components/FAQSection';
import { ErrorAlert } from './components/ErrorAlert';
import { BannerSlot } from './components/BannerSlot';
import { WhatsAppContact } from './components/WhatsAppContact';
import {
  DEVELOPER_WHATSAPP,
  DEVELOPER_WHATSAPP_MESSAGE,
  AFFILIATE_URLS,
} from './constants';

export default function App() {
  const qr = useQRCode();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-between font-sans selection:bg-sky-500 selection:text-white">
      <WhatsAppContact
        phoneNumber={DEVELOPER_WHATSAPP}
        message={DEVELOPER_WHATSAPP_MESSAGE}
        developerName="Desenvolvedor"
      />

      <Toast message={qr.toast} />

      <div className="w-full max-w-2xl px-4 pt-4 sm:pt-6">
        <BannerSlot
          id="banner-slot-top"
          position="top"
          imageUrl="/bannertopo.jpg"
          targetUrl={AFFILIATE_URLS.top}
          badgeText="Oferta em Destaque"
          title="Promoções e Benefícios Exclusivos"
          subtitle="Aproveite condições especiais e descontos selecionados para você hoje."
          buttonText="Acessar Oferta"
          altText="Oferta em Destaque"
        />
      </div>

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

      <main className="w-full max-w-2xl px-4 py-4 space-y-6">
        <section className="bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 sm:p-7">
          <TabSelector activeTab={qr.activeTab} onTabChange={(tab) => { qr.setActiveTab(tab); qr.setError(null); }} />

          <form onSubmit={(e) => { e.preventDefault(); qr.generate(); }} className="space-y-4">
            {qr.activeTab === 'url' && (
              <div role="tabpanel" id="panel-url" aria-labelledby="tab-url">
                <UrlForm value={qr.fields.urlInput} onChange={(v) => qr.updateField('urlInput', v)} />
              </div>
            )}

            {qr.activeTab === 'pix' && (
              <div role="tabpanel" id="panel-pix" aria-labelledby="tab-pix">
              <PixForm
                keyType={qr.fields.pixKeyType}
                onKeyTypeChange={(v) => qr.updateField('pixKeyType', v as any)}
                pixKey={qr.fields.pixKey}
                onKeyChange={(v) => qr.updateField('pixKey', v)}
                pixName={qr.fields.pixName}
                onNameChange={(v) => qr.updateField('pixName', v)}
                pixCity={qr.fields.pixCity}
                onCityChange={(v) => qr.updateField('pixCity', v)}
                pixAmount={qr.fields.pixAmount}
                onAmountChange={(v) => qr.updateField('pixAmount', v)}
                pixTxid={qr.fields.pixTxid}
                onTxidChange={(v) => qr.updateField('pixTxid', v)}
              />
              </div>
            )}

            {qr.activeTab === 'whatsapp' && (
              <div role="tabpanel" id="panel-whatsapp" aria-labelledby="tab-whatsapp">
              <WhatsAppForm
                countryCode={qr.fields.waCountryCode}
                onCountryCodeChange={(v) => qr.updateField('waCountryCode', v)}
                phone={qr.fields.waPhone}
                onPhoneChange={(v) => qr.updateField('waPhone', v)}
                message={qr.fields.waMessage}
                onMessageChange={(v) => qr.updateField('waMessage', v)}
              />
              </div>
            )}

            {qr.activeTab === 'wifi' && (
              <div role="tabpanel" id="panel-wifi" aria-labelledby="tab-wifi">
              <WifiForm
                ssid={qr.fields.wifiSsid}
                onSsidChange={(v) => qr.updateField('wifiSsid', v)}
                pass={qr.fields.wifiPass}
                onPassChange={(v) => qr.updateField('wifiPass', v)}
                type={qr.fields.wifiType}
                onTypeChange={(v) => qr.updateField('wifiType', v)}
                hidden={qr.fields.wifiHidden}
                onHiddenChange={(v) => qr.updateField('wifiHidden', v)}
              />
              </div>
            )}

            {qr.activeTab === 'text' && (
              <div role="tabpanel" id="panel-text" aria-labelledby="tab-text">
              <TextForm value={qr.fields.plainText}              onChange={(v) => qr.updateField('plainText', v)}
            />
              </div>
            )}

            {qr.error && <ErrorAlert message={qr.error} />}

            <button
              type="submit"
              disabled={qr.isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-white bg-sky-600 hover:bg-sky-700 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-sky-600/20 transition-all cursor-pointer text-base"
            >
              {qr.isLoading ? (
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

          {qr.dataUrl && (
            <QRCodeDisplay
              dataUrl={qr.dataUrl}
              content={qr.generatedContent}
              counter={qr.counter}
              copySuccess={qr.copySuccess}
              onDownload={qr.download}
              onCopy={qr.copy}
            />
          )}

          <HistorySection
            history={qr.history}
            onReuse={(text, type) => qr.generate(text, type)}
            onClear={qr.clearHistory}
          />
        </section>

        <BannerSlot
          id="banner-slot-middle"
          position="middle"
          imageUrl="/bannermeio.png"
          targetUrl={AFFILIATE_URLS.middle}
          badgeText="Recomendação Especial"
          title="Oportunidades e Descontos Imperdíveis"
          subtitle="Explore produtos e serviços com as melhores condições e entrega garantida."
          buttonText="Conferir Agora"
          altText="Recomendação Especial"
        />

        <FAQSection />
      </main>

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
