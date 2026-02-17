import React from 'react';
import { User } from '../types';

interface AuthModalProps {
  onAuth: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onAuth }) => {
  const handleGoogleSignIn = async () => {
    // Mocking Google Sign In
    const mockUser: User = {
      id: `u_${Math.random().toString(36).substr(2, 9)}`,
      name: 'Google Architect',
      email: 'architect@google.com',
      picture: 'https://www.google.com/favicon.ico',
      apiKeys: {}
    };
    
    // In a real environment we might trigger window.aistudio.openSelectKey() here
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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950">
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="relative z-10 w-full max-w-lg px-6">
        <div className="text-center mb-12 animate-in zoom-in duration-700">
          <div className="h-32 w-32 bg-indigo-600 mx-auto rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.4)] float-animation mb-8">
            <i className="fa-solid fa-compass-drafting text-white text-6xl"></i>
          </div>
          <h1 className="text-white font-header text-7xl uppercase tracking-tighter mb-2">Die A Log</h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-xs">Architect Studio v3.1.6</p>
        </div>

        <div className="glass p-10 rounded-[2.5rem] shadow-2xl space-y-6 animate-in slide-in-from-bottom-12 duration-1000">
          <h2 className="text-white font-black text-2xl text-center uppercase tracking-widest mb-4">Initialize Workspace</h2>
          
          <button 
            onClick={handleGoogleSignIn}
            className="w-full bg-white text-slate-900 py-5 rounded-2xl font-black uppercase text-sm tracking-[0.2em] hover:bg-slate-100 transition-all flex items-center justify-center gap-4 active:scale-95"
          >
            <i className="fa-brands fa-google text-xl"></i>
            Sign in with Google
          </button>

          <button 
            onClick={handleGuestSignIn}
            className="w-full bg-slate-800 text-slate-300 py-5 rounded-2xl font-black uppercase text-sm tracking-[0.2em] hover:bg-slate-700 border border-slate-700 transition-all flex items-center justify-center gap-4 active:scale-95"
          >
            <i className="fa-solid fa-user-secret text-xl"></i>
            Guest Architect
          </button>

          <div className="pt-6 text-center">
            <p className="text-slate-500 text-[9px] uppercase tracking-widest leading-loose">
              By entering, you accept the local-first production protocol. <br/>
              Your chronicles are stored securely in your browser's vault.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};