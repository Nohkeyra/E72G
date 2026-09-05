/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, Suspense, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { 
  Terminal,
  AlertCircle
} from 'lucide-react';

// Presets & Constants
import { Preset } from './types/presets';
import { VECTOR_PRESETS } from './modules/vector';
import { LOGO_PRESETS } from './modules/logo';
import { TYPOGRAPHY_PRESETS, TypographyPanel } from './modules/typography';

// Services & Utils
// Removed unused logic imports since they are encapsulated in custom domain hooks

// Components
import { CameraModal } from './components/ui/CameraModal';
import { PresetPanel } from './components/ui/PresetPanel';
import { PullToRefresh } from './components/ui/PullToRefresh';
import { HistoryPanel } from './components/ui/HistoryPanel';
import { AppHeader } from './components/layout/AppHeader';
import { AppNavigation } from './components/layout/AppNavigation';
import { Viewport } from './components/layout/Viewport';
import { ColorPalettePanel } from './components/ui/ColorPalettePanel';
import { SynthesisControls } from './components/ui/SynthesisControls';
import { Settings as SettingsPanel } from './components/ui/Settings';
import { SystemAlert } from './components/ui/SystemAlert';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { MOTION_PROFILE } from './lib/motion';

/// Store
import { useAppStore, Tab } from './store/useAppStore';

// Custom Hooks
import { useSynthesis } from './hooks/useSynthesis';
import { useAssets } from './hooks/useAssets';
import { useSystem } from './hooks/useSystem';
import { useImageBrightness } from './hooks/useImageBrightness';

