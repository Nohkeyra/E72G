import React, { useRef, useEffect } from 'react';
import { Terminal, Trash2, X } from 'lucide-react';
import { LogEntry } from '../../hooks/useLogs';

interface LogsPanelProps {
  logs: LogEntry[];
  onClose: () => void;
  addLog: (message: string, type?: 'info' | 'success' | 'error' | 'process') => void;
  clearLogs: () => void;
  selectedModel?: string;
  embedded?: boolean;
}

export const LogsPanel: React.FC<LogsPanelProps> = ({
  logs,
  onClose,
  clearLogs,
  selectedModel,
  embedded = false,
}) => {
  const logEndRef = useRef<HTMLDivElement>(null);
  const isAtBottom = useRef(true);

  useEffect(() => {
    if (isAtBottom.current && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
    }
  }, [logs]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // If we are within 50px of the bottom, consider it "at bottom"
    isAtBottom.current = scrollHeight - scrollTop - clientHeight < 50;
  };

  const typeColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'error':   return 'text-red-400';
      case 'process': return 'text-accent';
      default:        return 'text-text-secondary';
    }
  };

  const statusColor = (status?: number | string) => {
    if (!status) return 'text-text-secondary opacity-50';
    if (typeof status === 'number' && status >= 400) return 'text-red-400';
    if (typeof status === 'number' && status >= 200 && status < 300) return 'text-green-400';
    return 'text-amber-400';
  };

  const typePrefix = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return '✓';
      case 'error':   return '✗';
      case 'process': return '▶';
      default:        return '·';
    }
  };

  const content = (
    <div className="flex flex-col h-full">
      {/* Header — hidden when embedded */}
      {!embedded && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary shrink-0">
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-accent" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent font-mono">System Logs</span>
            {selectedModel && (
              <span className="text-[8px] font-mono text-text-secondary opacity-50 ml-2">// {selectedModel}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearLogs}
              className="p-1.5 text-text-secondary hover:text-red-400 transition-colors rounded"
              title="Clear Logs"
            >
              <Trash2 size={13} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-text-secondary hover:text-text-primary transition-colors rounded"
              title="Close"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Log entries */}
      <div 
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2 space-y-0.5 font-mono text-[10px]"
      >
        {logs.length === 0 ? (
          <div className="text-text-secondary opacity-40 text-center py-8">No logs yet.</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="grid grid-cols-[auto_70px_60px_40px_1fr] items-baseline gap-2 py-0.5 leading-relaxed">
              <span className={`shrink-0 ${typeColor(log.type)}`}>{typePrefix(log.type)}</span>
              <span className="text-text-secondary opacity-70">{log.timestamp}</span>
              <span className="text-accent font-medium">{log.node || '-'}</span>
              <span className={`${statusColor(log.status)} font-medium`}>{log.status || '-'}</span>
              <span className={`break-all ${typeColor(log.type)}`}>{log.message}</span>
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>

      {/* Embedded footer with clear */}
      {embedded && (
        <div className="shrink-0 border-t border-border-primary px-3 py-2 flex justify-end">
          <button
            onClick={clearLogs}
            className="flex items-center gap-1.5 text-[9px] text-text-secondary hover:text-red-400 transition-colors font-mono uppercase tracking-wider"
          >
            <Trash2 size={11} /> Clear
          </button>
        </div>
      )}
    </div>
  );

  return content;
};
