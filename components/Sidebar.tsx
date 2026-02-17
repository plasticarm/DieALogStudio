import React, { useRef } from 'react';

interface SidebarProps {
  currentTab: 'generate' | 'train' | 'book' | 'books';
  setCurrentTab: (tab: 'generate' | 'train' | 'book' | 'books') => void;
  onExport: () => void;
  onImport: (file: File) => void;
  hasKey: boolean | null;
  onOpenKeyVault: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  setCurrentTab, 
  onExport, 
  onImport,
  hasKey,
  onOpenKeyVault
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navItems = [
    { id: 'books', label: 'My Library', icon: '📚' },
    { id: 'train', label: 'DNA', icon: '🧠' },
    { id: 'generate', label: 'Studio', icon: '🎨' },
    { id: 'book', label: 'Volume Editor', icon: '📖' },
  ] as const;

  return (
    <div className="h-16 bg-white border-b border-brand-300 flex items-center justify-between px-8 shadow-md z-50">
      <div className="flex items-center gap-4">
        <img 
          src="https://raw.githubusercontent.com/plasticarm/DieALogStudio/main/images/DieALog_Logo1.png" 
          alt="Die A Log Logo" 
          className="h-12 w-auto object-contain cursor-pointer"
          onClick={() => setCurrentTab('books')}
        />
        <div className="h-6 w-[1px] bg-slate-300"></div>
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest hidden sm:block italic">Series Management Suite</p>
      </div>

      <nav className="flex items-center gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentTab(item.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all text-sm font-semibold ${
              currentTab === item.id
                ? 'bg-slate-800 text-slate-50 shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        {/* User Account / Key Vault Status */}
        <div 
          onClick={onOpenKeyVault}
          className={`flex items-center gap-3 px-3 py-1.5 rounded-2xl border transition-all cursor-pointer hover:bg-slate-50 group ${
            hasKey 
              ? 'border-emerald-200 bg-emerald-50/30' 
              : 'border-rose-200 bg-rose-50/30'
          }`}
          title="Account Settings - Manage Studio Key Connection"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-inner transition-colors ${
            hasKey ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
          }`}>
            {hasKey ? 'GS' : '?'}
          </div>
          <div className="flex flex-col">
            <span className={`text-[9px] font-black uppercase tracking-widest ${hasKey ? 'text-emerald-700' : 'text-slate-500'}`}>
              {hasKey ? 'Studio Connected' : 'Disconnected'}
            </span>
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter group-hover:text-brand-600">
              Manage Vault
            </span>
          </div>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-300 ml-2">
          <button 
            onClick={onExport}
            className="px-3 py-1.5 text-[10px] font-black uppercase text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
            title="Export full project"
          >
            💾 Save
          </button>
          <div className="w-[1px] h-4 bg-slate-300 mx-1"></div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 text-[10px] font-black uppercase text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
            title="Load project"
          >
            📂 Load
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])} 
            accept=".json" 
            className="hidden" 
          />
        </div>
      </div>
    </div>
  );
};