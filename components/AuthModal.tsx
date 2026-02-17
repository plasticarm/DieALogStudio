import React from 'react';
import { User } from '../types';

interface AuthModalProps {
  onAuth: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onAuth }) => {
  const handleGoogleSignIn = async () => {
    const mockUser: User = {
      id: `u_${Math.random().toString(36).substr(2, 9)}`,
      name: 'Google Architect',
      email: 'architect@google.com',
      picture: 'https://www.google.com/favicon.ico',
      apiKeys: {}
    };
    
    try {
      await (window as any).aistudio?.openSelectKey();
    } catch (e) {}
    
    onAuth(mockUser);
  };

  const handleGuestSignIn = () => {
    const guestUser: User = {
      id: 'guest_123',
      name: 'Guest Architect',
      apiKeys: {}
    };
    onAuth(guestUser);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#dbdac8]">
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="relative z-10 w-full max-w-lg px-6">
        <div className="text-center mb-12 animate-in zoom-in duration-700">
          <div className="h-32 w-32 bg-slate-800 mx-auto rounded-3xl flex items-center justify-center shadow-2xl float-animation mb-8">
            <i className="fa-solid fa-compass-drafting text-white text-6xl"></i>
          </div>
          <h1 className="text-slate-800 font-header text-7xl uppercase tracking-tighter mb-2">Die A Log</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-xs">Architect Studio v3.1.7</p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.1)] border border-black/5 space-y-6 animate-in slide-in-from-bottom-12 duration-1000">
          <h2 className="text-slate-800 font-black text-2xl text-center uppercase tracking-widest mb-4">Workspace Initialization</h2>
          
          <button 
            onClick={handleGoogleSignIn}
            className="w-full bg-white border-2 border-slate-200 text-slate-800 py-5 rounded-2xl font-black uppercase text-sm tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center justify-center gap-4 active:scale-95 shadow-sm"
          >
            <i className="fa-brands fa-google text-xl text-brand-indigo"></i>
            Sign in with Google
          </button>

          <button 
            onClick={handleGuestSignIn}
            className="w-full bg-slate-800 text-white py-5 rounded-2xl font-black uppercase text-sm tracking-[0.2em] hover:bg-slate-900 transition-all flex items-center justify-center gap-4 active:scale-95 shadow-xl"
          >
            <i className="fa-solid fa-user-secret text-xl"></i>
            Guest Access
          </button>

          <div className="pt-6 text-center">
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest leading-loose">
              Local-first production protocol active. <br/>
              Chronicles are stored in your secure browser vault.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};