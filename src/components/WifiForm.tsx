import React, { useState } from 'react';
import { Wifi, Lock, Eye, EyeOff } from 'lucide-react';
import type { FormFields } from '../hooks/useQRCode';

interface WifiFormProps {
  ssid: string;
  onSsidChange: (v: string) => void;
  pass: string;
  onPassChange: (v: string) => void;
  type: FormFields['wifiType'];
  onTypeChange: (v: FormFields['wifiType']) => void;
  hidden: boolean;
  onHiddenChange: (v: boolean) => void;
}

export const WifiForm: React.FC<WifiFormProps> = ({
  ssid,
  onSsidChange,
  pass,
  onPassChange,
  type,
  onTypeChange,
  hidden,
  onHiddenChange,
}) => {
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-3.5">
      <div className="pb-2 border-b border-amber-200/70">
        <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
          <Wifi className="w-4 h-4 text-amber-600" />
          Conexão Wi-Fi Instantânea
        </span>
      </div>

      <div>
        <label htmlFor="wifi-ssid" className="block text-xs font-bold text-amber-900 mb-1">
          Nome da Rede (SSID):*
        </label>
        <input
          id="wifi-ssid"
          type="text"
          value={ssid}
          onChange={(e) => onSsidChange(e.target.value)}
          placeholder="ex: Casa_5G ou Cafe_Clientes"
          className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="wifi-pass" className="block text-xs font-bold text-amber-900 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              Senha da Rede:
            </span>
            {pass && (
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="text-[11px] text-amber-800 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                {showPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showPass ? 'Ocultar' : 'Mostrar'}</span>
              </button>
            )}
          </label>
          <input
            id="wifi-pass"
            type={showPass ? 'text' : 'password'}
            value={pass}
            onChange={(e) => onPassChange(e.target.value)}
            placeholder={type === 'nopass' ? 'Rede aberta (sem senha)' : 'Digite a senha do Wi-Fi'}
            disabled={type === 'nopass'}
            className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 disabled:bg-slate-100 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label htmlFor="wifi-type" className="block text-xs font-bold text-amber-900 mb-1">
            Tipo de Segurança:
          </label>
          <select
            id="wifi-type"
            value={type}
            onChange={(e) => onTypeChange(e.target.value as FormFields['wifiType'])}
            className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 cursor-pointer"
          >
            <option value="WPA">WPA / WPA2 / WPA3 (Padrão)</option>
            <option value="WEP">WEP (Antigo)</option>
            <option value="nopass">Sem Senha (Aberta)</option>
          </select>
        </div>
      </div>

      <div className="pt-1">
        <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-amber-900">
          <input
            type="checkbox"
            checked={hidden}
            onChange={(e) => onHiddenChange(e.target.checked)}
            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-amber-300"
          />
          <span>Esta é uma rede oculta (não transmite o SSID publicamente)</span>
        </label>
      </div>
    </div>
  );
};
