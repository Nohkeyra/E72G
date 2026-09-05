import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, 
  Undo2, 
  Trash2, 
  Zap, 
  Palette,
  Image as ImageIcon,
  Camera
} from 'lucide-react';
import { ImageModel } from '../../services/modelRegistry';
import { VoidLightning } from '../icons/VoidLightning';
import { TechnicalSkeleton } from '../ui/TechnicalSkeleton';
import { MOTION_PROFILE } from '../../lib/motion';

import { useAppStore } from '../../store/useAppStore';

interface ViewportProps {
  isGenerating: boolean;
  resultImage: string | string[] | null;
  uploadedImage: string | null;
  selectedModel: ImageModel;
  modelOptions?: { id: string; label: string; provider: string; isGemini?: boolean }[];
  isHoldingCompare: boolean;
  setIsHoldingCompare: (val: boolean) => void;
  onDownload: () => void;
  onUndo: () => void;
  onClear: () => void;
  onUploadClick: () => void;
  onCameraClick: () => void;
  onColorPaletteClick: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  generationProgress: number;
  onRefine?: () => void;
}

export const Viewport: React.FC<ViewportProps> = memo(({
  isGenerating,
  resultImage,
  uploadedImage,
  selectedModel,
  modelOptions = [],
  isHoldingCompare,
  setIsHoldingCompare,
  onDownload,
  onUndo,
  onClear,
  onUploadClick,
  onCameraClick,
  onColorPaletteClick,
  onFileUpload,
  generationProgress,
  onRefine,
}) => {
  const { imageBrightness } = useAppStore();
  const isImageBright = imageBrightness > 0.6;
  
  const currentModel = modelOptions.find(m => m.id === selectedModel);
  const isImageResult = (img: string) => img.startsWith('data:image') || img.startsWith('http') || img.startsWith('blob:');
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const event = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
      onFileUpload(event);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={MOTION_PROFILE.PREMIUM}
      className="w-full lg:flex-1 bg-bg-primary aspect-square md:aspect-[4/3] lg:aspect-auto lg:h-full h-full flex flex-col items-center justify-center relative overflow-hidden group/viewport order-1 transition-all duration-500"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Canvas Background Pattern (Subtle Dot Grid) */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-0"
           style={{
             backgroundImage: 'radial-gradient(circle at 1px 1px, var(--text-secondary) 1px, transparent 0)',
             backgroundSize: '32px 32px'
           }}
      />

      {/* Blueprint Skeleton Overlay - Active when Generating */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-10 overflow-hidden"
          >
            {/* Shimmering Blueprint Grid */}
            <div 
              className="absolute inset-0 opacity-[0.09]"
              style={{
                backgroundImage: `
                  linear-gradient(to right, var(--lightning-purple) 1px, transparent 1px),
                  linear-gradient(to bottom, var(--lightning-purple) 1px, transparent 1px)
                `,
                backgroundSize: '30px 30px',
              }}
            />
            
            {/* Pulsating Concentric Target Rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ 
                  scale: [0.8, 1.25, 0.8],
                  opacity: [0.15, 0.4, 0.15]
                }}
                transition={{ ...MOTION_PROFILE.FLOW, repeat: Infinity }}
                className="w-80 h-80 border border-dashed border-[var(--lightning-purple)] rounded-full"
              />
              <motion.div
                animate={{ 
                  scale: [1.2, 0.9, 1.2],
                  opacity: [0.1, 0.25, 0.1]
                }}
                transition={{ ...MOTION_PROFILE.FLOW, repeat: Infinity }}
                className="w-[450px] h-[450px] border border-dotted border-[var(--lightning-purple)] rounded-full"
              />
            </div>

            {/* Sweep Scan Laser line */}
            <motion.div
              animate={{ y: ['-10%', '110%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-x-0 h-[80px] bg-gradient-to-b from-transparent via-[var(--lightning-purple)]/15 to-transparent pointer-events-none"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={MOTION_PROFILE.PREMIUM}
            className="absolute inset-0 z-[60] bg-accent/20 backdrop-blur-sm border-2 border-dashed border-accent flex items-center justify-center"
          >
            <div className="text-accent font-bold text-xl uppercase tracking-widest animate-pulse">Drop Image Here</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`absolute right-3 md:right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-3 md:gap-4 transition-all duration-300 pointer-events-auto ${isImageBright ? 'text-black' : 'text-white'}`}>
        {/* Camera Trigger */}
        {!uploadedImage && !isGenerating && (
          <motion.button
            whileHover={{ scale: 1.1, transition: MOTION_PROFILE.TACTILE }}
            whileTap={{ scale: 0.95, transition: MOTION_PROFILE.TACTILE }}
            onClick={(e) => {
              e.stopPropagation();
              onCameraClick();
            }}
            className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center transition-all group relative rounded-full border backdrop-blur-md ${isImageBright ? 'bg-black/5 border-black/10 hover:bg-black/10' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
            title="Open Camera"
          >
            <Camera className="w-4 h-4 md:w-[18px] md:h-[18px]" strokeWidth={2} />
          </motion.button>
        )}

        {(resultImage || uploadedImage) && !isGenerating && (
          <>
            <motion.button 
              whileHover={{ scale: 1.1, transition: MOTION_PROFILE.TACTILE }}
              whileTap={{ scale: 0.95, transition: MOTION_PROFILE.TACTILE }}
              onClick={(e) => {
                e.stopPropagation();
                onDownload();
              }}
              className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center transition-all group relative rounded-full border backdrop-blur-md ${isImageBright ? 'bg-black/5 border-black/10 hover:bg-black/10' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
              title="Download Image"
            >
              <Download className="w-4 h-4 md:w-[18px] md:h-[18px]" strokeWidth={2} />
            </motion.button>
            {resultImage && (
              <>
                <motion.button 
                  whileHover={{ scale: 1.1, transition: MOTION_PROFILE.TACTILE }}
                  whileTap={{ scale: 0.95, transition: MOTION_PROFILE.TACTILE }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUndo();
                  }}
                  className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center transition-all group relative rounded-full border backdrop-blur-md ${isImageBright ? 'bg-black/5 border-black/10 hover:bg-black/10' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  title="Undo"
                >
                  <Undo2 className="w-4 h-4 md:w-[18px] md:h-[18px]" strokeWidth={2} />
                </motion.button>
                {onRefine && (
                  <motion.button 
                    whileHover={{ scale: 1.1, transition: MOTION_PROFILE.TACTILE }}
                    whileTap={{ scale: 0.95, transition: MOTION_PROFILE.TACTILE }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRefine();
                    }}
                    className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center transition-all group relative bg-accent/20 text-accent rounded-full border border-accent/30 backdrop-blur-md hover:bg-accent/35"
                    title="Audit & Refine (Iterative Loop)"
                  >
                    <Zap className="w-4 h-4 md:w-[18px] md:h-[18px]" strokeWidth={2} />
                  </motion.button>
                )}
              </>
            )}
            <motion.button 
              whileHover={{ scale: 1.1, transition: MOTION_PROFILE.TACTILE }}
              whileTap={{ scale: 0.95, transition: MOTION_PROFILE.TACTILE }}
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center transition-all group relative rounded-full border backdrop-blur-md ${isImageBright ? 'bg-black/5 border-black/10 hover:bg-black/10' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
              title="Clear Canvas"
            >
              <Trash2 className="w-4 h-4 md:w-[18px] md:h-[18px]" strokeWidth={2} />
            </motion.button>
          </>
        )}
        
        {/* Color Palette Icon */}
        <motion.button 
          whileHover={{ scale: 1.1, transition: MOTION_PROFILE.TACTILE }}
          whileTap={{ scale: 0.95, transition: MOTION_PROFILE.TACTILE }}
          onClick={(e) => {
            e.stopPropagation();
            onColorPaletteClick();
          }}
          className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center transition-all group relative rounded-full border backdrop-blur-md ${isImageBright ? 'bg-black/5 border-black/10 hover:bg-black/10' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
          title="Color Palette"
        >
          <Palette className="w-4 h-4 md:w-[18px] md:h-[18px]" strokeWidth={2} />
        </motion.button>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
        <span className={`text-[8px] font-mono font-medium tracking-widest uppercase transition-colors duration-300 ${isImageBright ? 'text-black' : 'text-white'}`}>
          {currentModel?.label || selectedModel}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {isGenerating ? (
          <motion.div 
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50"
          >
            <TechnicalSkeleton progress={generationProgress} />
          </motion.div>
        ) : resultImage ? (
          <motion.div 
            key="result"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={MOTION_PROFILE.PREMIUM}
            className="relative z-10 w-full h-full cursor-crosshair flex items-center justify-center p-8"
            onMouseDown={() => uploadedImage && setIsHoldingCompare(true)}
            onMouseUp={() => setIsHoldingCompare(false)}
            onMouseLeave={() => setIsHoldingCompare(false)}
            onTouchStart={() => uploadedImage && setIsHoldingCompare(true)}
            onTouchEnd={() => setIsHoldingCompare(false)}
          >
            {resultImage && !isImageResult(resultImage as string) ? (
              <div className="w-full h-full flex items-center justify-center overflow-auto">
                <div className="max-w-2xl w-full bg-bg-secondary/90 backdrop-blur-xl border border-border-primary rounded-2xl p-8 shadow-2xl ring-1 ring-black/5">
                  <div className="flex items-center gap-3 mb-6 border-b border-border-primary pb-4">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Zap className="text-accent w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest">Generation Result</h3>
                      <p className="text-[10px] text-text-secondary font-mono mt-0.5">Text Output Mode</p>
                    </div>
                  </div>
                  <div className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap font-mono bg-bg-primary/50 p-4 rounded-xl border border-border-primary/50">
                    {resultImage}
                  </div>
                  <div className="mt-6 flex justify-between items-center">
                    <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider">Engine: {currentModel?.label}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(resultImage as string);
                      }}
                      className="text-xs font-medium text-accent hover:text-accent/80 transition-colors flex items-center gap-2"
                    >
                      <span>Copy to Clipboard</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <motion.div 
                  layoutId="main-image"
                  className="relative group/image w-full h-full flex items-center justify-center transition-all duration-300"
                >
                  <img 
                    src={isHoldingCompare && uploadedImage ? uploadedImage : (resultImage as string)} 
                    alt="Result" 
                    className="max-w-full max-h-full w-auto h-auto object-contain pointer-events-none select-none rounded-xl shadow-lg transition-all duration-300" 
                    style={{ filter: isHoldingCompare ? 'grayscale(50%) opacity(80%)' : 'none' }}
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/5 pointer-events-none rounded-2xl" />
                </motion.div>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="upload-zone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={MOTION_PROFILE.PREMIUM}
            className={`w-full h-full flex flex-col items-center justify-center transition-all duration-500 group relative z-10 ${uploadedImage ? 'bg-bg-secondary/30' : ''}`}
          >
            {uploadedImage ? (
              <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={MOTION_PROFILE.PREMIUM}
                  className="relative group/preview w-full h-full flex items-center justify-center transition-all duration-300"
                >
                  <img src={uploadedImage} alt="Reference" className="max-w-full max-h-full w-auto h-auto object-contain rounded-xl shadow-lg transition-all duration-300" />
                  
                  {/* Desktop Hover Overlay */}
                  <div className="absolute inset-0 hidden md:flex flex-col items-center justify-center gap-4 bg-bg-primary/60 backdrop-blur-md opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300 cursor-pointer rounded-2xl" onClick={onUploadClick}>
                    <div className="w-16 h-16 rounded-2xl bg-accent text-bg-primary flex items-center justify-center shadow-xl transform scale-90 group-hover/preview:scale-100 transition-all duration-300 hover:rotate-3">
                      <ImageIcon size={28} strokeWidth={1.5} />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-text-primary drop-shadow-md bg-bg-secondary/80 px-4 py-2 rounded-full border border-border-primary">Change Reference</p>
                  </div>

                  {/* Mobile Replace Button */}
                  <div className="md:hidden absolute bottom-6 right-6 z-50 pointer-events-auto mix-blend-difference text-white">
                    <motion.button 
                      whileTap={{ scale: 0.9, transition: MOTION_PROFILE.TACTILE }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onUploadClick();
                      }}
                      className="w-9 h-9 flex items-center justify-center hover:scale-110 transition-all group relative"
                      title="Replace Image"
                    >
                      <ImageIcon size={20} strokeWidth={2} />
                    </motion.button>
                  </div>
                </motion.div>
                
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-bg-secondary/90 backdrop-blur-xl px-6 py-3 rounded-full text-xs font-medium text-text-primary border border-border-primary shadow-2xl pointer-events-none flex items-center gap-3 transition-all duration-500">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_10px_rgba(var(--accent-rgb),0.8)]" />
                  <span className="tracking-widest uppercase font-display text-[10px]">Ready for Synthesis</span>
                </div>
              </div>
            ) : (
              <div 
                onClick={onUploadClick}
                className="text-center space-y-6 group-hover:scale-105 transition-transform duration-500 cursor-pointer p-12 rounded-3xl hover:bg-bg-secondary/30 border border-transparent hover:border-border-primary/50"
              >
                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                  {/* Void Lightning Animation - Perfectly Centered */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160px] h-[160px] pointer-events-none">
                    <VoidLightning size={160} />
                  </div>
                  
                  {/* Subtle Icon Indicator */}
                  <div className="relative z-20 opacity-20 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <ImageIcon className="text-accent w-8 h-8" strokeWidth={1} />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-display font-medium text-text-primary">Ready for Synthesis</h3>
                  <p className="text-xs font-mono text-text-secondary mt-2 tracking-wide hidden md:block">Enter a prompt, or click to upload a reference image</p>
                  <p className="text-xs font-mono text-text-secondary mt-2 tracking-wide md:hidden">Tap to upload reference</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

