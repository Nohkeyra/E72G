import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, X, RotateCcw, Trash2, Share, Download } from 'lucide-react';
import { MOTION_PROFILE } from '../../lib/motion';

interface HistoryItem {
  id: string;
  prompt: string;
  presetName: string;
  timestamp: string;
  image: string;
}

interface HistoryPanelProps {
  history: HistoryItem[];
  onClose: () => void;
  onRestore: (item: HistoryItem) => void;
  onClear: () => void;
  addLog: (message: string, type?: 'info' | 'success' | 'error' | 'process') => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onClose, onRestore, onClear, addLog }) => {
  const [selectedImage, setSelectedImage] = useState<HistoryItem | null>(null);

  const handleDownload = (image: string, name: string) => {
    const link = document.createElement('a');
    link.href = image;
    // eslint-disable-next-line react-hooks/purity
    const timestamp = Date.now();
    link.download = `${name.replace(/\s+/g, '-').toLowerCase()}-${timestamp}.png`;
    link.click();
  };

  const handleShare = async (image: string) => {
    try {
      const blob = await fetch(image).then(r => r.blob());
      const file = new File([blob], 'history-synthesis.png', { type: 'image/png' });
      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: 'Elite 72 Sovereign Logs',
          text: 'Check out this visual synthesis from my logs!'
        });
        addLog('Synthesis shared successfully.', 'success');
      } else {
        addLog('Sharing not supported on this device.', 'error');
      }
    } catch (err) {
      console.error('Share failed', err);
      addLog('Share failed.', 'error');
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={MOTION_PROFILE.PREMIUM}
      className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-bg-primary border-l border-border-primary shadow-2xl z-[100] flex flex-col backdrop-blur-xl"
    >
      <div className="flex justify-between items-center p-6 border-b border-border-primary bg-bg-secondary/30 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center border border-accent/20">
            <History size={18} className="text-accent" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-text-primary">Sovereign_Logs</h2>
            <p className="text-[9px] font-mono uppercase tracking-widest text-text-secondary mt-0.5 opacity-60">Elite_72_History_Buffer // v2.0</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onClear} className="p-2 bg-bg-secondary border border-border-primary rounded-lg text-red-500 hover:bg-red-500/10 transition-all" title="Clear History">
            <Trash2 size={16} />
          </button>
          <button onClick={onClose} className="p-2 bg-bg-secondary border border-border-primary rounded-lg text-text-secondary hover:text-accent transition-all">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-bg-primary space-y-3">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary gap-4 opacity-30">
            <History size={48} strokeWidth={1} />
            <p className="text-[10px] uppercase tracking-[0.2em] font-mono">Buffer_Empty</p>
          </div>
        ) : (
          history.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={MOTION_PROFILE.PREMIUM}
              className="p-3 bg-bg-secondary/30 border border-border-primary rounded-xl group hover:border-accent/40 transition-all flex gap-4 items-center"
            >
              <div 
                className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-border-primary bg-bg-primary cursor-pointer"
                onClick={() => setSelectedImage(item)}
              >
                <img src={item.image} alt="History" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedImage(item)}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-accent truncate">{item.presetName}</p>
                <p className="text-[10px] text-text-secondary truncate opacity-70 font-mono mt-0.5">"{item.prompt}"</p>
              </div>
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleDownload(item.image, item.presetName)} className="p-1.5 text-text-secondary hover:text-accent" title="Download">
                  <Download size={14} />
                </button>
                <button onClick={() => handleShare(item.image)} className="p-1.5 text-text-secondary hover:text-accent" title="Share">
                  <Share size={14} />
                </button>
                <button onClick={() => onRestore(item)} className="p-1.5 text-text-secondary hover:text-accent" title="Restore">
                  <RotateCcw size={14} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={MOTION_PROFILE.PREMIUM}
            className="fixed inset-0 z-[110] bg-bg-primary/90 backdrop-blur-md flex flex-col items-center justify-center p-6"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 p-2 bg-bg-secondary border border-border-primary rounded-full text-text-secondary hover:text-accent transition-all"
            >
              <X size={24} />
            </button>
            <img src={selectedImage.image} alt="Full View" className="max-w-full max-h-[70vh] rounded-2xl shadow-2xl border border-border-primary" />
            <button
              onClick={() => handleDownload(selectedImage.image, selectedImage.presetName)}
              className="mt-6 flex items-center gap-2 px-6 py-3 bg-accent text-bg-primary rounded-full font-bold uppercase tracking-widest text-xs hover:bg-accent/90 transition-all"
            >
              <Download size={16} />
              Download Image
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
