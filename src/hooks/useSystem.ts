import { useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';

export function useSystem() {
  const {
    addLog,
    setShowSettings,
    resultImage,
    setResultImage,
    userInput,
    setUserInput,
    selectedPreset,
    activeTab,
    history,
    clearHistory,
    clearLogs,
    setUploadedImage
  } = useAppStore();

  const handleRateLimit = useCallback(() => {
    addLog('Rate limit reached. Please wait a moment or check your API key in Settings.', 'error');
    setShowSettings(true);
    return false;
  }, [addLog, setShowSettings]);

  const handleAppRefresh = async () => {
    addLog('System Refresh Initiated...', 'process');
    await new Promise(resolve => setTimeout(resolve, 800));
    window.location.reload();
  };

  const handleClear = (type: 'history' | 'logs' | 'canvas') => {
    if (type === 'history') {
      clearHistory();
    } else if (type === 'logs') {
      clearLogs();
    } else if (type === 'canvas') {
      setUploadedImage(null);
      setResultImage(null);
      addLog('Canvas cleared.', 'info');
    }
  };

  const handleDownload = () => {
    if (!resultImage) {
      addLog('No result image available for download.', 'error');
      return;
    }
    const promptText = userInput.substring(0, 30).replace(/[^a-z0-9]/gi, '_');
    const presetName = selectedPreset?.name.replace(/[^a-z0-9]/gi, '_') || 'default';
    
    if (Array.isArray(resultImage)) {
      resultImage.forEach((img, i) => {
        const link = document.createElement('a');
        link.href = img;
        link.download = `${activeTab}_${presetName}_${promptText}_var${i + 1}_${Date.now()}.png`;
        link.click();
      });
      addLog('Downloading all variations...', 'info');
    } else {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = `${activeTab}_${presetName}_${promptText}_${Date.now()}.png`;
      link.click();
    }
  };

  const handleUndo = () => {
    if (history.length > 1) {
      setResultImage(history[1].image);
      setUserInput(history[1].prompt);
      addLog('Reverted to previous synthesis.', 'info');
    } else {
      setResultImage(null);
      setUserInput('');
      addLog('Canvas cleared.', 'info');
    }
  };

  return {
    handleRateLimit,
    handleAppRefresh,
    handleClear,
    handleDownload,
    handleUndo
  };
}
