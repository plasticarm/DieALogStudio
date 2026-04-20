import React, { useState } from 'react';
import { User } from '../types';
import { CachedImage } from './CachedImage';
import { getRandomComicAvatar } from '../utils/avatarUtils';
import { auth, googleProvider } from '../services/firebase';
import { signInWithPopup, signInAnonymously } from 'firebase/auth';

interface AuthModalProps {
  onAuth: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onAuth }) => {
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const loggedInUser: User = {
        id: user.uid,
        name: user.displayName || 'Google Architect',
        email: user.email || undefined,
        picture: user.photoURL || 'https://www.google.com/favicon.ico',
        apiKeys: {},
        role: user.email === 'plasticarm@gmail.com' ? 'admin' : 'user'
      };
      
      onAuth(loggedInUser);
    } catch (e: any) {
      console.error("Google Sign-In Error:", e);
      setError(e.message || "Failed to sign in with Google.");
    }
  };

  const handleGuestSignIn = async () => {
    try {
      setError(null);
      const result = await signInAnonymously(auth);
      const user = result.user;
      
      const randomAvatar = getRandomComicAvatar();
      const guestUser: User = {
        id: user.uid,
        name: `Guest ${Math.floor(Math.random() * 1000)}`,
        picture: randomAvatar || undefined,
        apiKeys: {},
        role: 'user'
      };
      onAuth(guestUser);
    } catch (e: any) {
      console.error("Guest Sign-In Error:", e);
      setError(e.message || "Failed to sign in as guest.");
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#dbdac8]">
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="relative z-10 w-full max-w-lg px-6">
        <div className="text-center mb-12 animate-in zoom-in duration-700">
          <div className="h-40 w-40 mx-auto mb-6 float-animation">
            <CachedImage 
              src="https://raw.githubusercontent.com/plasticarm/DieALogStudio/main/images/DieALog_LogLogo1.png" 
              alt="DiE-A-Log" 
              className="w-full h-full object-contain drop-shadow-2xl" 
            />
          </div>
          <h1 className="text-slate-800 font-header text-7xl uppercase tracking-tighter mb-2">DiE-A-Log</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-xs">Comic Studio v3.2.0</p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.1)] border border-black/5 space-y-6 animate-in slide-in-from-bottom-12 duration-1000">
          <h2 className="text-slate-800 font-black text-2xl text-center uppercase tracking-widest mb-4">Studio Initialization</h2>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold text-center border border-red-100">
              {error}
            </div>
          )}

          <button 
            onClick={handleGoogleSignIn}
            className="w-full bg-white border-2 border-slate-200 text-slate-800 py-5 rounded-2xl font-black uppercase text-sm tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center justify-center gap-4 active:scale-95 shadow-sm"
          >
            <i className="fa-brands fa-google text-xl text-amber-700"></i>
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
              Assets are stored in your secure browser vault.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};