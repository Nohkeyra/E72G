import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Activity, 
  Cpu, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  BarChart3
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { ImageModel } from '../../services/modelRegistry';
import { PerformanceMetric } from '../../types/performance';
import { LogsPanel } from './LogsPanel';
import { MOTION_PROFILE } from '../../lib/motion';

interface EngineDiagnosticsProps {
  logs: { id: string; message: string; type: 'info' | 'success' | 'error' | 'process'; timestamp: string }[];
  metrics: PerformanceMetric[];
  selectedModel: ImageModel;
  isGenerating: boolean;
  isV2Active?: boolean;
  addLog: (message: string, type?: 'info' | 'success' | 'error' | 'process') => void;
  clearLogs: () => void;
}

export const EngineDiagnostics: React.FC<EngineDiagnosticsProps> = ({
  logs,
  metrics,
  selectedModel,
  isGenerating,
  isV2Active,
  addLog,
  clearLogs
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'logs'>('overview');

  // Calculate stats
  const totalGenerations = metrics.length;
  const successfulGenerations = metrics.filter(m => m.success).length;
  const successRate = totalGenerations > 0 ? Math.round((successfulGenerations / totalGenerations) * 100) : 100;
  const avgLatency = totalGenerations > 0 
    ? Math.round(metrics.reduce((acc, curr) => acc + curr.latency, 0) / totalGenerations) 
    : 0;

  const getStatusText = () => {
    if (isGenerating) return 'GENERATING';
    if (successRate < 80) return 'DEGRADED';
    return 'ONLINE';
  };
  
  // Format data for chart
  const chartData = metrics.slice(-20).map((m, i) => ({
    id: i,
    latency: m.latency,
    status: m.success ? 'Success' : 'Error',
    time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }));

  return (
    <div className="relative w-full h-full min-h-[500px] flex flex-col bg-bg-secondary/40 rounded-2xl overflow-hidden border border-border-primary">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 md:p-5 border-b border-border-primary bg-bg-secondary/50 z-10 gap-4 shrink-0 relative">
        <div className="flex items-center gap-4 w-full md:w-auto pr-10 md:pr-0">
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center relative overflow-hidden shadow-[0_0_15px_rgba(var(--accent-rgb),0.1)] shrink-0">
                  <Activity size={20} className="text-accent relative z-10" />
                  {isGenerating && (
                    <motion.div 
                      className="absolute inset-0 bg-accent/20"
                      animate={{ opacity: [0.2, 0.5, 0.2] }}
                      transition={{ ...MOTION_PROFILE.FLOW, repeat: Infinity }}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-display font-bold uppercase tracking-widest text-text-primary whitespace-nowrap">
                      Engine Diagnostics
                    </h2>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full border ${
                        isGenerating ? 'bg-accent/10 border-accent text-accent' :
                        successRate < 80 ? 'bg-red-500/10 border-red-500 text-red-500' :
                        'bg-green-500/10 border-green-500 text-green-500'
                      } font-mono font-bold`}>
                        {getStatusText()}
                      </span>
                      {isV2Active && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-accent text-bg-primary font-mono font-bold animate-pulse shadow-[0_0_10px_rgba(var(--accent-rgb),0.3)]">
                          V2_ACTIVE
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-[9px] text-text-secondary mt-0.5 font-mono tracking-wide opacity-70 truncate">
                    System Monitor // v2.1 // {selectedModel}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-bg-primary/50 p-1 rounded-lg border border-border-primary w-full md:w-auto overflow-x-auto custom-scrollbar no-scrollbar">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-1.5 rounded-md text-[10px] font-medium uppercase tracking-wider transition-all flex-1 md:flex-initial text-center ${
                    activeTab === 'overview' 
                      ? 'bg-bg-secondary text-text-primary shadow-sm border border-border-primary' 
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('logs')}
                  className={`px-4 py-1.5 rounded-md text-[10px] font-medium uppercase tracking-wider transition-all flex-1 md:flex-initial text-center ${
                    activeTab === 'logs' 
                      ? 'bg-bg-secondary text-text-primary shadow-sm border border-border-primary' 
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50'
                  }`}
                >
                  System Logs
                </button>
              </div>

            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col bg-bg-primary/30 relative">
              {/* Technical Grid Overlay */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                   style={{ backgroundImage: 'linear-gradient(var(--border-primary) 1px, transparent 1px), linear-gradient(90deg, var(--border-primary) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

              {activeTab === 'overview' ? (
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 relative z-10">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-bg-secondary/50 border border-border-primary rounded-xl p-5 flex flex-col gap-3 hover:border-accent/30 transition-colors group">
                      <div className="flex items-center gap-2 text-text-secondary text-[10px] uppercase tracking-widest font-medium group-hover:text-accent transition-colors">
                        <Zap size={12} /> Success Rate
                      </div>
                      <div className="text-3xl font-bold font-mono text-text-primary tracking-tighter">
                        {successRate}%
                      </div>
                      <div className="w-full h-1 bg-bg-primary rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${successRate >= 90 ? 'bg-green-500' : successRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                          style={{ width: `${successRate}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-bg-secondary/50 border border-border-primary rounded-xl p-5 flex flex-col gap-3 hover:border-accent/30 transition-colors group">
                      <div className="flex items-center gap-2 text-text-secondary text-[10px] uppercase tracking-widest font-medium group-hover:text-accent transition-colors">
                        <Clock size={12} /> Avg Latency
                      </div>
                      <div className="text-3xl font-bold font-mono text-text-primary tracking-tighter">
                        {avgLatency}<span className="text-sm text-text-secondary ml-1 font-sans font-normal">ms</span>
                      </div>
                      <div className="text-[10px] text-text-secondary font-mono opacity-70">
                        Last: {metrics.length > 0 ? metrics[metrics.length - 1].latency : 0}ms
                      </div>
                    </div>

                    <div className="bg-bg-secondary/50 border border-border-primary rounded-xl p-5 flex flex-col gap-3 hover:border-accent/30 transition-colors group">
                      <div className="flex items-center gap-2 text-text-secondary text-[10px] uppercase tracking-widest font-medium group-hover:text-accent transition-colors">
                        <Cpu size={12} /> Active Engine
                      </div>
                      <div className="text-lg font-bold font-display text-text-primary truncate" title={selectedModel}>
                        {selectedModel}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-text-secondary font-mono uppercase">
                        <div className={`w-1.5 h-1.5 rounded-full ${isGenerating ? 'bg-accent animate-pulse shadow-[0_0_8px_currentColor]' : 'bg-green-500'}`} />
                        {isGenerating ? 'Processing' : 'Idle'}
                      </div>
                    </div>

                    <div className="bg-bg-secondary/50 border border-border-primary rounded-xl p-5 flex flex-col gap-3 hover:border-accent/30 transition-colors group">
                      <div className="flex items-center gap-2 text-text-secondary text-[10px] uppercase tracking-widest font-medium group-hover:text-accent transition-colors">
                        <BarChart3 size={12} /> Total Gens
                      </div>
                      <div className="text-3xl font-bold font-mono text-text-primary tracking-tighter">
                        {totalGenerations}
                      </div>
                      <div className="text-[10px] text-text-secondary font-mono opacity-70">
                        Session Total
                      </div>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="bg-bg-secondary/50 border border-border-primary rounded-xl p-4 md:p-6 h-48 md:h-72 relative overflow-hidden group">
                    <div className="flex justify-between items-center mb-4 md:mb-6">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary flex items-center gap-2 group-hover:text-accent transition-colors">
                        <Activity size={14} /> Latency Performance
                      </h3>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-1.5 text-[10px] text-text-secondary">
                          <div className="w-2 h-2 rounded-full bg-accent/50" /> Latency
                        </div>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" opacity={0.3} vertical={false} />
                        <XAxis 
                          dataKey="time" 
                          stroke="var(--text-secondary)" 
                          fontSize={10} 
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: 'var(--text-secondary)', fontSize: 9, fontFamily: 'var(--font-mono)' }}
                          dy={10}
                        />
                        <YAxis 
                          stroke="var(--text-secondary)" 
                          fontSize={10} 
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: 'var(--text-secondary)', fontSize: 9, fontFamily: 'var(--font-mono)' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'var(--bg-secondary)', 
                            borderColor: 'var(--border-primary)',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontFamily: 'var(--font-mono)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                          }}
                          itemStyle={{ color: 'var(--text-primary)' }}
                          cursor={{ stroke: 'var(--accent)', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="latency" 
                          stroke="var(--accent)" 
                          fillOpacity={1} 
                          fill="url(#colorLatency)" 
                          strokeWidth={2}
                          animationDuration={1000}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Recent Issues */}
                  <div className="bg-bg-secondary/50 border border-border-primary rounded-xl p-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-4 flex items-center gap-2">
                      <AlertTriangle size={14} /> Recent System Events
                    </h3>
                    <div className="space-y-2">
                      {logs.filter(l => l.type === 'error').slice(-3).map((log, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                          <AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-red-500 font-medium">{log.message}</p>
                            <p className="text-[10px] text-red-500/60 mt-1 font-mono">{log.timestamp}</p>
                          </div>
                        </div>
                      ))}
                      {logs.filter(l => l.type === 'error').length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 text-text-secondary/40 space-y-2 border border-dashed border-border-primary rounded-lg">
                          <CheckCircle2 size={24} className="opacity-50" />
                          <span className="text-xs font-mono">No recent system issues detected.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full overflow-hidden">
                  <LogsPanel 
                    logs={logs} 
                    onClose={() => {}} 
                    addLog={addLog} 
                    clearLogs={clearLogs} 
                    selectedModel={selectedModel} 
                    embedded={true}
                  />
                </div>
              )}
            </div>
    </div>
  );
};
