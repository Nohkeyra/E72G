import React from 'react';

// Helper to handle size prop if passed from lucide-react context
interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export const SeedreamIcon = ({ size, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" width={size || 24} height={size || 24} {...props}>
    {/* Geometric W/M Pulse Wave - Vivid Blue style */}
    <path d="M3 13 L8 4 L12 16 L16 4 L21 13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" />
    <path d="M3 13 L8 4 L12 16 L16 4 L21 13" stroke="currentColor" strokeWidth="0.5" strokeLinecap="square" strokeLinejoin="miter" strokeOpacity="0.5" transform="translate(0, 2)" />
    <circle cx="12" cy="16" r="1.5" fill="currentColor">
      <animate attributeName="r" values="1.5;2.5;1.5" dur="1.5s" repeatCount="indefinite" />
      <animate attributeName="fillOpacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
    </circle>
  </svg>
);

export const BytePlusIcon = ({ size, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" width={size || 24} height={size || 24} {...props}>
    {/* BytePlus Logo: Abstract 'B' / Plus shape */}
    <path d="M4 6h10c3 0 5 2 5 5s-2 5-5 5H8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    <path d="M4 6v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    <path d="M8 11h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
    <circle cx="16" cy="6" r="2" fill="currentColor">
      <animate attributeName="r" values="2;3;2" dur="2s" repeatCount="indefinite" />
      <animate attributeName="fillOpacity" values="0.4;0.9;0.4" dur="2s" repeatCount="indefinite" />
    </circle>
  </svg>
);

export const CloudflareIcon = ({ size, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" width={size || 24} height={size || 24} {...props}>
    <path d="M17.5 19c2.5 0 4.5-2 4.5-4.5 0-2.2-1.6-4-3.7-4.4C17.8 7.4 15.4 5 12.5 5c-2.3 0-4.3 1.5-5.1 3.6C5.1 8.8 3.5 10.4 3.5 12.5c0 2.5 2 4.5 4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    <path d="M16 16c1.5 0 2.5-1 2.5-2.5 0-1.2-.9-2.2-2.1-2.4C16.2 9.4 14.8 8 13 8c-1.4 0-2.6.9-3.1 2.2C8.7 10.4 7.5 11.4 7.5 12.5c0 1.5 1 2.5 2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
    <circle cx="13" cy="12" r="2" fill="currentColor">
      <animate attributeName="r" values="2;3;2" dur="2.5s" repeatCount="indefinite" />
      <animate attributeName="fillOpacity" values="0.3;0.7;0.3" dur="2.5s" repeatCount="indefinite" />
    </circle>
  </svg>
);

export const PollinationsIcon = ({ size, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" width={size || 24} height={size || 24} {...props}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.3" />
    <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    <circle cx="12" cy="12" r="3" fill="currentColor">
      <animate attributeName="r" values="3;4.5;3" dur="1.8s" repeatCount="indefinite" />
      <animate attributeName="fillOpacity" values="0.4;0.9;0.4" dur="1.8s" repeatCount="indefinite" />
    </circle>
  </svg>
);

export const AiHordeIcon = ({ size, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" width={size || 24} height={size || 24} {...props}>
    <path d="M12 2L4 6v12l8 4 8-4V6l-8-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    <path d="M12 6L7 8.5v7l5 2.5 5-2.5v-7L12 6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
    <circle cx="12" cy="12" r="2.5" fill="currentColor">
      <animate attributeName="r" values="2.5;3.5;2.5" dur="2.2s" repeatCount="indefinite" />
      <animate attributeName="fillOpacity" values="0.3;0.7;0.3" dur="2.2s" repeatCount="indefinite" />
    </circle>
  </svg>
);

export const SegmindIcon = ({ size, ...props }: IconProps) => (
  <svg viewBox="0 0 100 100" fill="none" width={size || 24} height={size || 24} {...props}>
    <defs>
      <linearGradient id="segmind_grad_unique" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FF6B81" />
        <stop offset="100%" stopColor="#A351D6" />
      </linearGradient>
      <filter id="glow_unique" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <g transform="translate(50, 58) scale(0.8)" filter="url(#glow_unique)">
       {/* Top Loop */}
       <path d="M0 -42 C 18 -42, 28 -22, 12 5 C -2 28, -28 28, -12 5 C -28 -22, -18 -42, 0 -42 Z" stroke="url(#segmind_grad_unique)" strokeWidth="6" fill="none" />
       {/* Right Loop */}
       <path d="M0 -42 C 18 -42, 28 -22, 12 5 C -2 28, -28 28, -12 5 C -28 -22, -18 -42, 0 -42 Z" stroke="url(#segmind_grad_unique)" strokeWidth="6" fill="none" transform="rotate(120)" />
       {/* Left Loop */}
       <path d="M0 -42 C 18 -42, 28 -22, 12 5 C -2 28, -28 28, -12 5 C -28 -22, -18 -42, 0 -42 Z" stroke="url(#segmind_grad_unique)" strokeWidth="6" fill="none" transform="rotate(240)" />
    </g>
  </svg>
);

export const PlaygroundIcon = ({ size, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" width={size || 24} height={size || 24} {...props}>
    {/* Playground: Geometric frame with play symbol */}
    <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
    <path d="M10 9l6 3-6 3V9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="17" cy="7" r="1.5" fill="currentColor">
      <animate attributeName="r" values="1.5;2.5;1.5" dur="2s" repeatCount="indefinite" />
      <animate attributeName="fillOpacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
    </circle>
  </svg>
);

export const KandinskyIcon = ({ size, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" width={size || 24} height={size || 24} {...props}>
    {/* Kandinsky: Abstract composition (Circle, Line, Point) */}
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
    <path d="M16 6l-8 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 8h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    <circle cx="16" cy="16" r="2" fill="currentColor">
      <animate attributeName="r" values="2;3;2" dur="2.5s" repeatCount="indefinite" />
      <animate attributeName="fillOpacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite" />
    </circle>
  </svg>
);

export const FluxIcon = ({ size, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" width={size || 24} height={size || 24} {...props}>
    <path d="M12 3L3 12l9 9 9-9-9-9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    <path d="M12 7l-5 5 5 5 5-5-5-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
    <circle cx="12" cy="12" r="2.5" fill="currentColor">
      <animate attributeName="r" values="2.5;4;2.5" dur="1.5s" repeatCount="indefinite" />
      <animate attributeName="fillOpacity" values="0.4;0.9;0.4" dur="1.5s" repeatCount="indefinite" />
    </circle>
  </svg>
);

export const GeminiIcon = ({ size, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" width={size || 24} height={size || 24} {...props}>
    <path d="M12 3l1.5 6.5L20 11l-6.5 1.5L12 19l-1.5-6.5L4 11l6.5-1.5L12 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    <path d="M12 7l1 3.5L16.5 12l-3.5 1L12 16.5l-1-3.5L7.5 12l3.5-1L12 7z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
    <circle cx="12" cy="12" r="2" fill="currentColor">
      <animate attributeName="r" values="2;3.5;2" dur="2.4s" repeatCount="indefinite" />
      <animate attributeName="fillOpacity" values="0.5;1;0.5" dur="2.4s" repeatCount="indefinite" />
    </circle>
  </svg>
);

export const NvidiaFluxIcon = ({ size, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" width={size || 24} height={size || 24} {...props}>
    {/* Flux: Speed/Flow lines with Nvidia style */}
    <path d="M4 12h16M4 6h10M10 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 6l4 6-4 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1" opacity="0.3" />
  </svg>
);

export const NvidiaSdxlIcon = ({ size, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" width={size || 24} height={size || 24} {...props}>
    {/* SDXL: High detail/Crystal structure */}
    <path d="M12 2l8 4v6l-8 4-8-4V6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 22v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
    <path d="M12 16l8-4M12 16l-8-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
    <circle cx="12" cy="11" r="2" fill="currentColor">
      <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
    </circle>
  </svg>
);

export const HuggingFaceIcon = ({ size, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" width={size || 24} height={size || 24} {...props}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor" opacity="0.8"/>
    <path d="M15.5 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-7 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" fill="currentColor"/>
    <path d="M12 17.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" fill="currentColor" opacity="0.8"/>
  </svg>
);

export const NvidiaSd35Icon = ({ size, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" width={size || 24} height={size || 24} {...props}>
    {/* SD 3.5: Triple layer/Advanced geometry */}
    <rect x="4" y="4" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2" opacity="0.8" />
    <rect x="14" y="4" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2" opacity="0.6" />
    <rect x="4" y="14" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2" opacity="0.6" />
    <rect x="14" y="14" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.4" />
    <path d="M10 10l4 4" stroke="currentColor" strokeWidth="1" opacity="0.4" />
  </svg>
);
