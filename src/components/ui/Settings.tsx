import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Save, Trash2, AlertCircle, Sparkles, Zap, Shield, Terminal } from 'lucide-react';
import { safeLocalStorage } from '../../utils/storageUtils';
import { playClickSound, triggerHapticFeedback } from '../../utils/soundUtils';
import { EngineDiagnostics } from './EngineDiagnostics';
import { PerformanceMetric } from '../../types/performance';
import { ImageModel } from '../../services/modelRegistry';
import { checkGeminiConnection } from '../../services/geminiService';
import { MOTION_PROFILE } from '../../lib/motion';

interface SettingsProps {
  onClose: () => void;
  addLog: (message: string, type?: 'info' | 'success' | 'error' | 'process') => void;
  geminiKeys?: string[];
  setGeminiKeys?: (keys: string[]) => void;
  activeKeyIndex?: number;
  setActiveKeyIndex?: (index: number) => void;
  geminiApiKey?: string;
  setGeminiApiKey?: (key: string) => void;
  clientSideMode: boolean;
  setClientSideMode: (val: boolean) => void;
  showDevConsole: boolean;
  setShowDevConsole: (val: boolean) => void;
  logs: { id: string; message: string; type: 'info' | 'success' | 'error' | 'process'; timestamp: string }[];
  metrics: PerformanceMetric[];
  selectedModel: ImageModel;
  isGenerating: boolean;
  clearLogs: () => void;
}

const DEFAULT_FALLBACK_KEY = 'AIzaSyDrVpqsExzVg7gBqIzDwVtF1K4yqUPq-Mg';

