import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, Sparkles, Target, ShieldCheck } from 'lucide-react';
import { LOGO_TYPE_PRESETS, LOGO_LAYOUT_PRESETS } from '../../modules/logo/options';
import { playClickSound, triggerHapticFeedback } from '../../utils/soundUtils';
import { Preset } from '../../types/presets';
import { MOTION_PROFILE } from '../../lib/motion';

interface SynthesisControlsProps {
  userInput: string;
  setUserInput: (val: string) => void;
  isGenerating: boolean;
  isAnalyzing: boolean;
  onGenerate: () => void;
  onAnalyze?: () => void;
  activeTab: string;
  uploadedImage: string | null;
  selectedPreset: Preset | null;
  selectedLogoType: string;
  setSelectedLogoType: (val: string) => void;
  selectedLogoLayout: string;
  setSelectedLogoLayout: (val: string) => void;
  // Advanced Props
  selectedAspectRatio: string;
  setSelectedAspectRatio: (val: string) => void;
  showLayoutPreview?: boolean;
  setShowLayoutPreview?: (val: boolean) => void;
  // Visual Fidelity
  isVisualFidelity?: boolean;
  setIsVisualFidelity?: (val: boolean) => void;
}

export const SynthesisControls: React.FC<SynthesisControlsProps> = React.memo(({
  userInput,
  setUserInput,
  isGenerating,
  isAnalyzing,
  onGenerate,
  onAnalyze,
  activeTab,
  uploadedImage,
  selectedPreset,
  selectedLogoType,
  setSelectedLogoType,
  selectedLogoLayout,
  setSelectedLogoLayout,
  selectedAspectRatio,
  setSelectedAspectRatio,
  isVisualFidelity = false,
  setIsVisualFidelity,
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const attentionMenuRef = React.useRef<HTMLDivElement>(null);
  const [showAttentionMenu, setShowAttentionMenu] = React.useState(false);
    const availableRatios = React.useMemo(() => {
    if (selectedPreset?.altAspectRatios) {
      const ratios = [selectedPreset.aspectRatio, ...selectedPreset.altAspectRatios];
      return Array.from(new Set(ratios));
    }
    return ["1:1", "16:9", "4:5", "3:4", "9:16"];
  }, [selectedPreset]);

  const handleButtonClick = (callback: () => void) => {
    playClickSound();
    triggerHapticFeedback();
    callback();
  };

  const applyWeight = (weight: number) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selection = userInput.substring(start, end);
    
    if (!selection) return;

    const weighted = `(${selection}:${weight})`;
    const newValue = userInput.substring(0, start) + weighted + userInput.substring(end);
    setUserInput(newValue);
    setShowAttentionMenu(false); // Close menu after applying
    
    // Reset focus and selection
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + 1, start + 1 + selection.length);
      }
    }, 0);
  };
  return (
    <div className="w-full flex-shrink-0 flex flex-col transition-all duration-300 gap-3">
      
        {/* Designer Controls (Conditional) */}
      <AnimatePresence>
        {activeTab === 'logo design' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={MOTION_PROFILE.PREMIUM}
            className="grid grid-cols-2 gap-2 p-3 bg-bg-secondary border border-border-primary rounded-xl"
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-secondary">Logo Type</label>
              <select 
                value={selectedLogoType}
                onChange={(e) => setSelectedLogoType(e.target.value)}
                className="w-full bg-bg-primary border border-border-primary rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                <option value="">Default</option>
                {LOGO_TYPE_PRESETS.map(t => <option key={t.name} value={t.prompt}>{t.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-secondary">Layout Style</label>
              <select 
                value={selectedLogoLayout}
                onChange={(e) => setSelectedLogoLayout(e.target.value)}
                className="w-full bg-bg-primary border border-border-primary rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                <option value="">Default</option>
                {LOGO_LAYOUT_PRESETS.map(l => <option key={l.name} value={l.prompt}>{l.name}</option>)}
              </select>
            </div>
          </motion.div>
        )}
        {activeTab === 'vectorize' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={MOTION_PROFILE.PREMIUM}
            className="p-3 bg-bg-secondary border border-border-primary rounded-xl flex items-center justify-between gap-4"
          >
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <ShieldCheck size={14} className={isVisualFidelity ? "text-accent animate-pulse" : "text-text-secondary"} />
                Visual Fidelity Override
              </span>
              <span className="text-[10px] text-text-secondary mt-0.5 leading-relaxed">
                Injects custom protocols for a crisp, zero-noise, vector-path compliant flat look.
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleButtonClick(() => setIsVisualFidelity?.(!isVisualFidelity))}
              className={`px-3 py-1.5 rounded-lg border text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
                isVisualFidelity
                  ? 'bg-accent/20 border-accent text-accent shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                  : 'bg-bg-primary border-border-primary text-text-secondary hover:border-text-secondary/30'
              }`}
            >
              {isVisualFidelity ? 'Active' : 'Off'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={MOTION_PROFILE.PREMIUM}
        className="relative bg-bg-secondary rounded-2xl shadow-md border-2 border-border-primary group focus-within:ring-2 focus-within:ring-accent/40 focus-within:border-accent transition-all duration-300 z-10"
      >
        {/* Top: Input Area */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Describe what you want to create..."
            className="w-full bg-transparent p-4 text-sm font-sans focus:outline-none resize-none h-16 placeholder:text-text-secondary/60 text-text-primary font-medium"
          />

          <div className="absolute right-3 top-3 flex items-center gap-2">
            {userInput && (
              <button 
                onClick={() => handleButtonClick(() => setUserInput(''))}
                className="p-1.5 text-text-secondary hover:text-red-500 transition-colors rounded-lg hover:bg-bg-primary"
                title="Clear Input"
              >
                <X size={14} />
              </button>
            )}
            <div className="relative" ref={attentionMenuRef}>
              <button 
                onClick={() => handleButtonClick(() => setShowAttentionMenu(!showAttentionMenu))}
                className={`p-1.5 transition-colors rounded-lg ${showAttentionMenu ? 'text-accent bg-accent/10' : 'text-text-secondary hover:text-text-primary hover:bg-bg-primary'}`}
                title="Attention Weights"
              >
                <Target size={14} />
              </button>
              {/* Attention Menu Dropdown */}
              <div className={`absolute right-0 top-full mt-2 w-64 p-3 bg-bg-secondary border border-border-primary rounded-xl shadow-xl transition-all z-[100] ${showAttentionMenu ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-2'}`}>
                <h4 className="text-xs font-semibold text-text-primary mb-2 flex items-center gap-2">
                  <Target size={12} className="text-accent" /> Attention Control
                </h4>
                <p className="text-[10px] text-text-secondary leading-relaxed mb-3">
                  Highlight text to adjust its priority in the synthesis prompt.
                </p>
                <div className="space-y-2">
                  {[1.5, 1.2, 0.8].map(w => (
                    <button 
                      key={w}
                      onClick={() => handleButtonClick(() => applyWeight(w))}
                      className="w-full flex items-center justify-between p-2 bg-bg-primary rounded-lg border border-border-primary hover:border-accent/40 group transition-all"
                    >
                      <code className="text-[10px] text-accent font-mono group-hover:scale-110 transition-transform">(text:{w})</code>
                      <span className="text-[10px] text-text-secondary uppercase font-bold tracking-tighter">
                        {w >= 1.5 ? 'Extreme' : w >= 1.2 ? 'Strong' : 'Subtle'} Focus
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        {selectedPreset?.presetDetails && (
          <div className="px-4 pb-3 pt-1 border-t border-border-primary/50">
            <h4 className="text-[10px] uppercase font-bold text-accent mb-1 flex items-center gap-1"><Sparkles size={10} /> {selectedPreset.name}</h4>
            <p className="text-[10px] text-text-secondary leading-relaxed">{selectedPreset.presetDetails.promptingNotes}</p>
          </div>
        )}
      </motion.div>

      {/* Aspect Ratio Selection */}
      <div className="p-3 bg-bg-secondary border border-border-primary rounded-xl flex flex-col gap-2 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <label className="text-[10px] uppercase tracking-wider text-text-secondary font-bold">Aspect Ratio</label>
          <span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-full">{selectedAspectRatio}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {availableRatios.map((ratio) => (
            <button
              key={ratio}
              onClick={() => handleButtonClick(() => setSelectedAspectRatio(ratio))}
              className={`flex-1 min-w-[60px] py-2 rounded-lg border text-[10px] font-bold transition-all ${
                selectedAspectRatio === ratio
                  ? 'bg-accent/10 border-accent text-accent shadow-[0_0_10px_rgba(var(--accent-rgb),0.1)]'
                  : 'bg-bg-primary border-border-primary text-text-secondary hover:border-text-secondary/30'
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom: Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
        {uploadedImage && (activeTab === 'vectorize' || activeTab === 'logo design') && onAnalyze && (
          <motion.button
            whileHover={{ scale: 1.02, transition: MOTION_PROFILE.TACTILE }}
            whileTap={{ scale: 0.98, transition: MOTION_PROFILE.TACTILE }}
            onClick={() => handleButtonClick(onAnalyze)}
            disabled={isAnalyzing}
            className="flex-1 bg-bg-secondary text-text-primary py-4 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-bg-primary border border-border-primary shadow-sm transition-all"
          >
            <Sparkles size={14} className="text-accent" />
            <span>Extract Style</span>
          </motion.button>
        )}

        <motion.button
            whileHover={{ scale: 1.02, transition: MOTION_PROFILE.TACTILE }}
            whileTap={{ scale: 0.98, transition: MOTION_PROFILE.TACTILE }}
            onClick={() => handleButtonClick(onGenerate)}
            disabled={false}
            className={`flex-[2] py-4 rounded-xl text-sm font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group ${
              isGenerating 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-accent text-bg-primary hover:bg-accent/90'
            }`}
          >
            {/* Subtle Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            {isGenerating ? <X size={18} className="animate-pulse" /> : <Zap size={18} className="fill-current" />}
            <span className="relative z-10">{isGenerating ? 'Stop Process' : 'Generate'}</span>
          </motion.button>
      </div>
    </div>
  );
});
