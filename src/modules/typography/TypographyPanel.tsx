import React, { useMemo, useCallback, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles,
  CheckCircle2,
  Zap,
  X,
  ImageOff,
  Target
} from 'lucide-react';
import { MOTION_PROFILE } from '../../lib/motion';

// Image Fallback Component
const PresetImage: React.FC<{ src: string; name: string }> = ({ src, name }) => {
  const [hasError, setHasError] = React.useState(false);

  if (hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-bg-tertiary text-text-secondary p-4 text-center">
        <ImageOff size={24} className="mb-2 opacity-20" />
        <span className="text-[9px] font-bold uppercase tracking-wider opacity-60">Preview missing</span>
        {process.env.NODE_ENV === 'development' && (
          <span className="text-[7px] mt-1 break-all opacity-40 font-mono leading-tight">{src}</span>
        )}
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={`${name} reference`}
      onError={() => {
        console.warn(`[TYPOGRAPHY] Failed to load preview image: ${src}`);
        setHasError(true);
      }}
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
    />
  );
};
import { Preset, PresetCategory } from '../../types/presets';
import { playClickSound, triggerHapticFeedback } from '../../utils/soundUtils';

/**
 * TYPOGRAPHY UI COMPONENT
 * Consolidated UI for preset selection, mode toggles, and text input.
 * Preserves Elite 72 Series logic and React.memo performance.
 */
interface TypographyPanelProps {
  userInput: string;
  setUserInput: (val: string) => void;
  selectedPreset: Preset | null;
  onSelectPreset: (preset: Preset) => void;
  categories: readonly PresetCategory[];
  isGenerating: boolean;
  onGenerate: () => void;
  selectedAspectRatio: string;
  setSelectedAspectRatio: (val: string) => void;
  favoritePresets?: Set<string>;
  onToggleFavorite?: (presetName: string) => void;
}

