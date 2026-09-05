import { useState, useEffect, useRef, useCallback } from 'react';

export interface LogEntry {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'process';
  timestamp: string;
  node?: string;
  status?: number | string;
}

export function useLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info', node?: string, status?: number | string) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(7),
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      node,
      status
    };
    setLogs(prev => [...prev.slice(-19), newLog]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    addLog('System logs cleared', 'success');
  }, [addLog]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return { logs, addLog, clearLogs, logEndRef };
}
