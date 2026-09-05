import React from 'react';

interface ChartFrameProps {
  children: React.ReactNode;
  height?: number | string;
  className?: string;
}

/**
 * ChartFrame provides a stable, fixed-height container for Recharts.
 * This prevents common sizing issues where ResponsiveContainer collapses to 0 height.
 */
export const ChartFrame: React.FC<ChartFrameProps> = ({ 
  children, 
  height = 320, 
  className = "" 
}) => {
  return (
    <div 
      className={`relative w-full min-w-0 ${className}`} 
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      {children}
    </div>
  );
};
