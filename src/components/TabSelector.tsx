import React from 'react';
import { Globe, CreditCard, MessageCircle, Wifi, FileText } from 'lucide-react';
import type { TabType } from '../hooks/useQRCode';

interface TabSelectorProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { id: TabType; label: string; icon: React.ElementType; activeClasses: string }[] = [
  {
    id: 'url',
    label: 'Link / URL',
    icon: Globe,
    activeClasses: 'bg-sky-50 text-sky-700 border-sky-300 ring-2 ring-sky-100 shadow-xs',
  },
  {
    id: 'pix',
    label: 'PIX',
    icon: CreditCard,
    activeClasses: 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-100 shadow-xs',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: MessageCircle,
    activeClasses: 'bg-[#e6f4ea] text-[#0f5132] border-[#a3d9b8] ring-2 ring-emerald-100 shadow-xs',
  },
  {
    id: 'wifi',
    label: 'Wi-Fi',
    icon: Wifi,
    activeClasses: 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-100 shadow-xs',
  },
  {
    id: 'text',
    label: 'Texto',
    icon: FileText,
    activeClasses: 'bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-100 shadow-xs',
  },
];

export const TabSelector: React.FC<TabSelectorProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="mb-6">
      <label
        id="tab-label"
        className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5"
      >
        Escolha o Tipo de Conteúdo:
      </label>
      <div
        role="tablist"
        aria-labelledby="tab-label"
        className="grid grid-cols-2 sm:grid-cols-5 gap-2"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const panelId = `panel-${tab.id}`;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isActive
                  ? tab.activeClasses
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
