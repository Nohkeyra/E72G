import React from 'react';
import { motion } from 'motion/react';
import { MOTION_PROFILE } from '../../lib/motion';

interface TechnicalSkeletonProps {
  color?: string;
  progress?: number;
}

// Fully static positions to adhere strictly to React purity guidelines
const STATIC_PARTICLES = [
  { x1: -120, x2: 110, y1: -80, y2: 70, duration: 3.5 },
  { x1: 130, x2: -140, y1: 120, y2: -90, duration: 4.2 },
  { x1: -100, x2: 90, y1: 30, y2: -110, duration: 2.8 },
  { x1: 70, x2: -80, y1: -120, y2: 130, duration: 4.8 },
  { x1: -40, x2: 60, y1: 110, y2: -50, duration: 3.1 },
];

export const TechnicalSkeleton: React.FC<TechnicalSkeletonProps> = ({ 
  color = 'var(--accent)', 
  progress 
}) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-bg-primary">
      {/* 1. The Technical Grid Layer */}
      <div 
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `
            linear-gradient(${color} 1px, transparent 1px),
            linear-gradient(90deg, ${color} 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* 2. The Breathing Radial Glow */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          ...MOTION_PROFILE.FLOW,
          repeat: Infinity,
        }}
        className="absolute w-[300px] h-[300px] rounded-full blur-[100px]"
        style={{ backgroundColor: color }}
      />

      {/* 3. The Scanning Laser Line */}
      <motion.div
        initial={{ top: "-10%" }}
        animate={{ top: "110%" }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute left-0 right-0 h-[2px] z-10"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          boxShadow: `0 0 15px ${color}`
        }}
      />

      {/* 4. The Floating Data Particles (Subtle) */}
      {STATIC_PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{ backgroundColor: color }}
          animate={{
            x: [p.x1, p.x2],
            y: [p.y1, p.y2],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}

      {/* 5. The Centered Status Text */}
      <div className="relative z-20 flex flex-col items-center gap-4">
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-black/40 border border-white/10 backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-primary flex items-center gap-1.5">
            Synthesizing_Geometry
            {progress !== undefined && (
              <span className="ml-1 px-1.5 py-0.5 rounded bg-accent/20 text-accent font-black text-[9px]">
                {Math.round(progress)}%
              </span>
            )}
          </span>
        </div>
        
        {/* The Progress Bar (Refined) */}
        <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden relative">
           {progress !== undefined ? (
             <motion.div 
               className="absolute inset-y-0 left-0 bg-accent"
               animate={{ width: `${progress}%` }}
               transition={MOTION_PROFILE.PREMIUM}
             />
           ) : (
             <motion.div 
               className="absolute inset-y-0 left-0 bg-accent"
               initial={{ width: "0%" }}
               animate={{ width: "100%" }}
               transition={{ duration: 10, ease: "linear" }}
             />
           )}
        </div>
      </div>
    </div>
  );
};