export const Settings: React.FC<SettingsProps> = ({
  onClose,
  addLog,
  geminiKeys = [''],
  setGeminiKeys,
  geminiApiKey,
  setGeminiApiKey,
  clientSideMode,
  setClientSideMode,
  showDevConsole,
  setShowDevConsole,
  logs,
  metrics,
  isGenerating,
  clearLogs
}) => {
  const [publicBackendUrl, setPublicBackendUrl] = useState(() => safeLocalStorage.getItem('publicBackendUrl') || '');

  const [activeTab, setActiveTab] = useState<'system' | 'keys' | 'diagnostics'>('system');
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyTestResult, setKeyTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    // Sync to local storage when backend url changes locally
  }, [publicBackendUrl]);

  const handleButtonClick = (callback: () => void) => {
    playClickSound();
    triggerHapticFeedback();
    callback();
  };

  const handleSave = () => {
    safeLocalStorage.setItem('publicBackendUrl', publicBackendUrl.trim());
    safeLocalStorage.setItem('clientSideMode', String(clientSideMode));
    safeLocalStorage.setItem('showDevConsole', String(showDevConsole));

    addLog('[SETTINGS SAVED] Configuration updated and persisted to LocalStorage.', 'success');
    onClose();
  };

  const handleClear = () => {
    safeLocalStorage.removeItem('publicBackendUrl');
    safeLocalStorage.removeItem('clientSideMode');
    
    setPublicBackendUrl('');
    setClientSideMode(false);

    addLog('Local cache cleared.', 'info');
  };

  return (
    <div className="w-full max-w-xl bg-bg-primary border border-border-primary rounded-2xl shadow-2xl flex flex-col max-h-[90dvh] md:max-h-[85vh] backdrop-blur-xl ring-1 ring-black/5 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 md:p-6 border-b border-border-primary shrink-0 bg-bg-secondary/30 z-10 gap-4 relative">
        <div className="flex items-center gap-4 w-full md:w-auto pr-10 md:pr-0">
          <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center border border-accent/20 shrink-0">
            <Shield size={18} className="text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-text-primary truncate">System_Configuration</h2>
            <p className="text-[9px] font-mono uppercase tracking-widest text-text-secondary mt-0.5 opacity-60 truncate">v3.0 // Secure_Uplink</p>
          </div>
          {/* Mobile Close Button - Absolutely Positioned for Safety */}
          <motion.button 
            whileHover={{ scale: 1.05, transition: MOTION_PROFILE.TACTILE }}
            whileTap={{ scale: 0.9, transition: MOTION_PROFILE.TACTILE }} 
            onClick={() => handleButtonClick(onClose)} 
            className="md:hidden absolute top-4 right-4 p-2.5 bg-bg-secondary border border-border-primary rounded-xl text-text-secondary hover:text-accent font-mono shrink-0 shadow-lg z-50 transition-colors active:border-accent"
          >
            <X size={20} />
          </motion.button>
        </div>
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex bg-bg-secondary p-1 rounded-xl border border-border-primary flex-1 md:flex-initial">
            <button 
              onClick={() => setActiveTab('system')}
              className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'system' ? 'bg-accent text-bg-primary shadow-lg' : 'text-text-secondary hover:text-text-primary'}`}
            >
              System
            </button>
            <button 
              onClick={() => setActiveTab('keys')}
              className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'keys' ? 'bg-accent text-bg-primary shadow-lg' : 'text-text-secondary hover:text-text-primary'}`}
            >
              API Keys
            </button>
            <button 
              onClick={() => setActiveTab('diagnostics')}
              className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'diagnostics' ? 'bg-accent text-bg-primary shadow-lg' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Diagnostics
            </button>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05, transition: MOTION_PROFILE.TACTILE }}
            whileTap={{ scale: 0.9, transition: MOTION_PROFILE.TACTILE }} 
            onClick={() => handleButtonClick(onClose)} 
            className="hidden md:flex p-2 bg-bg-secondary border border-border-primary rounded-lg text-text-secondary hover:text-accent hover:border-accent/40 transition-all font-mono"
          >
            <X size={18} />
          </motion.button>
        </div>
      </div>

      <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar bg-bg-primary/30 relative flex-1">
        {/* Technical Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(var(--border-primary) 1px, transparent 1px), linear-gradient(90deg, var(--border-primary) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        
        {activeTab === 'system' && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* Diagnostics Panel */}
            <div className="space-y-4 bg-bg-secondary/40 p-6 rounded-2xl border border-border-primary relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-blue-500/40 rounded-tl-lg" />
              
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400 flex items-center gap-2 font-mono">
                  <AlertCircle size={14} /> System_Diagnostics
                </h3>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.02, transition: MOTION_PROFILE.TACTILE }}
                whileTap={{ scale: 0.98, transition: MOTION_PROFILE.TACTILE }}
                onClick={() => handleButtonClick(async () => {
                  addLog('=== INITIATING SYSTEM DIAGNOSTICS ===', 'process');
                  addLog(`Environment: ${import.meta.env.DEV ? 'Development' : 'Production'}`, 'info');
                  addLog(`Platform: Web (Elite_72_Core)`, 'info');
                  
                  // Real Storage Check
                  try {
                    const storageTest = 'test_write_' + Date.now();
                    safeLocalStorage.setItem(storageTest, 'ok');
                    const readBack = safeLocalStorage.getItem(storageTest);
                    safeLocalStorage.removeItem(storageTest);
                    if (readBack === 'ok') addLog('Local Storage: OPERATIONAL', 'success');
                  } catch {
                    addLog('Local Storage: FAILED or BLOCKED', 'error');
                  }

                  // Real Network Check
                  addLog('Testing Network Latency...', 'process');
                  try {
                    const start = Date.now();
                    await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors' });
                    addLog(`Network: ONLINE (Ping: ~${Date.now() - start}ms)`, 'success');
                  } catch {
                    addLog('Network: OFFLINE or BLOCKED', 'error');
                  }

                  // Real Gemini API Check
                  addLog('Testing Gemini API Connection...', 'process');
                  const currentKey = geminiApiKey || geminiKeys[0] || '';
                  const geminiCheck = await checkGeminiConnection(currentKey);
                  if (geminiCheck.success) {
                    addLog(`Gemini API: OPERATIONAL (Latency: ${geminiCheck.latency}ms)`, 'success');
                    addLog(`Detail: ${geminiCheck.details}`, 'info');
                  } else {
                    addLog(`Gemini API: CONNECTION_FAILED`, 'error');
                    addLog(`Detail: ${geminiCheck.details}`, 'error');
                  }
                  
                  addLog('=== DIAGNOSTICS COMPLETE ===', 'success');
                })}
                className="w-full py-5 bg-bg-primary/30 border border-border-primary text-blue-400 rounded-xl hover:border-blue-500/50 transition-all text-[11px] font-mono uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-inner group hover:bg-blue-500/5"
              >
                <Terminal size={16} className="group-hover:scale-110 transition-transform" /> Run_Full_System_Audit
              </motion.button>
            </div>

            {/* Backend Connection */}
            <div className="space-y-4 bg-bg-secondary/40 p-6 rounded-2xl border border-border-primary relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400/40 rounded-tl-lg" />
              
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400 flex items-center gap-2 font-mono">
                  <Terminal size={14} /> Backend_Connection
                </h3>
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-secondary opacity-60 ml-1">Public_Backend_URL</label>
                <div className="relative group/input">
                  <input
                    type="url"
                    value={publicBackendUrl}
                    onChange={(e) => setPublicBackendUrl(e.target.value)}
                    placeholder="https://your-backend-url.example.com"
                    className="w-full bg-bg-primary/30 border border-border-primary rounded-xl px-5 py-4 text-xs font-mono text-accent placeholder-accent/20 focus:outline-none focus:border-accent/40 transition-all shadow-inner group-hover/input:bg-bg-primary/50"
                  />
                  <div className="absolute top-0 left-0 w-1 h-full bg-accent/20 rounded-l-xl group-focus-within/input:bg-accent transition-colors" />
                </div>
              </div>
            </div>

            {/* Client-Side Mode */}
            <div className="space-y-4 bg-bg-secondary/40 p-6 rounded-2xl border border-red-500/20 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-red-500/40 rounded-tl-lg" />
              
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-red-500 flex items-center gap-2 font-mono">
                  <Zap size={14} /> Client-Side_Demo_Mode
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-text-primary uppercase tracking-wider">Enable Client-Side Generation</p>
                    <p className="text-[9px] text-text-secondary opacity-70 leading-relaxed max-w-[280px]">
                      Bypasses the backend and calls AI providers directly from your browser. 
                      <span className="text-red-500 font-bold ml-1 underline">WARNING: EXPOSES API KEYS IN NETWORK TRAFFIC.</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setClientSideMode(!clientSideMode)}
                    className={`w-12 h-6 rounded-full transition-all relative ${clientSideMode ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]' : 'bg-bg-primary border border-border-primary'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${clientSideMode ? 'left-7 bg-white' : 'left-1 bg-text-secondary'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Developer Console */}
            <div className={`space-y-4 bg-bg-secondary/40 p-6 rounded-2xl border ${showDevConsole ? 'border-yellow-500/20' : 'border-border-primary'} relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm`}>
              <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l ${showDevConsole ? 'border-yellow-500/40' : 'border-border-primary'} rounded-tl-lg`} />
              
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-1.5 h-1.5 rounded-full ${showDevConsole ? 'bg-yellow-500 animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'bg-text-secondary/30'}`} />
                <h3 className={`text-xs font-bold uppercase tracking-[0.3em] ${showDevConsole ? 'text-yellow-500' : 'text-text-secondary'} flex items-center gap-2 font-mono`}>
                  <Terminal size={14} /> Developer_Console
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-text-primary uppercase tracking-wider">Enable Real-Time Telemetry</p>
                    <p className="text-[9px] text-text-secondary opacity-70 leading-relaxed max-w-[280px]">
                      Shows raw synthesis prompts and neural network status in the main viewport.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDevConsole(!showDevConsole)}
                    className={`w-12 h-6 rounded-full transition-all relative ${showDevConsole ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.4)]' : 'bg-bg-primary border border-border-primary'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${showDevConsole ? 'left-7 bg-white' : 'left-1 bg-text-secondary'}`} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {activeTab === 'keys' && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 mb-2">
              <div className="flex items-start gap-3">
                <AlertCircle size={16} className="text-accent shrink-0 mt-0.5" />
                <p className="text-[10px] text-text-secondary leading-relaxed font-mono">
                  <span className="text-accent font-bold">PROVISIONING_PROTOCOL:</span> Insert your own provider credentials below to bypass shared limits and use your personal accounts for generation.
                </p>
              </div>
            </div>

            {/* Gemini API Key Configuration */}
            <div className="space-y-4 bg-bg-secondary/40 p-6 rounded-2xl border border-blue-500/20 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-blue-500/40 rounded-tl-lg" />
              
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400 flex items-center gap-2 font-mono">
                  <Sparkles size={14} /> Gemini_API_Configuration
                </h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-secondary opacity-60">
                    Gemini API Key
                  </label>
                  {geminiApiKey && geminiApiKey !== DEFAULT_FALLBACK_KEY && (
                    <button
                      onClick={() => {
                        if (setGeminiApiKey) setGeminiApiKey('');
                        if (setGeminiKeys) setGeminiKeys(['']);
                        addLog('API key cleared. Defaulting to shared key.', 'info');
                      }}
                      className="text-[9px] text-red-500 hover:text-red-400 font-mono"
                    >
                      [CLEAR_CUSTOM_KEY]
                    </button>
                  )}
                </div>
                <div className="relative group/input flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="password"
                    value={geminiApiKey === DEFAULT_FALLBACK_KEY ? '' : (geminiApiKey || '')}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      if (setGeminiApiKey) setGeminiApiKey(val);
                      if (setGeminiKeys) setGeminiKeys([val]);
                    }}
                    placeholder="Enter API key here"
                    className="w-full bg-bg-primary/50 border border-border-primary rounded-xl px-4 py-3 text-xs font-mono text-blue-400 placeholder-blue-400/30 focus:outline-none focus:border-blue-500/60 transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    disabled={isTestingKey}
                    onClick={async () => {
                      setIsTestingKey(true);
                      setKeyTestResult(null);
                      const keyToTest = (geminiApiKey && geminiApiKey !== DEFAULT_FALLBACK_KEY) ? geminiApiKey : undefined;
                      addLog('Testing Gemini API key connection...', 'process');
                      const result = await checkGeminiConnection(keyToTest);
                      setIsTestingKey(false);
                      if (result.success) {
                        setKeyTestResult({ success: true, message: `Verified! (${result.latency}ms) - ${result.details}` });
                        addLog(`API Key Verified! (${result.latency}ms) - ${result.details}`, 'success');
                      } else {
                        setKeyTestResult({ success: false, message: `Failed: ${result.details}` });
                        addLog(`API Key Test Failed: ${result.details}`, 'error');
                      }
                    }}
                    className="px-4 py-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isTestingKey ? 'Testing...' : 'Test Key'}
                  </button>
                </div>
                {isTestingKey && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-[10px] font-mono text-blue-400 animate-pulse flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                    <span>Testing connection to Gemini API...</span>
                  </div>
                )}
                {keyTestResult && (
                  <div className={`p-3 rounded-xl border text-[10px] font-mono font-bold flex items-center gap-2 ${keyTestResult.success ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-red-500/10 border-red-500/40 text-red-400'}`}>
                    <span>{keyTestResult.success ? '✅' : '❌'}</span>
                    <span>{keyTestResult.message}</span>
                  </div>
                )}
                <p className="text-[9px] text-text-secondary opacity-60 font-mono">
                  {geminiApiKey && geminiApiKey !== DEFAULT_FALLBACK_KEY 
                    ? '✓ Using custom Gemini API key' 
                    : 'Currently using default fallback key.'}
                </p>
              </div>

              <div className="pt-2">
                <motion.button 
                  whileHover={{ scale: 1.02, transition: MOTION_PROFILE.TACTILE }}
                  whileTap={{ scale: 0.98, transition: MOTION_PROFILE.TACTILE }}
                  onClick={() => handleButtonClick(async () => {
                    if (window.aistudio) {
                      try {
                        await window.aistudio.openSelectKey();
                        addLog('Neural Uplink Authorized: Platform Key Selected', 'success');
                      } catch {
                        addLog('Neural Uplink Failed: Key Selection Aborted', 'error');
                      }
                    } else {
                       addLog('Platform secure key pop-up is not available outside the main studio view.', 'info');
                    }
                  })}
                  className="w-full py-3 bg-bg-primary/30 border border-border-primary text-blue-400 rounded-xl hover:border-blue-500/50 transition-all text-[9px] font-mono uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-inner group hover:bg-blue-500/5"
                >
                  <Shield size={12} className="group-hover:scale-110 transition-transform" /> Authorize_Via_Platform
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'diagnostics' && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-full"
          >
            <EngineDiagnostics 
              logs={logs}
              metrics={metrics}
              selectedModel={'gemini'}
              isGenerating={isGenerating}
              addLog={addLog}
              clearLogs={clearLogs}
            />
          </motion.div>
        )}
      </div>

      <div className="flex justify-between items-center p-4 md:p-6 border-t border-border-primary mt-auto shrink-0 bg-bg-secondary/50 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] z-10">
        <motion.button 
          whileHover={{ scale: 1.05, transition: MOTION_PROFILE.TACTILE }}
          whileTap={{ scale: 0.9, transition: MOTION_PROFILE.TACTILE }} 
          onClick={() => handleButtonClick(handleClear)} 
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-red-500 opacity-60 hover:opacity-100 transition-opacity font-mono p-2"
        >
          <Trash2 size={16} /> 
          <span className="hidden sm:inline">Clear_Buffer</span>
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.02, transition: MOTION_PROFILE.TACTILE }}
          whileTap={{ scale: 0.9, transition: MOTION_PROFILE.TACTILE }} 
          onClick={() => handleButtonClick(handleSave)} 
          className="flex items-center gap-3 px-6 md:px-10 py-3 md:py-4 bg-accent text-bg-primary rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-xl shadow-accent/20"
        >
          <Save size={16} /> Save_&_Sync
        </motion.button>
      </div>
    </div>
  );
};
