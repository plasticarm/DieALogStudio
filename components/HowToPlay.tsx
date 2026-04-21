import React from 'react';

interface HowToPlayProps {
  onBack: () => void;
}

export const HowToPlay: React.FC<HowToPlayProps> = ({ onBack }) => {
  return (
    <div className="absolute inset-0 z-50 bg-[#dbdac8] overflow-y-auto w-full h-full pb-20">
      <button 
        onClick={onBack} 
        className="fixed top-8 left-8 text-slate-500 hover:text-slate-800 font-black uppercase tracking-widest text-xs z-[60] bg-white/50 backdrop-blur px-4 py-2 rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all"
      >
        <i className="fa-solid fa-arrow-left mr-2"></i> Back
      </button>

      <div className="max-w-4xl mx-auto pt-24 px-6 md:px-12 flex flex-col gap-12 pb-24">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex w-24 h-24 bg-amber-600 rounded-[2rem] items-center justify-center text-white text-4xl shadow-2xl mb-8">
            <i className="fa-solid fa-gamepad"></i>
          </div>
          <h1 className="text-5xl font-header uppercase tracking-widest text-slate-800 mb-2">How To Play</h1>
          <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">DiE-A-Log Studio • Best for 3+ Players</p>
        </div>

        <div className="grid gap-8">
          
          {/* Starting a New Game */}
          <section className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col gap-6">
            <div className="flex items-center gap-4 text-amber-600">
              <i className="fa-solid fa-rocket text-2xl"></i>
              <h2 className="text-2xl font-black uppercase tracking-widest">Starting A New Game</h2>
            </div>
            
            <div className="space-y-4 text-slate-600 leading-relaxed font-medium">
              <p>
                To kick off the fun, click the bold <span className="inline-flex items-center px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-black uppercase tracking-widest mx-1"><i className="fa-solid fa-plus mr-2"></i> Start New Game</span> button on the main lobby screen.
              </p>
              <p>
                This will create a unique <strong>Game Code</strong> (e.g., GAME_CODE_123) and place you in the host lobby. As the host, you can customize the game settings before starting:
              </p>
              
              <ul className="list-none space-y-3 mt-4">
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1"><i className="fa-solid fa-clock"></i></span>
                  <span><strong>Time Limit:</strong> Adjust how many minutes each round lasts (1-10 minutes).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1"><i className="fa-solid fa-trophy"></i></span>
                  <span><strong>Points to Win:</strong> Choose how many points are needed to win the entire game (1-10 points).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1"><i className="fa-solid fa-leaf"></i></span>
                  <span><strong>Branches:</strong> Calculated automatically based on rounds and time limits. Branches are used to buy hints or canned text.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Joining a Game */}
          <section className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col gap-6">
            <div className="flex items-center gap-4 text-emerald-600">
              <i className="fa-solid fa-door-open text-2xl"></i>
              <h2 className="text-2xl font-black uppercase tracking-widest">Joining A Game</h2>
            </div>
            
            <div className="space-y-4 text-slate-600 leading-relaxed font-medium">
              <p>
                If your friend has already created a game, look for the text input box labeled <span className="font-mono text-slate-400">ENTER GAME CODE</span>.
              </p>
              <p>
                Type in the exact code they give you and press <span className="inline-flex hover:bg-slate-200 transition-colors cursor-default items-center px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-black uppercase tracking-widest mx-1"><i className="fa-solid fa-arrow-right-to-bracket mr-2"></i> Join Game</span>. Once you're in, you will appear in the lobby alongside the other players, waiting for the host to officially start the game.
              </p>
              <p className="text-xs text-slate-400 italic">
                Pro Tip: You can also use the "Copy Link" button in the lobby to share a direct join link!
              </p>
            </div>
          </section>

          {/* How to Play */}
          <section className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col gap-6">
            <div className="flex items-center gap-4 text-indigo-600">
              <i className="fa-solid fa-pen-nib text-2xl"></i>
              <h2 className="text-2xl font-black uppercase tracking-widest">How It Is Played</h2>
            </div>
            
            <div className="space-y-6 text-slate-600 leading-relaxed font-medium">
              <p>
                Every round, a random comic strip is selected, but the character dialogue has been wiped blank! One player is randomly chosen to be the <strong>Judge</strong>, and everyone else are the <strong>Writers</strong>.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mt-4">
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 text-6xl">
                    <i className="fa-solid fa-gavel"></i>
                  </div>
                  <h3 className="font-black text-slate-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <i className="fa-solid fa-gavel text-amber-600"></i> The Judge
                  </h3>
                  <p className="text-sm">
                    The Judge sits back and waits while the writers scramble. Once the time is up or everyone submits, the Judge will review all the anonymous comic entries and pick their absolute favorite to win the round!
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 text-6xl">
                    <i className="fa-solid fa-pen"></i>
                  </div>
                  <h3 className="font-black text-slate-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <i className="fa-solid fa-pen text-indigo-600"></i> The Writers
                  </h3>
                  <p className="text-sm">
                    Writers tap on the empty speech bubbles to type their funniest, weirdest, or most dramatic dialogue. You're racing against the clock! Submit before time runs out.
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-6">
                <h3 className="font-black text-slate-800 uppercase tracking-widest mb-4">Using Your Branches</h3>
                <p className="mb-4">
                  Stuck with writer's block? You can spend the <strong>Branches</strong> (<i className="fa-solid fa-leaf text-emerald-500 mx-1"></i>) you got at the beginning of the game for a leg up:
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-3 bg-amber-50 text-amber-700 px-4 py-3 rounded-2xl border border-amber-100">
                    <i className="fa-solid fa-lightbulb text-amber-500"></i>
                    <div className="text-xs">
                      <strong>Hint:</strong> Costs 1 Branch. Fills in the original script text for that dialogue bubble.
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 px-4 py-3 rounded-2xl border border-emerald-100">
                    <i className="fa-solid fa-comment-dots text-emerald-500"></i>
                    <div className="text-xs">
                      <strong>Canned:</strong> Costs 1 Branch. Drops in a funny, randomized phrase!
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-6 bg-slate-800 text-white rounded-3xl">
                <h3 className="font-black text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-trophy"></i> Winning The Game
                </h3>
                <p className="text-sm text-slate-300">
                  First person to reach the target <strong>Points to Win</strong> gets crowned the overall champion and achieves eternal comic glory! 
                </p>
              </div>

            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