export const TypographyPanel: React.FC<TypographyPanelProps> = React.memo(({
  userInput,
  setUserInput,
  selectedPreset,
  onSelectPreset,
  categories,
  isGenerating,
  
  
  selectedAspectRatio,
  setSelectedAspectRatio,
  onGenerate,
  favoritePresets = new Set(),
  onToggleFavorite
}) => {
  const handleButtonClick = useCallback((callback: () => void) => {
    playClickSound();
    triggerHapticFeedback();
    callback();
  }, []);

  const availableRatios = useMemo(() => {
    if (selectedPreset?.altAspectRatios) {
      return Array.from(new Set([selectedPreset.aspectRatio, ...selectedPreset.altAspectRatios]));
    }
    return ["1:1", "16:9", "4:5", "3:4", "9:16"];
  }, [selectedPreset]);

  // CATEGORY MAPPING: Show all curated categories
  const eliteCategories = useMemo(() => {
    return categories;
  }, [categories]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showAttentionMenu, setShowAttentionMenu] = useState(false);

  const applyWeight = useCallback((weight: number) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selection = userInput.substring(start, end);
    
    if (!selection) return;

    const weighted = `(${selection}:${weight})`;
    const newValue = userInput.substring(0, start) + weighted + userInput.substring(end);
    setUserInput(newValue);
    setShowAttentionMenu(false);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + 1, start + 1 + selection.length);
      }
    }, 0);
  }, [userInput, setUserInput]);

  return (
    <div className="space-y-6 pb-24">
      {/* Input Area */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={MOTION_PROFILE.PREMIUM}
        className="relative bg-bg-secondary rounded-2xl shadow-lg border-2 border-border-primary focus-within:border-accent transition-all duration-300"
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] uppercase font-bold text-text-secondary tracking-widest">
              Synthesis Target
            </label>
            
            <div className="relative">
              <button 
                onClick={() => handleButtonClick(() => setShowAttentionMenu(!showAttentionMenu))}
                className={`p-1.5 transition-colors rounded-lg flex items-center gap-1.5 border ${
                  showAttentionMenu 
                  ? 'text-accent bg-accent/10 border-accent' 
                  : 'text-text-secondary border-transparent hover:text-text-primary hover:bg-bg-primary'
                }`}
                title="Attention Weights"
              >
                <Target size={12} />
                <span className="text-[9px] font-bold uppercase">Weighting</span>
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
          
          <textarea
            ref={textareaRef}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Enter typography text..."
            className="w-full bg-transparent text-lg font-sans font-bold focus:outline-none resize-none h-16 placeholder:text-text-secondary/30 text-text-primary custom-scrollbar"
          />
        </div>

        {selectedPreset && (
          <div className="px-4 pb-3 border-t border-border-primary/50 pt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-accent/10 rounded-lg">
                <Sparkles size={12} className="text-accent" />
              </div>
              <span className="text-xs font-bold text-text-primary">{selectedPreset.name}</span>
            </div>
            {selectedPreset.presetDetails?.category && (
              <span className="text-[10px] bg-bg-tertiary px-2 py-0.5 rounded-full text-text-secondary font-medium">
                {selectedPreset.presetDetails.category}
              </span>
            )}
          </div>
        )}
      </motion.div>

      {/* Aspect Ratio */}
      <div className="p-4 bg-bg-secondary/50 rounded-2xl border border-border-primary space-y-4">
        <div className="flex items-center justify-between">
           <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Aspect Ratio</label>
           <span className="text-[10px] font-mono text-accent">{selectedAspectRatio}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {availableRatios.map(ratio => (
            <button
              key={ratio}
              onClick={() => handleButtonClick(() => setSelectedAspectRatio(ratio))}
              className={`flex-1 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                selectedAspectRatio === ratio
                ? 'bg-accent/10 border-accent text-accent'
                : 'bg-bg-primary border-border-primary text-text-secondary hover:border-text-secondary/30'
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>

      {/* ACTION BAR: Save / Generate */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
        <motion.button
          whileTap={{ scale: 0.98, transition: MOTION_PROFILE.TACTILE }}
          whileHover={{ scale: 1.02, transition: MOTION_PROFILE.TACTILE }}
          onClick={() => handleButtonClick(onGenerate)}
          className={`flex-1 py-4 rounded-xl text-sm font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-lg transition-all relative overflow-hidden group ${
            isGenerating 
              ? 'bg-red-500 text-white' 
              : 'bg-accent text-bg-primary'
          }`}
        >
          {/* Subtle Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          {isGenerating ? (
            <X size={18} className="animate-pulse" />
          ) : (
            <Zap size={18} className="fill-current" />
          )}
          <span className="relative z-10 font-black">
            {isGenerating ? 'Stop Process' : 'Generate'}
          </span>
        </motion.button>
      </div>

      <div className="h-2" />

      {/* PRESET GRID MAPPING (Elite 72) */}
      <div className="space-y-8">
        {eliteCategories.map((cat) => (
          <div key={cat.category} className="space-y-4">
            <div className="flex items-center gap-3 px-1">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary whitespace-nowrap">
                {cat.category}
              </h3>
              <div className="h-px w-full bg-border-primary" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {cat.presets.map((preset) => {
                const isSelected = selectedPreset?.name === preset.name;
                const isFavorite = favoritePresets?.has(preset.name);
                
                return (
                  <button
                    key={preset.name}
                    onClick={() => handleButtonClick(() => onSelectPreset(preset))}
                    className={`relative flex flex-col p-2 rounded-xl text-left transition-all overflow-hidden group ${
                      isSelected 
                        ? 'border-2 border-accent bg-accent/5' 
                        : 'border border-border-primary bg-bg-secondary hover:border-accent/30'
                    }`}
                  >
                    {preset.previewImagePath ? (
                      <div className="relative w-full aspect-square mb-2 rounded-lg overflow-hidden border border-border-primary/50">
                        <PresetImage src={preset.previewImagePath} name={preset.name} />
                        {isSelected && (
                          <div className="absolute inset-0 bg-accent/20 mix-blend-overlay" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ) : (
                      <div className="relative w-full aspect-square mb-2 rounded-lg border border-border-primary/50 bg-bg-tertiary flex items-center justify-center p-2 text-center">
                        <span className="text-xs font-bold text-text-secondary/50 uppercase tracking-widest break-words leading-tight">
                          {preset.name.replace(/_/g, ' ')}
                        </span>
                      </div>
                    )}
                    <div className="relative z-10 flex flex-col gap-1 w-full">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-[10px] font-bold truncate ${isSelected ? 'text-accent' : 'text-text-primary'}`}>
                          {preset.name}
                        </span>
                        
                        {onToggleFavorite && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleButtonClick(() => onToggleFavorite(preset.name));
                            }}
                            className={`shrink-0 p-1 rounded-full transition-all ${
                              isFavorite 
                                ? 'text-accent bg-accent/10' 
                                : 'text-text-secondary/40 hover:text-accent hover:bg-accent/5'
                            }`}
                          >
                            <Zap size={10} fill={isFavorite ? "currentColor" : "none"} />
                          </div>
                        )}
                      </div>
                      
                      {preset.colorPalette && (
                         <div className="flex gap-0.5">
                            {preset.colorPalette.slice(0, 4).map((c, i) => (
                              <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
                            ))}
                         </div>
                      )}
                    </div>
                    {isSelected && !isFavorite && (
                      <div className="absolute right-2 top-2 text-accent">
                        <CheckCircle2 size={12} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
