import React from 'react';
import { Grid3X3, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { MOTION_PROFILE } from '../../lib/motion';

export default function Monogram() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={MOTION_PROFILE.PREMIUM}
      className="flex flex-col items-center justify-center p-12 text-center space-y-6"
    >
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-bg-secondary border border-border-primary flex items-center justify-center shadow-sm">
          <Grid3X3 className="text-text-primary w-8 h-8" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-bg-primary border border-border-primary flex items-center justify-center shadow-sm">
          <Zap className="text-text-secondary" size={14} />
        </div>
      </div>
      <div className="max-w-xs">
        <h3 className="text-xs font-bold uppercase tracking-widest mb-2 text-text-primary">Monogram Logic</h3>
        <p className="text-[11px] text-text-secondary leading-relaxed">
          Create interlocked and stacked letter combinations. Perfect for luxury branding and heraldic marks.
        </p>
      </div>
    </motion.div>
  );
}
