import React, { memo } from 'react';
import { motion } from 'motion/react';
import { 
  Image as ImageIcon, 
  Type as TypeIcon, 
  Aperture, 
  Hexagon
} from 'lucide-react';
import { playClickSound, triggerHapticFeedback } from '../../utils/soundUtils';
import { MOTION_PROFILE } from '../../lib/motion';

type Tab = 'vectorize' | 'logo design' | 'typography';

interface AppNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const AppNavigation: React.FC<AppNavigationProps> = memo(({ activeTab, onTabChange }) => {
  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'vectorize', label: 'Vectorize', icon: ImageIcon },
    { id: 'logo design', label: 'Logo', icon: Aperture },
    { id: 'typography', label: 'Type', icon: TypeIcon },
  ];

  const handleTabClick = (id: Tab) => {
    playClickSound();
    triggerHapticFeedback();
    onTabChange(id);
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-[60] bg-bg-primary/80 border-t border-border-primary px-2 pt-2 pb-[calc(10px+env(safe-area-inset-bottom))] flex justify-around items-center md:hidden backdrop-blur-xl">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.05, transition: MOTION_PROFILE.TACTILE }}
            whileTap={{ scale: 0.95, transition: MOTION_PROFILE.TACTILE }}
            onClick={() => handleTabClick(tab.id)}
            className={`flex flex-col items-center gap-1.5 p-1.5 transition-colors relative ${activeTab === tab.id ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`}
          >
            <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2 : 1.5} />
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] font-mono">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div 
                layoutId="nav-active-mobile"
                className="absolute -top-[9px] w-8 h-0.5 bg-accent rounded-full shadow-[0_0_8px_rgba(var(--accent-rgb),0.6)]"
                transition={MOTION_PROFILE.PREMIUM}
              />
            )}
          </motion.button>
        ))}
      </nav>

      {/* Desktop Vertical Sidebar Rail */}
      <nav className="hidden md:flex flex-col w-20 h-full bg-bg-secondary/50 border-r border-border-primary backdrop-blur-xl z-40 items-center py-6 gap-8 shrink-0 relative">
        {/* Logo Mark */}
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-[0_0_20px_rgba(var(--accent-rgb),0.4)] mb-4 animate-pulse">
          <Hexagon className="text-bg-primary fill-bg-primary" size={24} strokeWidth={1.5} />
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col gap-4 w-full px-3">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <div key={tab.id} className="relative group flex items-center justify-center">
                <motion.button
                  whileHover={{ scale: 1.05, transition: MOTION_PROFILE.TACTILE }}
                  whileTap={{ scale: 0.95, transition: MOTION_PROFILE.TACTILE }}
                  onClick={() => handleTabClick(tab.id)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 relative ${
                    isActive 
                      ? 'text-accent bg-accent/10 shadow-[0_0_15px_rgba(var(--accent-rgb),0.15)] ring-1 ring-accent/30' 
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-primary/50'
                  }`}
                >
                  <tab.icon size={22} strokeWidth={isActive ? 2 : 1.5} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                  
                  {/* Active Indicator Line */}
                  {isActive && (
                    <motion.div 
                      layoutId="nav-active-desktop"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-r-full shadow-[0_0_10px_rgba(var(--accent-rgb),0.8)]"
                      transition={MOTION_PROFILE.PREMIUM}
                    />
                  )}
                </motion.button>

                {/* Tooltip */}
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-bg-secondary border border-border-primary rounded-lg text-[10px] font-bold uppercase tracking-widest text-text-primary opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl backdrop-blur-md">
                  {tab.label}
                  <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-bg-secondary border-l border-b border-border-primary rotate-45" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions / Status */}
        <div className="mt-auto flex flex-col gap-4 w-full px-3 pb-4">
          <div className="w-full h-px bg-border-primary/50" />
          <div className="flex justify-center">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" title="System Online" />
          </div>
        </div>
      </nav>
    </>
  );
});
