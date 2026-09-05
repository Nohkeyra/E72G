import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MOTION_PROFILE } from '../../lib/motion';

interface VoidLightningProps {
  size?: number;
  className?: string;
  isActive?: boolean;
}

const generateLightningPath = (startX: number, startY: number, endX: number, endY: number, segments: number, volatility: number) => {
  let path = `M ${startX},${startY}`;

  for (let i = 1; i <= segments; i++) {
    const targetX = startX + (endX - startX) * (i / segments);
    const targetY = startY + (endY - startY) * (i / segments);
    
    const currentX = targetX + (Math.random() - 0.5) * volatility;
    const currentY = targetY + (Math.random() - 0.5) * volatility;
    
    path += ` L ${currentX},${currentY}`;
  }
  
  return path;
};

export const VoidLightning: React.FC<VoidLightningProps> = ({ 
  size = 100, 
  className = "", 
  isActive = true 
}) => {
  const [bolts, setBolts] = useState<string[]>([]);
  const isSmall = size < 24;

  useEffect(() => {
    if (!isActive || isSmall) return;

    const interval = setInterval(() => {
      const newBolts = Array.from({ length: 3 }, () => {
        const angle = Math.random() * Math.PI * 2;
        const dist = 10 + Math.random() * 20;
        const startX = 50 + Math.cos(angle) * dist;
        const startY = 50 + Math.sin(angle) * dist;
        const endX = 50 + Math.cos(angle) * (dist + 30 + Math.random() * 20);
        const endY = 50 + Math.sin(angle) * (dist + 30 + Math.random() * 20);
        
        return generateLightningPath(startX, startY, endX, endY, 6, 15);
      });
      setBolts(newBolts);
    }, 250);

    return () => clearInterval(interval);
  }, [isActive, isSmall]);

  if (isSmall) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <motion.div
          animate={isActive ? {
            scale: [1, 1.3, 1],
            opacity: [0.5, 1, 0.5],
          } : {}}
          transition={{ ...MOTION_PROFILE.FLOW, repeat: Infinity }}
          className="w-full h-full rounded-full bg-accent shadow-[0_0_8px_var(--accent)]"
        />
      </div>
    );
  }

  return (
    <div 
      className={`flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* The Singularity Core */}
        <motion.div
          animate={isActive ? {
            scale: [0.95, 1.05, 0.95],
            boxShadow: [
              '0 0 20px rgba(204, 255, 0, 0.2)',
              '0 0 40px rgba(204, 255, 0, 0.4)',
              '0 0 20px rgba(204, 255, 0, 0.2)'
            ]
          } : {}}
          transition={{ ...MOTION_PROFILE.FLOW, repeat: Infinity }}
          className="absolute inset-0 m-auto w-1/3 h-1/3 bg-black rounded-full z-10 border border-accent/30 flex items-center justify-center overflow-hidden"
        >
          {/* Internal Core Turbulence */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-full h-full bg-gradient-to-tr from-accent/20 via-transparent to-accent/20 blur-sm"
          />
        </motion.div>

        {/* Lightning Strikes */}
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible absolute inset-0 m-auto">
          <filter id="lightning-glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          {isActive && bolts.map((path, idx) => (
            <motion.path
              key={`${idx}-${path}`}
              d={path}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.5"
              filter="url(#lightning-glow)"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: [0, 1, 0], pathLength: 1 }}
              transition={MOTION_PROFILE.TACTILE}
            />
          ))}

          {/* Secondary crawling electricity */}
          {isActive && Array.from({ length: 2 }).map((_, i) => (
            <motion.circle
              key={i}
              r="1"
              fill="var(--accent)"
              animate={{
                cx: [50, 70, 50, 30, 50],
                cy: [30, 50, 70, 50, 30],
                opacity: [0, 1, 0]
              }}
              transition={{
                ...MOTION_PROFILE.FLOW,
                repeat: Infinity,
                delay: i * 0.5,
              }}
              style={{ filter: 'drop-shadow(0 0 5px var(--accent))' }}
            />
          ))}
        </svg>

        {/* Shockwaves */}
        {isActive && [1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.3, opacity: 0.5 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{
              ...MOTION_PROFILE.FLOW,
              repeat: Infinity,
              delay: i * 0.6,
            }}
            className="absolute inset-0 m-auto border border-accent/20 rounded-full"
          />
        ))}

        {/* Dark Aura */}
        <motion.div
          animate={isActive ? {
            opacity: [0.05, 0.15, 0.05],
            scale: [1, 1.1, 1]
          } : {}}
          transition={{ ...MOTION_PROFILE.FLOW, repeat: Infinity }}
          className="absolute inset-[-20%] m-auto bg-accent/5 blur-3xl rounded-full -z-10"
        />
      </div>
    </div>
  );
};
