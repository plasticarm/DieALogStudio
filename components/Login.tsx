
import React from 'react';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
      <div className="text-center p-8 bg-slate-800 rounded-lg shadow-xl">
        <h1 className="text-4xl font-bold mb-4">Comic Creator</h1>
        <p className="mb-8">Bring your stories to life. Sign in to start creating.</p>
        <button 
          onClick={onLogin} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          <i className="fa-brands fa-google mr-2"></i> Sign in with Google
        </button>
      </div>
    </div>
  );
};
