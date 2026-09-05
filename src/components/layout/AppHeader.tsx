import React, { memo } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, 
  History, 
  Sun, 
  Moon, 
  Hexagon
} from 'lucide-react';
import { playClickSound, triggerHapticFeedback } from '../../utils/soundUtils';
import { MOTION_PROFILE } from '../../lib/motion';

interface AppHeaderProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  setShowSettings: (val: boolean) => void;
  setShowHistory: (val: boolean) => void;
  clientSideMode?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = memo(({
  isDarkMode,
  setIsDarkMode,
  setShowSettings,
  setShowHistory,
  clientSideMode
}) => {
  const handleButtonClick = (callback: () => void) => {
    playClickSound();
    triggerHapticFeedback();
    callback();
  };

  return (
    <header className="pull-to-refresh-header relative flex items-center justify-between px-3 md:px-6 pt-[calc(8px+env(safe-area-inset-top))] pb-3 mb-1 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-border-primary/50">
      
      {/* Left Controls: History & Theme */}
      <div className="flex items-center gap-0.5 md:gap-1">
        <motion.button 
          whileHover={{ scale: 1.05, transition: MOTION_PROFILE.TACTILE }}
          whileTap={{ scale: 0.95, transition: MOTION_PROFILE.TACTILE }}
          onClick={() => handleButtonClick(() => setShowHistory(true))}
          className="p-1.5 md:p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors"
          title="History"
        >
          <History className="w-5 h-5 md:w-[20px] md:h-[20px]" strokeWidth={1.5} />
        </motion.button>
        
        <motion.button 
          whileHover={{ scale: 1.05, transition: MOTION_PROFILE.TACTILE }}
          whileTap={{ scale: 0.95, transition: MOTION_PROFILE.TACTILE }}
          onClick={() => handleButtonClick(() => setIsDarkMode(!isDarkMode))}
          className="p-1.5 md:p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors"
          title={isDarkMode ? "Light Mode" : "Dark Mode"}
        >
          {isDarkMode ? <Sun className="w-5 h-5 md:w-[20px] md:h-[20px]" strokeWidth={1.5} /> : <Moon className="w-5 h-5 md:w-[20px] md:h-[20px]" strokeWidth={1.5} />}
        </motion.button>
      </div>

      {/* Center: Logo */}
      <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none select-none max-w-[120px] sm:max-w-none">
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="relative group shrink-0">
            <Hexagon className="w-5 h-5 md:w-6 md:h-6 text-accent fill-accent/10 transition-all duration-500 group-hover:scale-110" strokeWidth={2} style={{ filter: 'drop-shadow(0 0 12px rgba(var(--accent-rgb), 0.5))' }} />
            <motion.div 
              animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
              transition={{ ...MOTION_PROFILE.FLOW, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-accent rounded-full shadow-[0_0_12px_var(--accent)]" />
            </motion.div>
          </div>
          <h1 className="text-sm md:text-lg font-display font-bold tracking-tight text-text-primary ast-disruptive whitespace-nowrap">ELITE 72</h1>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 mt-0.5">
          <span className="text-[7px] font-mono uppercase tracking-[0.2em] text-accent opacity-80">Design Intelligence</span>
          <div className="w-1 h-1 bg-accent rounded-full animate-pulse" />
          <span className="text-[7px] font-mono uppercase tracking-[0.2em] text-text-secondary opacity-50">
            {clientSideMode ? 'Client-Side' : 'Active'}
          </span>
        </div>
      </div>

      {/* Right Controls: Settings */}
      <div className="flex items-center gap-1">
        <motion.button 
          whileHover={{ scale: 1.05, transition: MOTION_PROFILE.TACTILE }}
          whileTap={{ scale: 0.95, transition: MOTION_PROFILE.TACTILE }}
          onClick={() => handleButtonClick(() => setShowSettings(true))}
          className="p-1.5 md:p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5 md:w-[20px] md:h-[20px]" strokeWidth={1.5} />
        </motion.button>
      </div>
    </header>
  );
});
