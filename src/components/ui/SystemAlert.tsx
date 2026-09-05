import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { MOTION_PROFILE } from '../../lib/motion';

interface SystemAlertProps {
  isOpen: boolean;
  error: string;
  onClose: () => void;
  onRetry: () => void;
}

export const SystemAlert: React.FC<SystemAlertProps> = ({ isOpen, error, onClose, onRetry }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={MOTION_PROFILE.PREMIUM}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={MOTION_PROFILE.PREMIUM}
            className="relative w-full max-w-md bg-bg-secondary border border-red-500/30 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.15)] overflow-hidden pointer-events-auto"
          >
            {/* Header: The "Warning" Bar */}
            <div className="bg-red-500/10 border-b border-red-500/20 px-5 py-3 flex items-center gap-3">
              <AlertCircle className="text-red-500 animate-pulse" size={20} />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 font-mono">
                System_Critical_Error
              </h3>
            </div>

            {/* Body: The Error Details */}
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-mono text-text-secondary uppercase tracking-widest">Error_Log_Entry:</p>
                <p className="text-sm text-text-primary font-medium leading-relaxed">
                  {error}
                </p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={onRetry}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95"
                >
                  <RefreshCw size={14} />
                  Re-Initialize
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-bg-primary border border-border-primary text-text-secondary rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-bg-secondary transition-all"
                >
                  Dismiss
                </button>
              </div>
            </div>

            {/* Bottom: Technical Decals */}
            <div className="bg-black/20 px-5 py-2 flex justify-between items-center">
              <span className="text-[7px] font-mono text-text-secondary opacity-40 uppercase tracking-tighter">
                Status: HALTED // Protocol: Error_Recovery
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
