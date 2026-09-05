import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, X, RefreshCw, Zap, AlertCircle } from 'lucide-react';
import { MOTION_PROFILE } from '../../lib/motion';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageData: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = React.memo(({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [hasFlash, setHasFlash] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [showFlashEffect, setShowFlashEffect] = useState(false);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    try {
      setError(null);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: { 
          facingMode,
          width: { ideal: 1920 }, // 1080p
          height: { ideal: 1080 }
        },
        audio: false 
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Check for torch/flash support
      const track = mediaStream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as Record<string, unknown>;
      setHasFlash(!!capabilities.torch);

    } catch (err: unknown) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please ensure permissions are granted.');
    }
  };

  const toggleFlash = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    try {
      await track.applyConstraints({
        advanced: [{ torch: !isFlashOn }]
      } as unknown as MediaTrackConstraints);
      setIsFlashOn(!isFlashOn);
    } catch (err) {
      console.error('Error toggling flash:', err);
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureImage = async () => {
    if (!stream || isCapturing || !videoRef.current) return;
    
    const video = videoRef.current;
    
    // Ensure video is actually playing and has dimensions
    if (video.readyState < 2 || video.videoWidth === 0) {
      console.warn('Video not ready for capture');
      return;
    }

    setIsCapturing(true);
    setShowFlashEffect(true);
    setTimeout(() => setShowFlashEffect(false), 150);

    try {
      // Use Canvas for capture - more reliable across browsers for this use case
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d', { alpha: false });

        if (context) {
          // Set canvas dimensions to match video source resolution
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          // Draw the current frame
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Convert to high-quality JPEG (usually smaller and faster than PNG)
          const imageData = canvas.toDataURL('image/jpeg', 0.95);
          
          // Small delay to ensure state updates don't collide with modal closing
          setTimeout(() => {
            onCapture(imageData);
            onClose();
          }, 50);
        }
      }
    } catch (err) {
      console.error('Capture failed:', err);
      setError('Capture failed. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={MOTION_PROFILE.PREMIUM}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="relative w-full max-w-xl aspect-[3/4] md:aspect-video max-h-[90vh] bg-bg-secondary rounded-2xl overflow-hidden border border-border-primary shadow-2xl flex flex-col backdrop-blur-xl">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-center bg-gradient-to-b from-bg-primary/95 to-transparent backdrop-blur-sm border-b border-border-primary/20 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl bg-accent/5 flex items-center justify-center backdrop-blur-md border border-accent/20">
                    <Camera size={22} className="text-accent" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-bg-secondary border border-border-primary rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  </div>
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-text-primary font-serif italic">Visual_Capture</h2>
                  <p className="text-[9px] font-mono opacity-60 uppercase tracking-widest text-text-secondary mt-1">Direct_Synthesis_Input // v2.1</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 bg-bg-primary/60 border border-border-primary rounded-xl text-text-secondary hover:text-accent hover:border-accent/40 transition-all shadow-inner group backdrop-blur-md"
              >
                <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Viewport */}
            <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
              {error ? (
                <div className="text-center p-10 z-10 relative">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                    <AlertCircle size={32} className="text-red-500" />
                  </div>
                  <p className="text-red-500 text-xs font-mono uppercase tracking-[0.2em] mb-6 max-w-[200px] mx-auto leading-relaxed">{error}</p>
                  <button 
                    onClick={startCamera}
                    className="px-8 py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-3 mx-auto hover:bg-red-500/20 transition-all shadow-lg"
                  >
                    <RefreshCw size={16} /> Reconnect_Sensor
                  </button>
                </div>
              ) : (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Flash Effect Overlay */}
                  <AnimatePresence>
                    {showFlashEffect && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white z-50"
                      />
                    )}
                  </AnimatePresence>

                  {/* Viewport Overlay - Technical HUD */}
                  <div className="absolute inset-0 border-[40px] border-black/60 pointer-events-none z-10">
                    <div className="w-full h-full border border-white/10 relative">
                      {/* Corner Accents */}
                      <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-accent shadow-[0_0_10px_rgba(var(--accent-rgb),0.3)]" />
                      <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-accent shadow-[0_0_10px_rgba(var(--accent-rgb),0.3)]" />
                      <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-accent shadow-[0_0_10px_rgba(var(--accent-rgb),0.3)]" />
                      <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-accent shadow-[0_0_10px_rgba(var(--accent-rgb),0.3)]" />
                      
                      {/* Scanning Line */}
                      <div className="absolute top-0 left-0 w-full h-px bg-accent/20 animate-[scan_3s_linear_infinite]" />
                      
                      {/* Center Crosshair */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 border border-accent/30 rounded-full flex items-center justify-center">
                        <div className="w-1 h-1 bg-accent rounded-full shadow-[0_0_8px_rgba(var(--accent-rgb),0.8)]" />
                        <div className="absolute w-4 h-px bg-accent/40" />
                        <div className="absolute h-4 w-px bg-accent/40" />
                      </div>

                      {/* Rule of Thirds Grid */}
                      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-10">
                        <div className="border-r border-b border-white" />
                        <div className="border-r border-b border-white" />
                        <div className="border-b border-white" />
                        <div className="border-r border-b border-white" />
                        <div className="border-r border-b border-white" />
                        <div className="border-b border-white" />
                        <div className="border-r border-white" />
                        <div className="border-r border-white" />
                        <div />
                      </div>
                    </div>
                  </div>

                  {/* Camera Info Overlay */}
                  <div className="absolute bottom-6 left-8 flex flex-col gap-2 pointer-events-none z-20">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                      <span className="text-[11px] font-mono text-white font-bold uppercase tracking-[0.2em] drop-shadow-md">Live_Feed_Uplink</span>
                    </div>
                    {stream && (
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-white/60 uppercase tracking-widest drop-shadow-md">
                          RES: {stream.getVideoTracks()[0].getSettings().width}x{stream.getVideoTracks()[0].getSettings().height}
                        </span>
                        <span className="text-[9px] font-mono text-white/60 uppercase tracking-widest drop-shadow-md">
                          FPS: {Math.round(stream.getVideoTracks()[0].getSettings().frameRate || 0)}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Controls */}
            <div className="p-10 bg-bg-secondary flex justify-between items-center shrink-0 px-14 border-t border-border-primary shadow-[0_-10px_30px_rgba(0,0,0,0.1)] relative z-20">
              <button
                onClick={toggleCamera}
                className="w-14 h-14 rounded-2xl bg-bg-primary/60 flex items-center justify-center text-text-primary border border-border-primary hover:bg-bg-primary hover:border-accent/40 transition-all shadow-inner group"
                title="Switch Camera"
              >
                <RefreshCw size={22} className="group-hover:rotate-180 transition-transform duration-500" />
              </button>

              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={captureImage}
                  disabled={!stream || isCapturing}
                  className="group relative w-24 h-24 rounded-full border-2 border-accent p-2 transition-transform active:scale-90 disabled:opacity-50"
                  id="camera-capture-button"
                >
                  <div className="w-full h-full rounded-full bg-accent flex items-center justify-center shadow-[0_0_30px_rgba(var(--accent-rgb),0.6)] group-hover:brightness-110 transition-all relative overflow-hidden">
                    <Zap size={40} className="text-bg-primary fill-current relative z-10" />
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </div>
                  <div className="absolute -inset-3 rounded-full border border-accent/20 animate-ping opacity-20" />
                  <div className="absolute -inset-1 rounded-full border-2 border-accent/10 group-hover:border-accent/30 transition-colors" />
                </button>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent animate-pulse font-mono">Initiate_Capture</span>
              </div>

              <button
                onClick={toggleFlash}
                disabled={!hasFlash}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all shadow-inner group ${
                  isFlashOn 
                    ? 'bg-accent border-accent text-bg-primary shadow-[0_0_15px_rgba(var(--accent-rgb),0.4)]' 
                    : 'bg-bg-primary/60 border-border-primary text-text-primary hover:bg-bg-primary hover:border-accent/40'
                } disabled:opacity-20`}
                title="Toggle Flash"
              >
                <Zap size={22} className={`${isFlashOn ? 'fill-current' : 'group-hover:scale-110 transition-transform'}`} />
              </button>
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
