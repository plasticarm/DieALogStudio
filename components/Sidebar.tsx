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
        {/* Key Vault Trigger */}
        <button 
          onClick={onOpenKeyVault}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${
            hasKey 
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700' 
              : 'border-rose-200 bg-rose-50 text-rose-700 animate-pulse'
          }`}
          title="Configure Google AI API Key"
        >
          <span className={`w-2 h-2 rounded-full ${hasKey ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          {hasKey ? 'Key Active' : 'Set API Key'}
        </button>

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