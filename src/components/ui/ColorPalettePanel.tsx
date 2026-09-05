import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Palette, 
  CheckCircle2, 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  Wand2,
  Code
} from 'lucide-react';
import { COLOR_PALETTES, ColorPalette } from '../../lib/colorPalettes';
import { MOTION_PROFILE } from '../../lib/motion';

interface ColorPalettePanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPalette: ColorPalette | null;
  onSelectPalette: (palette: ColorPalette | null) => void;
  activeImageSrc?: string | null;
}

// Robust color quantization and sampling from an image
const extractDominantColors = (imgSrc: string): Promise<string[]> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imgSrc;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve([]);
        
        // Downsample to 64x64 for performance and natural color blending
        canvas.width = 64;
        canvas.height = 64;
        ctx.drawImage(img, 0, 0, 64, 64);
        
        const imgData = ctx.getImageData(0, 0, 64, 64);
        const data = imgData.data;
        const colorBuckets: Record<string, { r: number, g: number, b: number, count: number }> = {};
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];
          const a = data[i+3];
          
          if (a < 128) continue; // Skip alpha transparent pixels
          
          // Bin colors into 16x16x16 buckets
          const qr = Math.floor(r / 16);
          const qg = Math.floor(g / 16);
          const qb = Math.floor(b / 16);
          const bucketKey = `${qr},${qg},${qb}`;
          
          if (!colorBuckets[bucketKey]) {
            colorBuckets[bucketKey] = { r, g, b, count: 0 };
          }
          colorBuckets[bucketKey].count++;
        }
        
        const sortedBuckets = Object.values(colorBuckets).sort((a, b) => b.count - a.count);
        const distinctColors: { r: number, g: number, b: number }[] = [];
        const distanceThreshold = 55; // visual distance buffer
        
        for (const bucket of sortedBuckets) {
          if (distinctColors.length >= 5) break;
          
          let isTooClose = false;
          for (const ext of distinctColors) {
            const dist = Math.sqrt(
              Math.pow(bucket.r - ext.r, 2) +
              Math.pow(bucket.g - ext.g, 2) +
              Math.pow(bucket.b - ext.b, 2)
            );
            if (dist < distanceThreshold) {
              isTooClose = true;
              break;
            }
          }
          
          if (!isTooClose) {
            distinctColors.push({ r: bucket.r, g: bucket.g, b: bucket.b });
          }
        }
        
        const hexColors = distinctColors.map(c => {
          const toHex = (num: number) => num.toString(16).padStart(2, '0').toUpperCase();
          return `#${toHex(c.r)}${toHex(c.g)}${toHex(c.b)}`;
        });
        
        // Pad colors to ensure we always have 5
        while (hexColors.length < 5 && hexColors.length > 0) {
          hexColors.push(hexColors[hexColors.length - 1]);
        }
        
        resolve(hexColors.length > 0 ? hexColors : ['#FFFFFF', '#000000', '#FF0000', '#0000FF', '#FFFF00']);
      } catch (e) {
        console.error('Error drawing canvas color quantization:', e);
        resolve([]);
      }
    };
    img.onerror = () => {
      resolve([]);
    };
  });
};

