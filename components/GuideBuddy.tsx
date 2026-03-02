import React, { useState, useEffect, useRef } from 'react';

interface GuideStep {
  id: string;
  target: string;
  text: string;
}

const GUIDE_STEPS: GuideStep[] = [
  { id: 'select-comic', target: 'library-series', text: "Start by picking a series from your vault. This initializes the studio." },
  { id: 'select-model', target: 'studio-model', text: "In the Studio, choose your Render Engine. Pro yields the highest detail." },
  { id: 'set-panels', target: 'studio-panels', text: "Decide the scale of your episode. A 3-panel strip is standard for gags." },
  { id: 'prompt-studio', target: 'studio-prompt', text: "Enter your story directives here. Be descriptive about the action!" },
  { id: 'render-comic', target: 'studio-render', text: "Commit the render! Our AI architect will visualize your script now." },
  { id: 'save-vault', target: 'studio-save', text: "Happy with the results? Secure this asset in your production vault." },
  { id: 'prepare-clean', target: 'studio-clean', text: "Ready for dialogue? Prepare a clean asset to layer your AR text boxes." },
  { id: 'bind-book', target: 'binder-add', text: "Go to the Binder and attach your generated strips to a physical volume." },
  { id: 'cover-studio', target: 'binder-cover', text: "A series needs a face. Let's design a cinematic cover illustration." },
  { id: 'gen-cover', target: 'cover-generate', text: "Describe the cover vibe and render a high-quality production image." },
  { id: 'open-reader', target: 'binder-reader', text: "Check your flow! Open the Reader to see the volume as a collector would." },
  { id: 'export-pdf', target: 'binder-pdf', text: "Standardize your output. Generate a high-resolution production PDF." },
  { id: 'export-assets', target: 'binder-zip', text: "Packaging for devs? Export a ZIP of all clean assets for game integration." },
  { id: 'edit-genome', target: 'genome-style', text: "Consistency is key. Use the Genome tab to lock in master aesthetics." },
  { id: 'add-characters', target: 'genome-char', text: "Define your cast's visual DNA to ensure they look the same every time." },
  { id: 'commit-dna', target: 'genome-commit', text: "Commit your updates to the series core to update all future rendering logic." },
  { id: 'secure-all', target: 'header-sync', text: "All set! Make sure your assets are fully secured in the cloud vault." },
];

interface GuideBuddyProps {
  currentStepIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  enabled: boolean;
}

export const GuideBuddy: React.FC<GuideBuddyProps> = ({ currentStepIndex, onNext, onPrev, onClose, enabled }) => {
  const [position, setPosition] = useState<{ top: number, left: number, width: number, height: number } | null>(null);
  const buddyRef = useRef<HTMLDivElement>(null);
  const step = GUIDE_STEPS[currentStepIndex] || GUIDE_STEPS[0];

  useEffect(() => {
    if (!enabled) return;

    const updatePosition = () => {
      const targetElement = document.querySelector(`[data-guide="${step.target}"]`);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        setPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height
        });
      } else {
        setPosition(null);
      }
    };

    updatePosition();

    const observer = new MutationObserver(updatePosition);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [step, enabled]);

  if (!enabled || !position) return null;

  return (
    <div 
      className="fixed z-[9999] pointer-events-none transition-all duration-700 ease-in-out"
      style={{
        top: position.top + position.height / 2,
        left: position.left + position.width / 2,
      }}
    >
      {/* Target Highlight */}
      <div 
        className="absolute -translate-x-1/2 -translate-y-1/2 border-4 border-yellow-400 rounded-2xl animate-pulse shadow-[0_0_20px_rgba(234,179,8,0.5)]"
        style={{ width: position.width + 10, height: position.height + 10 }}
      ></div>

      {/* Buddy Bubble */}
      <div 
        ref={buddyRef}
        className="absolute left-12 -top-12 w-64 glass p-4 rounded-3xl shadow-2xl pointer-events-auto border-2 border-slate-800/10 animate-in slide-in-from-left-4"
      >
        <div className="flex items-center gap-3 mb-3">
          <img 
            src="https://raw.githubusercontent.com/plasticarm/DieALogStudio/main/images/DieALog_LogLogo1.png" 
            className="w-8 h-8 object-contain float-animation"
            alt="Buddy"
          />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Production Guide</span>
        </div>
        <p className="text-xs font-bold text-slate-700 leading-relaxed mb-4">
          {step.text}
        </p>
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            <button onClick={onPrev} disabled={currentStepIndex === 0} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] hover:bg-slate-200 transition-colors disabled:opacity-30">
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button onClick={onNext} disabled={currentStepIndex === GUIDE_STEPS.length - 1} className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center text-[10px] hover:bg-slate-900 transition-colors disabled:opacity-30">
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
          <button onClick={onClose} className="text-[9px] font-black uppercase text-slate-400 hover:text-rose-500 transition-colors">Dismiss</button>
        </div>
      </div>
    </div>
  );
};