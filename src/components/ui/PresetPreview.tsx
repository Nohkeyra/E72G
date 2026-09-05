import React, { useMemo } from "react";
import { motion } from "motion/react";
import { MOTION_PROFILE } from "../../lib/motion";

interface PresetPreviewProps {
  name: string;
  category: "typography" | "logo design" | "vector";
  isSelected: boolean;
}

/* ---------------- SHARED TEXTURE ---------------- */
// Adds a technical grid and CRT scanline feel
const BackgroundMatrix = () => (
  <>
    <div 
      className="absolute inset-0 opacity-20 pointer-events-none"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '8px 8px'
      }}
    />
    <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none mix-blend-overlay z-10" />
  </>
);

export const PresetPreview: React.FC<PresetPreviewProps> = React.memo(({
  name,
  category,
  isSelected,
}) => {
  const seed = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  }, [name]);

  const getColor = (offset: number, saturation = 90, lightness = 60) => {
    const hue = (seed + offset) % 360;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const getInitials = (text: string) => {
    const words = text.split(" ");
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return text.slice(0, 2).toUpperCase();
  };

  /* ---------------- LETTERING ---------------- */
  const renderTypography = () => {
    const color1 = getColor(0);
    const isArchitectural = name.toLowerCase().includes('structural') || name.toLowerCase().includes('brutal') || name.toLowerCase().includes('mass');
    const isLiquid = name.toLowerCase().includes('liquid') || name.toLowerCase().includes('mercury') || name.toLowerCase().includes('slime');
    const isNeon = name.toLowerCase().includes('neon') || name.toLowerCase().includes('glow') || name.toLowerCase().includes('cyber');

    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-950 relative overflow-hidden">
        <BackgroundMatrix />
        
        {/* Dynamic Background Elements */}
        {isArchitectural && (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-[1px] h-full bg-white/40" />
            <div className="absolute top-0 left-3/4 w-[1px] h-full bg-white/40" />
            <div className="absolute top-1/4 left-0 w-full h-[1px] bg-white/40" />
          </div>
        )}

        {isLiquid && (
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ ...MOTION_PROFILE.FLOW, repeat: Infinity }}
            className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent opacity-30 blur-xl"
          />
        )}

        <div className="relative z-10 flex flex-col items-center">
          <span 
            className={`text-2xl font-black tracking-tighter italic ${isNeon ? 'text-accent drop-shadow-[0_0_8px_rgba(var(--accent-rgb),0.8)]' : 'text-white'}`}
            style={{
              color: isNeon ? undefined : color1,
              fontFamily: isArchitectural ? 'serif' : 'sans-serif',
              transform: isLiquid ? 'skewX(-10deg)' : 'none'
            }}
          >
            {name.charAt(0)}
          </span>
          <div className="h-[2px] w-4 bg-accent/40 mt-1" />
        </div>

        {/* Glitch/Technical Overlays */}
        <div className="absolute bottom-1 left-1 flex gap-1">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-1 h-1 bg-white/20 rounded-full" />
          ))}
        </div>
      </div>
    );
  };

  /* ---------------- LOGO DESIGN ---------------- */
  const renderLogoDesign = () => {
    const initials = getInitials(name);
    const color1 = getColor(0);
    const color2 = getColor(180);

    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-950 relative overflow-hidden">
        <BackgroundMatrix />
        <span
          className="text-3xl font-extrabold absolute mix-blend-screen opacity-90"
          style={{
            color: color1,
            transform: "rotate(-10deg) skewX(-10deg) translate(-2px, -2px)",
          }}
        >
          {initials[0]}
        </span>
        <span
          className="text-3xl font-extrabold absolute mix-blend-screen opacity-90"
          style={{
            color: color2,
            transform: "rotate(12deg) skewX(8deg) translate(2px, 2px)",
          }}
        >
          {initials[1]}
        </span>
      </div>
    );
  };

  /* ---------------- VECTOR ---------------- */
  const renderVector = () => {
    const color1 = getColor(0, 80, 55);
    const color2 = getColor(150, 80, 55);
    const shapeType = seed % 4;
    const isSignature = name.includes("Elite 72");

    return (
      <div className="w-full h-full bg-zinc-950 relative overflow-hidden">
        <BackgroundMatrix />
        
        {/* Technical Crosshairs */}
        <div className="absolute inset-0 pointer-events-none opacity-30 z-20">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/20" />
          <div className="absolute left-1/2 top-0 w-[1px] h-full bg-white/20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border border-white/40 rounded-full" />
        </div>

        {/* Coordinate Markers */}
        <div className="absolute top-1 left-1 text-[6px] font-mono text-white/40 z-20">0,0</div>
        <div className="absolute bottom-1 right-1 text-[6px] font-mono text-white/40 z-20">100,100</div>

        <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0 mix-blend-screen">
          {isSignature ? (
            <g transform="translate(50, 50) rotate(45) translate(-50, -50)">
              <rect x="20" y="20" width="60" height="60" fill="none" stroke={color1} strokeWidth="2" />
              <rect x="30" y="30" width="40" height="40" fill={color1} opacity="0.6" />
              <line x1="0" y1="50" x2="100" y2="50" stroke={color2} strokeWidth="0.5" strokeDasharray="2,2" />
              <line x1="50" y1="0" x2="50" y2="100" stroke={color2} strokeWidth="0.5" strokeDasharray="2,2" />
            </g>
          ) : (
            <>
              {shapeType === 0 && (
                <>
                  <polygon points="10,90 90,90 50,10" fill={color1} opacity="0.8" />
                  <polygon points="20,70 80,70 50,20" fill={color2} opacity="0.8" />
                </>
              )}
              {shapeType === 1 && (
                <>
                  <rect x="15" y="15" width="70" height="70" fill={color1} transform={`rotate(${seed % 45} 50 50)`} opacity="0.8" />
                  <rect x="25" y="25" width="50" height="50" fill={color2} transform={`rotate(${-(seed % 30)} 50 50)`} opacity="0.8" />
                </>
              )}
              {shapeType === 2 && (
                <>
                  <polygon points="50,0 100,50 50,100 0,50" fill={color1} opacity="0.8" />
                  <polygon points="50,20 80,50 50,80 20,50" fill={color2} opacity="0.8" />
                </>
              )}
              {shapeType === 3 && (
                <>
                  <circle cx="50" cy="50" r="35" fill={color1} opacity="0.8" />
                  <polygon points="50,20 75,50 50,80 25,50" fill={color2} opacity="0.8" />
                </>
              )}
            </>
          )}
        </svg>
      </div>
    );
  };

  /* ---------------- MAIN ---------------- */
  const renderPreview = () => {
    switch (category) {
      case "typography":
        return renderTypography();
      case "logo design":
        return renderLogoDesign();
      case "vector":
        return renderVector();
      default:
        return renderTypography();
    }
  };

  return (
    <div
      className={`w-full h-full overflow-hidden transition-all duration-300 relative ${ isSelected ? 'brightness-110' : 'opacity-70 group-hover:opacity-100' }`}
    >
      {/* Global SVG Noise Filter */}
      <svg className="pointer-events-none absolute inset-0 z-50 opacity-[0.15] mix-blend-overlay w-full h-full">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
      
      {renderPreview()}
    </div>
  );
});