export const ColorPalettePanel: React.FC<ColorPalettePanelProps> = memo(({
  isOpen,
  onClose,
  selectedPalette,
  onSelectPalette,
  activeImageSrc
}) => {
  const [extractedPalette, setExtractedPalette] = useState<ColorPalette | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [activeExportTab, setActiveExportTab] = useState<'css' | 'tailwind-v4' | 'tailwind-v3' | 'json'>('css');
  const [copiedText, setCopiedText] = useState(false);

  // Auto-extract colors whenever the active design image changes!
  useEffect(() => {
    let active = true;
    if (!activeImageSrc) {
      Promise.resolve().then(() => {
        if (active) setExtractedPalette(null);
      });
      return;
    }
    
    // Set extracting states asynchronously
    Promise.resolve().then(() => {
      if (!active) return;
      setIsExtracting(true);
      extractDominantColors(activeImageSrc).then((colors) => {
        if (!active) return;
        if (colors && colors.length > 0) {
          setExtractedPalette({
            name: 'Adaptive Extract',
            colors: colors
          });
        } else {
          setExtractedPalette(null);
        }
        setIsExtracting(false);
      });
    });

    return () => {
      active = false;
    };
  }, [activeImageSrc]);

  // Code formats for copy
  const getCssCode = (palette: ColorPalette) => {
    const baseName = palette.name.toLowerCase().replace(/\s+/g, '-');
    return `:root {
${palette.colors.map((color, i) => `  --color-${baseName}-${i + 1}: ${color};`).join('\n')}
}`;
  };

  const getTailwindV4Code = (palette: ColorPalette) => {
    const baseName = palette.name.toLowerCase().replace(/\s+/g, '-');
    return `@theme {
${palette.colors.map((color, i) => `  --color-${baseName}-${(i + 1) * 100}: ${color};`).join('\n')}
}`;
  };

  const getTailwindV3Code = (palette: ColorPalette) => {
    const baseName = palette.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const colorMap = palette.colors.reduce((acc, color, i) => {
      acc[(i + 1) * 100] = color;
      return acc;
    }, {} as Record<number, string>);
    
    return `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        ${baseName}: ${JSON.stringify(colorMap, null, 10).replace(/\}$/, '        }')}
      }
    }
  }
}`;
  };

  const getJsonCode = (palette: ColorPalette) => {
    return JSON.stringify({
      name: palette.name,
      colors: palette.colors
    }, null, 2);
  };

  const getSelectedCode = () => {
    if (!selectedPalette) return '// Select a color palette to generate code.';
    switch (activeExportTab) {
      case 'css': return getCssCode(selectedPalette);
      case 'tailwind-v4': return getTailwindV4Code(selectedPalette);
      case 'tailwind-v3': return getTailwindV3Code(selectedPalette);
      case 'json': return getJsonCode(selectedPalette);
      default: return '';
    }
  };

  const handleCopy = () => {
    const code = getSelectedCode();
    navigator.clipboard.writeText(code).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    });
  };

  // Classy GPL (GIMP/Inkscape/Illustrator Swatch File) exporter
  const downloadGpl = (palette: ColorPalette) => {
    const hexToRgb = (hex: string) => {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    };

    let gplText = `GIMP Palette\nName: ${palette.name}\nColumns: 5\n#\n`;
    palette.colors.forEach((color, i) => {
      const rgb = hexToRgb(color);
      gplText += `${rgb.r.toString().padStart(3, ' ')} ${rgb.g.toString().padStart(3, ' ')} ${rgb.b.toString().padStart(3, ' ')}   ${color}   Swatch_${i + 1}\n`;
    });

    const blob = new Blob([gplText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${palette.name.toLowerCase().replace(/\s+/g, '_')}.gpl`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // High-impact SVG swatch diagram block (fully styled vector chart cards)
  const downloadSvg = (palette: ColorPalette) => {
    const swatchWidth = 100;
    const swatchHeight = 220;
    const padding = 24;
    const width = palette.colors.length * swatchWidth + padding * 2;
    const height = swatchHeight + 120;

    const svgText = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <style>
    .title { font-family: 'Inter', system-ui, sans-serif; font-size: 15px; font-weight: 800; fill: #111827; text-transform: uppercase; letter-spacing: 0.15em; }
    .sub { font-family: 'JetBrains Mono', monospace; font-size: 9px; fill: #6B7280; letter-spacing: 0.12em; font-weight: 500; }
    .code { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; fill: #111827; }
    .card-bg { fill: #FFFFFF; stroke: #F3F4F6; stroke-width: 1.5; rx: 16px; }
  </style>
  <rect x="0" y="0" width="${width}" height="${height}" fill="#FAF9F6" rx="20"/>
  <rect x="${padding}" y="${padding}" width="${width - padding * 2}" height="${height - padding * 2}" class="card-bg" />
  
  <text x="${padding + 20}" y="62" class="title">${palette.name}</text>
  <text x="${padding + 20}" y="80" class="sub">ELITE 72 VECTOR STUDIO // ADAPTIVE COLOR SCHEME</text>

  ${palette.colors.map((color, i) => {
    const x = padding + 15 + i * swatchWidth;
    return `
    <rect x="${x}" y="105" width="${swatchWidth - 10}" height="160" fill="${color}" rx="8" stroke="#111827" stroke-opacity="0.04" />
    <text x="${x + (swatchWidth - 10) / 2}" y="290" text-anchor="middle" class="code">${color}</text>
    `;
  }).join('')}
</svg>`;

    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${palette.name.toLowerCase().replace(/\s+/g, '_')}_swatch.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={MOTION_PROFILE.PREMIUM}
            onClick={onClose}
            className="absolute inset-0 bg-bg-primary/80 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={MOTION_PROFILE.PREMIUM}
            className="relative w-full max-w-5xl bg-bg-secondary border border-border-primary rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] backdrop-blur-xl ring-1 ring-black/5"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-border-primary bg-bg-secondary/80 backdrop-blur-md z-10 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shadow-[0_0_15px_rgba(var(--accent-rgb),0.15)]">
                  <Palette size={20} className="text-accent" />
                </div>
                <div>
                  <h2 className="text-sm font-display font-bold uppercase tracking-widest text-text-primary">Color Synthesis Console</h2>
                  <p className="text-[10px] text-text-secondary mt-1 font-mono tracking-wide opacity-70">Adaptive vision analysis & custom swatches exporter</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-bg-primary rounded-lg text-text-secondary hover:text-text-primary transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Split Screen Grid (Left: Swatches choice, Right: Custom Lab Synthesizer) */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
              
              {/* Left Panel: Palette Library list */}
              <div className="col-span-12 md:col-span-6 p-5 overflow-y-auto custom-scrollbar border-b md:border-b-0 md:border-r border-border-primary bg-bg-primary/20 relative">
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
                     style={{ backgroundImage: 'linear-gradient(var(--border-primary) 1px, transparent 1px), linear-gradient(90deg, var(--border-primary) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                
                {/* Dynamic Vision Extractor Segment */}
                {activeImageSrc ? (
                  <div className="mb-6 p-4 rounded-xl border border-accent/20 bg-accent/5 backdrop-blur-md relative overflow-hidden">
                    <div className="absolute -right-16 -top-16 w-32 h-32 bg-accent/10 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between gap-2 mb-3 z-10 relative">
                      <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-accent animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent">Adaptive Eye extract</span>
                      </div>
                      {isExtracting && (
                        <span className="text-[9px] font-mono text-text-secondary animate-pulse uppercase tracking-wider">Quantizing canvas...</span>
                      )}
                    </div>
                    
                    {extractedPalette ? (
                      <button
                        onClick={() => onSelectPalette(extractedPalette)}
                        className={`w-full p-3.5 rounded-lg border transition-all flex flex-col gap-2.5 text-left overflow-hidden ${
                          selectedPalette?.name === 'Adaptive Extract'
                            ? 'bg-bg-secondary border-accent shadow-md ring-1 ring-accent'
                            : 'bg-bg-secondary/40 border-border-primary hover:border-accent/40 hover:bg-bg-secondary/70'
                        }`}
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-text-primary flex items-center gap-1.5">
                            <Wand2 size={12} className="text-accent" /> Active Sheet Swatches
                          </span>
                          {selectedPalette?.name === 'Adaptive Extract' && (
                            <CheckCircle2 size={14} className="text-accent drop-shadow-[0_0_8px_rgba(var(--accent-rgb),0.5)]" />
                          )}
                        </div>
                        
                        <div className="flex h-9 w-full rounded-md overflow-hidden ring-1 ring-border-primary/50 shadow-inner">
                          {extractedPalette.colors.map((color, idx) => (
                            <div 
                              key={idx} 
                              className="flex-1 h-full transition-transform hover:scale-105 origin-bottom relative group/swatch" 
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </button>
                    ) : (
                      <p className="text-[9px] font-mono text-text-secondary uppercase tracking-widest leading-relaxed">No data retrieved from sheet. Try generating or uploading.</p>
                    )}
                  </div>
                ) : (
                  <div className="mb-6 p-4 rounded-xl border border-dashed border-border-primary bg-bg-primary/20 flex flex-col items-center justify-center text-center">
                    <Sparkles size={16} className="text-text-secondary opacity-40 mb-2" />
                    <p className="text-[9px] font-mono text-text-secondary uppercase tracking-widest">Adaptive Analysis offline</p>
                    <p className="text-[8px] text-text-secondary opacity-60 mt-1 max-w-[200px]">Upload reference or generate style visual to isolate custom dynamic color swatches</p>
                  </div>
                )}

                {/* Preset Library header */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Swatch Vault</span>
                  <div className="h-px flex-1 bg-border-primary/40" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 relative z-10">
                  {COLOR_PALETTES.map((palette) => {
                    const isSelected = selectedPalette?.name === palette.name;
                    return (
                      <button
                        key={palette.name}
                        onClick={() => onSelectPalette(palette.name === 'Default' ? null : palette)}
                        className={`p-3.5 rounded-xl border transition-all flex flex-col gap-2.5 text-left group relative overflow-hidden ${
                          isSelected 
                            ? 'bg-bg-secondary border-accent shadow-md ring-1 ring-accent scale-[1.01]' 
                            : 'bg-bg-secondary/40 border-border-primary hover:border-accent/40 hover:shadow-sm hover:bg-bg-secondary'
                        }`}
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className={`text-[9px] font-bold uppercase tracking-widest ${isSelected ? 'text-accent' : 'text-text-primary'}`}>
                            {palette.name}
                          </span>
                          {isSelected && (
                            <CheckCircle2 size={14} className="text-accent drop-shadow-[0_0_8px_rgba(var(--accent-rgb),0.5)]" />
                          )}
                        </div>
                        
                        <div className="flex h-7 w-full rounded-md overflow-hidden ring-1 ring-border-primary/40 shadow-inner">
                          {palette.colors.map((color, idx) => (
                            <div 
                              key={idx} 
                              className="flex-1 h-full transition-transform hover:scale-110 origin-bottom" 
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Panel: Palette Synthesis Lab */}
              <div className="col-span-12 md:col-span-6 p-5 flex flex-col bg-bg-secondary overflow-y-auto custom-scrollbar relative">
                {selectedPalette ? (
                  <div className="flex flex-col h-full gap-5">
                    {/* Active Scheme Header */}
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Palette Synthesis Lab</span>
                        <span className="text-[9px] font-mono text-text-secondary bg-bg-primary/60 px-2 py-0.5 rounded border border-border-primary uppercase">Active</span>
                      </div>
                      
                      {/* Big detailed swatch view */}
                      <div className="p-4 bg-bg-primary/50 border border-border-primary rounded-xl flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                          <p className="text-xs font-bold uppercase font-serif text-text-primary italic tracking-wider">{selectedPalette.name}</p>
                        </div>
                        
                        <div className="flex h-14 w-full rounded-lg overflow-hidden border border-border-primary/60 shadow-inner">
                          {selectedPalette.colors.map((color, idx) => (
                            <div 
                              key={idx} 
                              className="flex-1 h-full relative group/labels flex flex-col items-center justify-end pb-1.5" 
                              style={{ backgroundColor: color }}
                            >
                              <span className="text-[8px] font-mono font-bold bg-bg-secondary/90 text-text-primary px-1 rounded opacity-0 group-hover/labels:opacity-100 transition-opacity border border-border-primary duration-200">
                                {color}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Individual hex chips code block */}
                        <div className="grid grid-cols-5 gap-1.5 pt-1">
                          {selectedPalette.colors.map((color, idx) => (
                            <div key={idx} className="flex flex-col gap-1 items-center">
                              <span className="text-[8px] font-mono uppercase text-text-secondary">HEX_{idx+1}</span>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(color);
                                  setCopiedText(true);
                                  setTimeout(() => setCopiedText(false), 2000);
                                }}
                                className="w-full text-center py-1.5 bg-bg-secondary hover:bg-bg-primary/40 border border-border-primary hover:border-accent/30 rounded text-[9px] font-mono font-bold text-text-primary transition-all active:scale-95"
                              >
                                {color}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Code exporter section */}
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center gap-2">
                        <Code size={13} className="text-text-secondary" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-text-secondary">CSS / config exporter</span>
                      </div>

                      {/* Export tab headers */}
                      <div className="flex border-b border-border-primary bg-bg-primary/40 p-1 rounded-lg">
                        <button
                          onClick={() => setActiveExportTab('css')}
                          className={`flex-1 text-center py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-md transition-colors ${
                            activeExportTab === 'css' ? 'bg-bg-secondary text-accent border border-border-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          CSS variables
                        </button>
                        <button
                          onClick={() => setActiveExportTab('tailwind-v4')}
                          className={`flex-1 text-center py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-md transition-colors ${
                            activeExportTab === 'tailwind-v4' ? 'bg-bg-secondary text-accent border border-border-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          Tailwind v4
                        </button>
                        <button
                          onClick={() => setActiveExportTab('tailwind-v3')}
                          className={`flex-1 text-center py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-md transition-colors ${
                            activeExportTab === 'tailwind-v3' ? 'bg-bg-secondary text-accent border border-border-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          Tailwind v3
                        </button>
                        <button
                          onClick={() => setActiveExportTab('json')}
                          className={`flex-1 text-center py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-md transition-colors ${
                            activeExportTab === 'json' ? 'bg-bg-secondary text-accent border border-border-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          JSON
                        </button>
                      </div>

                      {/* Code Block display container */}
                      <div className="relative group/code-area">
                        <pre className="p-4 bg-bg-primary/80 border border-border-primary rounded-xl overflow-x-auto text-[10px] font-mono text-text-primary leading-relaxed max-h-[160px] custom-scrollbar">
                          <code>{getSelectedCode()}</code>
                        </pre>
                        
                        <button
                          onClick={handleCopy}
                          className="absolute top-3 right-3 p-1.5 bg-bg-secondary hover:bg-bg-primary border border-border-primary hover:border-accent/40 rounded-lg text-text-secondary hover:text-accent transition-all duration-200 shadow-sm active:scale-90"
                          title="Copy Code"
                        >
                          {copiedText ? <Check size={14} className="text-green-500 animate-scale" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Vector / Asset Downloads */}
                    <div className="mt-auto pt-4 border-t border-border-primary/60 flex flex-col gap-3">
                      <span className="text-[9px] font-mono text-text-secondary uppercase tracking-widest leading-none">Desktop Asset Synthesizer // Swatches export</span>
                      
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          onClick={() => downloadSvg(selectedPalette)}
                          className="flex items-center justify-center gap-2.5 py-3 bg-bg-primary/60 hover:bg-bg-primary border border-border-primary hover:border-accent/40 text-[9px] font-bold uppercase tracking-widest text-text-primary rounded-xl transition-all active:scale-95 group/down"
                        >
                          <Download size={13} className="text-text-secondary group-hover/down:translate-y-0.5 transition-transform" />
                          Download SVG Swatch
                        </button>
                        <button
                          onClick={() => downloadGpl(selectedPalette)}
                          className="flex items-center justify-center gap-2.5 py-3 bg-bg-primary/60 hover:bg-bg-primary border border-border-primary hover:border-accent/40 text-[9px] font-bold uppercase tracking-widest text-text-primary rounded-xl transition-all active:scale-95 group/down"
                        >
                          <Download size={13} className="text-text-secondary group-hover/down:translate-y-0.5 transition-transform" />
                          Download GPL File
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-border-primary rounded-xl relative overflow-hidden bg-bg-primary/10">
                    <div className="absolute inset-0 opacity-[0.015] pointer-events-none" 
                         style={{ backgroundImage: 'linear-gradient(var(--border-primary) 1px, transparent 1px), linear-gradient(90deg, var(--border-primary) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                    <Palette size={24} className="text-text-secondary opacity-30 mb-3" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-primary">Console Dormant</p>
                    <p className="text-[9px] font-mono text-text-secondary opacity-60 mt-2 max-w-[260px] leading-relaxed uppercase">Select any color palette from the inventory or active vector sheet to load the export & synthesis suite</p>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});
