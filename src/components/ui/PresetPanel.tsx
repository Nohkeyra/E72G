import React, { memo } from 'react';
import { motion } from 'motion/react';
import { Preset, PresetCategory } from '../../types/presets';
import { CheckCircle2, Zap } from 'lucide-react';
import { MOTION_PROFILE } from '../../lib/motion';

interface PresetPanelProps {
  categories: readonly PresetCategory[];
  selectedPreset: Preset | null;
  onSelectPreset: (preset: Preset) => void;
  usedPresets?: Set<string>;
  favoritePresets?: Set<string>;
  onToggleFavorite?: (presetName: string) => void;
}

export const PresetPanel: React.FC<PresetPanelProps> = memo(({ 
  categories, 
  selectedPreset, 
  onSelectPreset, 
  usedPresets = new Set(),
  favoritePresets = new Set(),
  onToggleFavorite
}) => {
  return (
    <div className="space-y-12 pb-32 md:pb-24">
      {categories.map((category, catIndex) => (
        <div key={category.category} className="space-y-5">
          <div className="px-1 flex items-center gap-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary whitespace-nowrap">
              {category.category}
            </h3>
            <div className="h-px flex-1 bg-border-primary" />
          </div>

          <div className="grid grid-cols-2 gap-3 px-1">
            {[...category.presets].sort((a, b) => {
              const aFav = favoritePresets.has(a.name);
              const bFav = favoritePresets.has(b.name);
              if (aFav && !bFav) return -1;
              if (!aFav && bFav) return 1;
              return 0;
            }).map((preset, index) => {
              const isSelected = selectedPreset?.name === preset.name;
              const isUsed = usedPresets.has(preset.name);
              const isFavorite = favoritePresets.has(preset.name);
              
              return (
                <motion.div
                  key={preset.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02, transition: MOTION_PROFILE.TACTILE }}
                  whileTap={{ scale: 0.98, transition: MOTION_PROFILE.TACTILE }}
                  transition={{ 
                    delay: (catIndex * 0.05) + (index * 0.02),
                    ...MOTION_PROFILE.PREMIUM 
                  }}
                  className="relative"
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectPreset(preset)}
                    className={`p-3 rounded-xl transition-all flex items-center justify-between gap-3 w-full relative overflow-hidden border text-left cursor-pointer group ${
                      isSelected
                        ? 'bg-bg-primary border-accent ring-1 ring-accent'
                        : 'bg-bg-secondary border-border-primary hover:border-accent/40'
                    }`}
                  >
                    <div className="flex flex-col flex-1 overflow-hidden relative z-10">
                      <span className={`text-[10px] font-bold leading-tight truncate ${isSelected ? 'text-accent' : 'text-text-primary'}`}>
                        {preset.name}
                      </span>
                      
                      {preset.colorPalette && preset.colorPalette.length > 0 && !['multi', 'varied'].includes(preset.colorPalette[0]) && (
                        <div className="flex items-center gap-0.5 mt-2">
                          {preset.colorPalette.slice(0, 4).map((color, i) => (
                             <div key={i} className="w-2 h-2 rounded-full border border-black/5 shadow-sm" style={{ backgroundColor: color }} />
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1.5 shrink-0 relative z-10">
                      {isUsed && (
                        <CheckCircle2 size={12} className="text-accent" />
                      )}

                      {/* Favorite Button */}
                      <motion.div
                        whileHover={{ scale: 1.15, transition: MOTION_PROFILE.TACTILE }}
                        whileTap={{ scale: 0.85, transition: MOTION_PROFILE.TACTILE }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite?.(preset.name);
                        }}
                        className={`p-1.5 rounded-full transition-all cursor-pointer ${
                          isFavorite 
                            ? 'text-accent bg-accent/10' 
                            : 'text-text-secondary/40 hover:text-accent hover:bg-accent/5'
                        }`}
                      >
                        <Zap size={11} fill={isFavorite ? "currentColor" : "none"} />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
});