export default function App() {
  const {
    activeTab, setActiveTab,
    userInput, setUserInput,
    selectedPreset, setSelectedPreset,
    uploadedImage, setUploadedImage,
    setUploadedMimeType,
    isDarkMode, setIsDarkMode,
    showSettings, setShowSettings,
    showCamera, setShowCamera,
    showHistory, setShowHistory,
    showDebug, setShowDebug,
    isHoldingCompare, setIsHoldingCompare,
    showColorPalette, setShowColorPalette,
    selectedPalette, setSelectedPalette,
    selectedLogoType, setSelectedLogoType,
    selectedLogoLayout, setSelectedLogoLayout,
    isVisualFidelity, setIsVisualFidelity,
    showPromptWarning, setShowPromptWarning,
    pendingPromptLength,
    selectedModel,
    selectedAspectRatio, setSelectedAspectRatio,
    clientSideMode, setClientSideMode,
    showDevConsole, setShowDevConsole,
    lastFinalPrompt,
    error, setError,
    resultImage,
    generationCount,
    metrics,
    usedPresets,
    favoritePresets, toggleFavoritePreset,
    logs, addLog, clearLogs,
    history, clearHistory,
    geminiApiKey, setGeminiApiKey,
    geminiKeys, setGeminiKeys,
    activeKeyIndex, setActiveKeyIndex,
    generationProgress
  } = useAppStore();

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastPresetCategoryRef = useRef<string>('');

  // Call Domain Hooks
  const {
    handleGenerate,
    handleRefine,
    handleAnalyze,
    isGenerating,
    isAnalyzing
  } = useSynthesis();

  const {
    handleFileUpload,
    onUploadClick,
    onCameraClick,
    onColorPaletteClick
  } = useAssets(fileInputRef);

  const {
    handleAppRefresh,
    handleClear,
    handleDownload,
    handleUndo
  } = useSystem();

  // Handle Dynamic UI Brightness calculation
  useImageBrightness(resultImage || uploadedImage);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  useEffect(() => {
    clearLogs();
    addLog('Elite 72 Engine Initialized', 'success');
    addLog('System Version: 1.6 (Production Build)', 'info');
    addLog('Mode: Standard Engine / Image Generation Only', 'info');
    addLog('Awaiting visual directives...', 'info');
  }, [clearLogs, addLog]);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setOverlaysWebView({ overlay: true }).catch(console.error);
      StatusBar.setStyle({ style: isDarkMode ? Style.Dark : Style.Light }).catch(console.error);
      if (Capacitor.getPlatform() === 'android') {
        StatusBar.setBackgroundColor({ color: isDarkMode ? '#000000' : '#D7D2D0' }).catch(console.error);
      }
    }
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (showDebug) {
      addLog('Debug Matrix initialized. System state: ' + JSON.stringify({
        activeTab,
        generationCount
      }), 'info');
      setTimeout(() => setShowDebug(false), 0);
    }
  }, [showDebug, activeTab, generationCount, addLog, setShowDebug]);

  useEffect(() => {
    const desiredAspectRatio = selectedPreset?.aspectRatio;
    if (desiredAspectRatio) {
      setSelectedAspectRatio(desiredAspectRatio);
    }
  }, [selectedPreset, setSelectedAspectRatio]);

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
    addLog(`Module activated: ${tab.toUpperCase()}`, 'info');
    setSelectedPreset(null);
    useAppStore.getState().setResultImage(null);
    setError(null);
  }, [addLog, setActiveTab, setSelectedPreset, setError]);

  const toggleFavorite = (presetName: string) => {
    toggleFavoritePreset(presetName);
    if (favoritePresets.has(presetName)) {
      addLog(`Removed ${presetName} from favorites`, 'info');
    } else {
      addLog(`Added ${presetName} to favorites`, 'success');
    }
  };

  const currentCategories = useMemo(() => 
    activeTab === 'vectorize' ? [...VECTOR_PRESETS] :
    activeTab === 'logo design' ? [...LOGO_PRESETS] :
    activeTab === 'typography' ? [...TYPOGRAPHY_PRESETS] : [],
    [activeTab]
  );

  const handleSelectPreset = useCallback((preset: Preset) => {
    setSelectedPreset(preset);

    // Smart-Sync Logic
    let newCategory = '';
    for (const cat of currentCategories) {
      if (cat.presets.some(p => p.name === preset.name)) {
        newCategory = cat.category;
        break;
      }
    }

    lastPresetCategoryRef.current = newCategory;
  }, [currentCategories, setSelectedPreset]);

  return (
    <PullToRefresh onRefresh={handleAppRefresh}>
      <ErrorBoundary>
        <div className="h-dvh flex overflow-hidden bg-bg-primary text-text-primary font-sans selection:bg-accent selection:text-bg-primary transition-colors duration-500 relative pb-safe md:pb-0">
        {/* Sidebar Navigation (Desktop) / Bottom Nav (Mobile) */}
        <AppNavigation activeTab={activeTab} onTabChange={handleTabChange} />
        
        {/* Developer Console Overlay */}
        <AnimatePresence>
          {showDevConsole && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: 20 }}
              transition={MOTION_PROFILE.PREMIUM}
              className="fixed top-20 right-4 z-[50] w-80 bg-black/80 backdrop-blur-xl border border-yellow-500/30 rounded-xl overflow-hidden shadow-2xl hidden lg:block"
            >
              <div className="bg-yellow-500/10 px-4 py-2 border-b border-yellow-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal size={14} className="text-yellow-500" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-500">Live_Telemetry</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${isGenerating ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`} />
                  <span className="text-[8px] font-mono text-white/40 uppercase">{isGenerating ? 'Synthesizing' : 'Ready'}</span>
                </div>
              </div>
              <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar font-mono">
                <div className="space-y-1">
                  <p className="text-[8px] text-white/30 uppercase tracking-widest">Active_Engine</p>
                  <p className="text-[10px] text-yellow-500/80">Gemini (gemini-3.1-flash-image-preview)</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] text-white/30 uppercase tracking-widest">Raw_Synthesis_String</p>
                  <div className="text-[10px] text-white/70 bg-white/5 p-2 rounded border border-white/10 break-all leading-relaxed max-h-[250px] overflow-y-auto custom-scrollbar">
                    {lastFinalPrompt || 'Awaiting visual directive...'}
                  </div>
                </div>
                {isGenerating && (
                  <div className="space-y-1 pt-2 border-t border-white/10">
                    <p className="text-[8px] text-white/30 uppercase tracking-widest">Latent_Space_Progress</p>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-yellow-500" 
                        initial={{ width: 0 }}
                        animate={{ width: `${generationProgress}%` }}
                        transition={MOTION_PROFILE.PREMIUM}
                      />
                    </div>
                    <p className="text-[8px] text-yellow-500/60 text-right uppercase">{Math.round(generationProgress)}% Vectorized</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
          
          <AppHeader 
            isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} setShowSettings={setShowSettings} 
            setShowHistory={setShowHistory}
            clientSideMode={clientSideMode}
          />

            <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden overflow-y-auto lg:overflow-y-hidden">
                <div className="w-full lg:flex-1 lg:h-full bg-bg-primary shrink-0 z-30 relative">
                    <div className="relative lg:absolute inset-0 overflow-hidden">
                      <Viewport 
                        isGenerating={isGenerating} resultImage={resultImage} uploadedImage={uploadedImage} selectedModel={selectedModel} modelOptions={[]}
                        isHoldingCompare={isHoldingCompare} setIsHoldingCompare={setIsHoldingCompare}
                        generationProgress={generationProgress}
                        onRefine={handleRefine}
                        onDownload={handleDownload}
                        onUndo={handleUndo} 
                        onClear={() => handleClear('canvas')}
                        onUploadClick={onUploadClick} onCameraClick={onCameraClick}
                        onColorPaletteClick={onColorPaletteClick} onFileUpload={handleFileUpload}
                      />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeTab}
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    transition={MOTION_PROFILE.PREMIUM}
                    className="w-full lg:w-[400px] xl:w-[450px] lg:h-full border-t lg:border-t-0 lg:border-l border-border-primary bg-bg-secondary/30 backdrop-blur-sm lg:overflow-y-auto custom-scrollbar z-20 pb-24 lg:pb-6"
                  >
                    <div className="p-4 md:p-6 space-y-6">
                      {activeTab === 'typography' ? (
                        <TypographyPanel 
                          userInput={userInput}
                          setUserInput={setUserInput}
                          selectedPreset={selectedPreset}
                          onSelectPreset={handleSelectPreset}
                          categories={currentCategories}
                          isGenerating={isGenerating}
                          
                          
                          
                          onGenerate={handleGenerate}
                          selectedAspectRatio={selectedAspectRatio}
                          setSelectedAspectRatio={setSelectedAspectRatio}
                          favoritePresets={favoritePresets}
                          onToggleFavorite={toggleFavorite}
                        />
                      ) : (
                        <>
                  <SynthesisControls 
                    userInput={userInput} setUserInput={setUserInput}
                    isGenerating={isGenerating} isAnalyzing={isAnalyzing} onGenerate={handleGenerate} onAnalyze={handleAnalyze} 
                    activeTab={activeTab}
                    uploadedImage={uploadedImage} selectedPreset={selectedPreset}
                    selectedLogoType={selectedLogoType} setSelectedLogoType={setSelectedLogoType}
                    selectedLogoLayout={selectedLogoLayout} setSelectedLogoLayout={setSelectedLogoLayout}
                    
                    selectedAspectRatio={selectedAspectRatio}
                    setSelectedAspectRatio={setSelectedAspectRatio}
                    showLayoutPreview={true}
                    setShowLayoutPreview={() => {}}
                    isVisualFidelity={isVisualFidelity}
                    setIsVisualFidelity={setIsVisualFidelity}
                  />

                          <PresetPanel 
                            categories={currentCategories} 
                            selectedPreset={selectedPreset} 
                            onSelectPreset={handleSelectPreset} 
                            usedPresets={usedPresets}
                            favoritePresets={favoritePresets}
                            onToggleFavorite={toggleFavorite}
                          />
                        </>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
            </div>
        </main>

        <AnimatePresence>
          {showPromptWarning && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              transition={MOTION_PROFILE.PREMIUM}
              className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-bg-primary/95 backdrop-blur-md"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={MOTION_PROFILE.PREMIUM}
                className="w-full max-w-md bg-bg-secondary border border-border-primary rounded-2xl p-6 shadow-2xl space-y-4"
              >
                <div className="flex items-center gap-3 text-amber-500">
                  <AlertCircle size={24} />
                  <h3 className="text-lg font-bold">Complex Prompt Detected</h3>
                </div>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Your prompt is very detailed ({pendingPromptLength} characters). This level of complexity may cause the generation to take longer or potentially time out.
                </p>
                <div className="flex flex-col gap-2 pt-2">
                  <button 
                    onClick={() => {
                      setShowPromptWarning(false);
                      handleGenerate(undefined, false, true); // Proceed as is
                    }}
                    className="w-full py-3 bg-accent text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Proceed Anyway
                  </button>
                  <button 
                    onClick={() => {
                      setShowPromptWarning(false);
                      handleGenerate(undefined, true);
                    }}
                    className="w-full py-3 bg-bg-tertiary text-text-primary font-bold rounded-xl hover:bg-border-primary transition-colors"
                  >
                    Simplify & Generate
                  </button>
                  <button 
                    onClick={() => setShowPromptWarning(false)}
                    className="w-full py-3 text-text-secondary font-medium hover:text-text-primary transition-colors"
                  >
                    Cancel & Edit
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* System Alert Overlay */}
        <SystemAlert 
          isOpen={!!error} 
          error={error || ""} 
          onClose={() => setError(null)} 
          onRetry={() => {
            setError(null);
            handleGenerate(undefined, true);
          }}
        />

        <Suspense fallback={null}>
          {showSettings && (
    <div className="fixed inset-0 z-[60] bg-bg-primary/80 backdrop-blur-sm flex items-start md:items-center justify-center p-4 md:p-6 overflow-y-auto custom-scrollbar">
      <div className="my-auto w-full max-w-3xl">
        <SettingsPanel 
                  onClose={() => {
                    setShowSettings(false);
                  }} 
                  addLog={addLog} 
                  geminiApiKey={geminiApiKey}
                  setGeminiApiKey={setGeminiApiKey}
                  geminiKeys={geminiKeys}
                  setGeminiKeys={setGeminiKeys}
                  activeKeyIndex={activeKeyIndex}
                  setActiveKeyIndex={setActiveKeyIndex}
                  clientSideMode={clientSideMode}
                  setClientSideMode={setClientSideMode}
                  showDevConsole={showDevConsole}
                  setShowDevConsole={setShowDevConsole}
                  logs={logs}
                  metrics={metrics}
                  selectedModel={selectedModel}
                  isGenerating={isGenerating}
                  clearLogs={clearLogs}
                />
              </div>
            </div>
          )}
          {showHistory && <HistoryPanel history={history} onClose={() => setShowHistory(false)} onRestore={(item) => {setUserInput(item.prompt); setShowHistory(false);}} onClear={clearHistory} addLog={addLog} />}
        </Suspense>

        <CameraModal isOpen={showCamera} onClose={() => setShowCamera(false)} onCapture={(data) => {setUploadedImage(data); setUploadedMimeType('image/jpeg'); addLog('Visual captured via camera.', 'success');}} />
        
        <ColorPalettePanel 
          isOpen={showColorPalette} 
          onClose={() => setShowColorPalette(false)} 
          selectedPalette={selectedPalette} 
          onSelectPalette={setSelectedPalette} 
          activeImageSrc={Array.isArray(resultImage) ? resultImage[0] : (resultImage || uploadedImage)}
        />
      </div>
      </ErrorBoundary>
    </PullToRefresh>
  );
}
