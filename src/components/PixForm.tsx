import React from 'react';
import { CreditCard, User, MapPin, DollarSign, Hash } from 'lucide-react';
import type { FormFields } from '../hooks/useQRCode';

interface PixFormProps {
  keyType: FormFields['pixKeyType'] extends never ? string : string;
  onKeyTypeChange: (v: string) => void;
  pixKey: string;
  onKeyChange: (v: string) => void;
  pixName: string;
  onNameChange: (v: string) => void;
  pixCity: string;
  onCityChange: (v: string) => void;
  pixAmount: string;
  onAmountChange: (v: string) => void;
  pixTxid: string;
  onTxidChange: (v: string) => void;
}

export const PixForm: React.FC<PixFormProps> = ({
  keyType,
  onKeyTypeChange,
  pixKey,
  onKeyChange,
  pixName,
  onNameChange,
  pixCity,
  onCityChange,
  pixAmount,
  onAmountChange,
  pixTxid,
  onTxidChange,
}) => {
  const placeholder =
    keyType === 'email'
      ? 'ex: contato@seusite.com.br'
      : keyType === 'cpf'
        ? 'ex: 123.456.789-00'
        : keyType === 'phone'
          ? 'ex: 11999998888'
          : 'ex: 123e4567-e89b-12d3-a456-426614174000';

  return (
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label htmlFor="pix-type" className="block text-xs font-bold text-emerald-900 mb-1">
            Tipo de Chave:
          </label>
          <select
            id="pix-type"
            value={keyType}
            onChange={(e) => onKeyTypeChange(e.target.value)}
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
            onChange={(e) => onKeyChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2.5 bg-white border border-emerald-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
          />
        </div>
      </div>

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
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="ex: João da Silva ou Sua Loja"
            className="w-full px-3 py-2.5 bg-white border border-emerald-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
          />
        </div>
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
            onChange={(e) => onCityChange(e.target.value)}
            placeholder="ex: São Paulo"
            className="w-full px-3 py-2.5 bg-white border border-emerald-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
          />
        </div>
      </div>

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
            onChange={(e) => onAmountChange(e.target.value)}
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
            onChange={(e) => onTxidChange(e.target.value)}
            placeholder="ex: PEDIDO123"
            className="w-full px-3 py-2.5 bg-white border border-emerald-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
          />
        </div>
      </div>
    </div>
  );
};
