import React from 'react';
import { Sparkles, Cpu } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ImageModel } from '../../services/modelRegistry';

interface ProviderSelectorProps {
  hasReferenceImage?: boolean;
}

export const ProviderSelector: React.FC<ProviderSelectorProps> = ({ hasReferenceImage = false }) => {
  const { selectedModel, setSelectedModel } = useAppStore();

  const isCloudflare = selectedModel === 'cf-flux';

  const handleSelectModel = (model: ImageModel) => {
    setSelectedModel(model);
  };

  return (
    <div className="w-full flex flex-col gap-2 p-3 bg-bg-secondary border border-border-primary rounded-xl">
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase tracking-wider text-text-secondary font-bold flex items-center gap-1.5">
          <Cpu size={12} className="text-accent" />
          Image Provider
        </label>
        <span
          className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
            isCloudflare
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}
        >
          {isCloudflare ? 'Cloudflare FLUX (Free)' : 'Gemini (Requires Billing)'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => handleSelectModel('cf-flux')}
          className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            isCloudflare
              ? 'bg-accent/15 border-accent text-accent shadow-sm'
              : 'bg-bg-primary border-border-primary text-text-secondary hover:border-text-secondary/40'
          }`}
        >
          <Sparkles size={12} className={isCloudflare ? 'text-accent' : 'text-text-secondary'} />
          <span>Cloudflare FLUX</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectModel('gemini')}
          className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            !isCloudflare
              ? 'bg-accent/15 border-accent text-accent shadow-sm'
              : 'bg-bg-primary border-border-primary text-text-secondary hover:border-text-secondary/40'
          }`}
        >
          <span>Gemini Image</span>
        </button>
      </div>

      {isCloudflare && (
        <div className="mt-1 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-2 text-emerald-400 text-[11px] leading-relaxed">
          <Sparkles size={14} className="shrink-0 mt-0.5" />
          <p>
            {hasReferenceImage
              ? 'Using Cloudflare FLUX.2 [klein] 4B (Free) for reference image-to-image editing.'
              : 'Using Cloudflare FLUX.1 [schnell] (Free) for text-to-image generation.'}
          </p>
        </div>
      )}
    </div>
  );
};
