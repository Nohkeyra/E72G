import { useRef, useCallback } from 'react';
import { useAppStore, Tab } from '../store/useAppStore';
import { getModule } from '../modules';
import { GenerationContext } from '../types/generation';
import { AspectRatio } from '../types/presets';
import { validateModelCall } from '../services/modelValidator';
import { generateImage } from '../services/imageService';
import { analyzeVectorSubject, analyzeVectorSubjectCloudflare } from '../services/geminiService';
import { VectorAnalysisCache, fingerprintImage, groundVectorSubject } from '../services/vectorGrounding';
import { incrementGeminiQuota, checkQuota } from '../services/quotaUtils';
import { formatForGeminiAttention, parsePromptWeights } from '../utils/promptUtils';
import { ARTISTIC_MODIFIERS, GLOBAL_NEGATIVE_PROMPT } from '../lib/constants';
import { playGenerateSound, playSuccessSound } from '../utils/soundUtils';

export function useSynthesis() {
  const {
    activeTab,
    userInput,
    selectedPreset,
    uploadedImage,
    uploadedMimeType,
    selectedPalette,
    selectedModel,
    vectorAnalysisMode,
    selectedAspectRatio,
    selectedLogoType,
    selectedLogoLayout,
    isVisualFidelity,
    isGenerating,
    setIsGenerating,
    isGeneratingRef,
    setGenerationProgress,
    setResultImage,
    setError,
    setLastFinalPrompt,
    isSimplifiedMode,
    setIsSimplifiedMode,
    setPendingPromptLength,
    setShowPromptWarning,
    generationCount,
    setGenerationCount,
    setMetrics,
    addUsedPreset,
    addLog,
    addToHistory,
    getActiveGeminiKey,
    showDebug
  } = useAppStore();

  const abortControllerRef = useRef<AbortController | null>(null);
  const lastGenerateStartTime = useRef<number>(0);
  const cachedAIGenState = useRef({
    imageHash: null as string | null,
    presetName: '',
    activeTab: '' as Tab,
    userInput: ''
  });
  const vectorAnalysisCacheRef = useRef(new VectorAnalysisCache());

  const addDebugLog = useCallback((msg: string) => {
    if (showDebug) addLog(`[DEBUG] ${msg}`, 'info');
  }, [showDebug, addLog]);

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort('Stopped by user');
      addLog('Process stopped by user.', 'info');
      addDebugLog('handleStop: aborting process');
    }
    setIsGenerating(false);
    isGeneratingRef.current = false;
  }, [addLog, addDebugLog, setIsGenerating, isGeneratingRef]);

  const handleGenerate = useCallback(async function generate(
    promptOverride?: string,
    forceSimplified?: boolean,
    bypassWarning?: boolean,
    retryCount = 0
  ) {
    if (isGeneratingRef.current) {
      // Prevent accidental double-click cancellations or rapid re-runs (1.5s safety window)
      if (Date.now() - lastGenerateStartTime.current < 1500) {
        addDebugLog('handleGenerate blocked by safety window');
        return;
      }

      handleStop();
      return;
    }

    // Immediately claim generation lock synchronously to prevent concurrent double-runs
    isGeneratingRef.current = true;
    lastGenerateStartTime.current = Date.now();

    const simplified = forceSimplified || isSimplifiedMode;
    if (simplified) {
      setIsSimplifiedMode(true);
    }

    playGenerateSound();
    setIsGenerating(true);
    setGenerationProgress(0);
    setError(null);
    setResultImage(null);
    const startTime = Date.now();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // VORTEX: Delta-Only synthesis detection
    const currentImageHash = uploadedImage ? fingerprintImage(uploadedImage) : null;
    const prompt = promptOverride || userInput || (activeTab === 'vectorize' ? 'vectorize this image' : 'Custom Lettering');
    const isFastTrack = 
      cachedAIGenState.current.imageHash === currentImageHash &&
      cachedAIGenState.current.presetName === (selectedPreset?.name || '') &&
      cachedAIGenState.current.activeTab === activeTab &&
      cachedAIGenState.current.userInput !== userInput && // User input text MUST have changed
      userInput.trim().length > 0;

    if (isFastTrack) {
      addLog('[VORTEX] Delta-Match detected. Fast-tracking synthesis...', 'info');
    }

    // Progress Simulation
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 99.5) {
          // Heartbeat indicator after 99%
          const elapsed = (Date.now() - startTime) / 1000;
          if (elapsed > 30 && Math.floor(elapsed) % 10 === 0) {
            addLog(`[HEARTBEAT] Synthesis is still active. Latent nodes are processing... (${Math.round(elapsed)}s)`, 'info');
          }
          return prev;
        }
        // Exponential decay towards 100
        const remaining = 100 - prev;
        const speed = prev < 50 ? 0.05 : prev < 80 ? 0.02 : prev < 95 ? 0.005 : 0.001;
        return Math.min(99.6, prev + remaining * speed);
      });
    }, 150);

    // Check quota for Gemini standard engine
    validateModelCall(selectedModel, !!getActiveGeminiKey());

    const presetToUse = selectedPreset || {
      name: 'Default Vector',
      basePrompt: 'high quality vector art, clean lines, professional graphic design',
      aspectRatio: '1:1'
    };
    const materialModifiers = ['specular', 'reflectance', 'roughness', 'material', 'surface', 'light', 'texture'];
    const lowerPrompt = prompt.toLowerCase();
    const modifierCount = materialModifiers.filter(m => lowerPrompt.includes(m.toLowerCase())).length;
    const timeoutDuration = modifierCount > 3 ? 90000 : 60000;
    
    let isGlobalTimeout = false;
    const globalTimeoutId = setTimeout(() => {
      if (abortControllerRef.current === controller) {
        isGlobalTimeout = true;
        controller.abort(`Synthesis Timeout (${timeoutDuration / 1000}s)`);
      }
    }, timeoutDuration);

    const isCloudflareProvider = selectedModel === 'cf-flux';
    const hasGenRef = Boolean(uploadedImage || selectedPreset?.referenceImagePath || selectedPreset?.sourceImagePath);
    const engineLabel = isCloudflareProvider
      ? (hasGenRef ? 'Cloudflare FLUX.2 [klein] 4B' : 'Cloudflare FLUX.1 [schnell]')
      : 'Google Gemini';

    addLog('Starting visual synthesis...', 'process');
    addLog('Compiling prompt and style DNA...', 'info');

    const currentModule = getModule(activeTab);
    const currentKey = getActiveGeminiKey();

    // Vectorize + uploaded image: the subject analysis is bound to this exact image (content hash) and verified
    // against it before generation. A rejected analysis stops the run; it is never used as if it were correct.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let vectorAnalysisData: any = null;
    if (activeTab === 'vectorize' && uploadedImage && vectorAnalysisMode === 'off') {
      addLog('Subject analysis is off. Using the reference image only.', 'info');
    }
    if (activeTab === 'vectorize' && uploadedImage && vectorAnalysisMode !== 'off') {
      addLog(vectorAnalysisMode === 'cloudflare' ? 'Analyzing reference image with Cloudflare Llama 3.2 Vision...' : 'Analyzing reference image with Gemini 3.8 Flash...', 'process');
      let grounding;
      try {
        grounding = await groundVectorSubject({
          imageDataUrl: uploadedImage,
          mimeType: uploadedMimeType || 'image/png',
          cache: vectorAnalysisCacheRef.current,
          analyze: (img, mime) =>
            vectorAnalysisMode === 'cloudflare'
              ? analyzeVectorSubjectCloudflare(img, mime, controller.signal)
              : analyzeVectorSubject(img, mime, currentKey, controller.signal)
        });
      } catch (groundErr) {
        clearInterval(progressInterval);
        clearTimeout(globalTimeoutId);
        setIsGenerating(false);
        isGeneratingRef.current = false;
        if (controller.signal.aborted) return;
        const m = groundErr instanceof Error ? groundErr.message : String(groundErr);
        setError(`Subject grounding failed: ${m}`);
        addLog(`Subject grounding failed: ${m}`, 'error');
        return;
      }

      if (grounding.status === 'rejected') {
        clearInterval(progressInterval);
        clearTimeout(globalTimeoutId);
        setIsGenerating(false);
        isGeneratingRef.current = false;
        setError(`Could not verify the subject of your image, so nothing was generated. ${grounding.reason} Please retry.`);
        addLog(`Subject grounding rejected: ${grounding.reason}`, 'error');
        return;
      }

      if (grounding.status === 'grounded') {
        vectorAnalysisData = grounding.analysis;
        addLog(
          grounding.fromCache
            ? `[VORTEX] Using verified subject analysis for "${grounding.analysis.subjectName}".`
            : `Subject verified: ${grounding.analysis.subjectName}`,
          grounding.fromCache ? 'info' : 'success'
        );
      } else {
        // No analysis available (e.g. no Gemini key / network). Only the reference image itself grounds the run.
        addLog(`Subject analysis unavailable (${grounding.reason}). Proceeding with the reference image only.`, 'info');
      }
    }

    const generationContext: GenerationContext = {
      prompt,
      preset: { ...presetToUse, aspectRatio: selectedAspectRatio as AspectRatio },
      base64Image: uploadedImage || undefined,
      mimeType: uploadedMimeType || undefined,
      strictMode: generationCount >= 2,
      selectedPalette,
      selectedModel: selectedModel,
      isFastTrack,
      isSimplifiedMode: simplified,
      vectorAnalysis: vectorAnalysisData,
      // Tab-specific fields
      ...(activeTab === 'logo design' ? {
        logoType: selectedLogoType,
        logoLayout: selectedLogoLayout
      } : {}),
      ...(activeTab === 'vectorize' ? {
        isVisualFidelity
      } : {})
    };

    try {
      let finalPrompt = currentModule.constructPrompt(generationContext);
      setLastFinalPrompt(finalPrompt);

      addDebugLog('handleGenerate: starting generation');
      addLog(`Synthesizing visual asset with ${engineLabel} engine...`, 'info');
      
      const modelInfo = validateModelCall(selectedModel, !!currentKey);
      
      checkQuota(!!currentKey);
      
      // Apply attention mechanisms based on the selected model
      finalPrompt = formatForGeminiAttention(finalPrompt);

      if (!simplified && finalPrompt.length > 2000 && !promptOverride && !bypassWarning) {
        setPendingPromptLength(finalPrompt.length);
        setShowPromptWarning(true);
        setIsGenerating(false);
        isGeneratingRef.current = false;
        clearInterval(progressInterval);
        return;
      }

      let finalNegativePrompt = (currentModule.constructNegativePrompt 
        ? currentModule.constructNegativePrompt(generationContext)
        : presetToUse.negativePrompt) || '';
      
      // Add global negative prompt if not already present
      const isV2Synthesis = activeTab === 'logo design' && !!presetToUse.v2SynthesisActive;
      
      if (isV2Synthesis) {
        addLog(`V2 Synthesis Active: ${activeTab} mode identified.`, 'process');
      }

      // Ensure finalNegativePrompt is a string before calling .includes()
      const finalNegativePromptStr = finalNegativePrompt || '';
      
      // Always append global negative prompt to catch text artifacts and quality issues
      finalNegativePrompt = `${finalNegativePromptStr}, ${GLOBAL_NEGATIVE_PROMPT}`;
      
      // Clean Pipe Check: V2 synthesis skips ARTISTIC_MODIFIERS for pure synthesis
      const isCleanPipe = isV2Synthesis || activeTab === 'typography' || activeTab === 'vectorize';
      let promptToUse = isCleanPipe 
        ? parsePromptWeights(`${finalPrompt}`).cleaned
        : parsePromptWeights(`${finalPrompt}. ${ARTISTIC_MODIFIERS}`).cleaned;

      if (activeTab === 'typography' && (presetToUse.referenceImagePath || presetToUse.previewImagePath)) {
         promptToUse += "\n\nUse the attached reference image as the primary visual style guide. Preserve its typography structure, composition logic, texture, contrast, color behavior, and overall design language. Generate a new original image using the user's requested text/content, but keep the visual style aligned with the reference.";
      }

      const res = await generateImage({
        provider: modelInfo.provider,
        prompt: promptToUse,
        modelId: selectedModel,
        presetBasePrompt: presetToUse.basePrompt || '',
        presetNegativePrompt: finalNegativePrompt,
        base64Image: uploadedImage || undefined,
        mimeType: uploadedMimeType || undefined,
        preset: { ...presetToUse, aspectRatio: selectedAspectRatio as AspectRatio },
        activeTab,
        strictMode: generationCount >= 2,
        apiKeyOverride: getActiveGeminiKey(),
        userText: userInput,
        presetName: presetToUse.name
      }, controller.signal);
      addDebugLog('handleGenerate: generateImage returned');

      if (controller.signal.aborted) {
        addDebugLog('handleGenerate: signal aborted after return');
        throw new Error('Generation cancelled by user');
      }

      if (res?.image) {
        addDebugLog('handleGenerate: result processed');
      }

      // Increment quota if it's a Standard Gemini model
      const isStandardGeminiResult = modelInfo.provider === 'google_gemini' && !modelInfo.requiresApiKey;
      
      if (isStandardGeminiResult) {
        incrementGeminiQuota();
      }

      addToHistory(res.image, prompt, presetToUse.name);
      
      if (res) {
        setResultImage(res.image);
      }
      
      // Cache the state for next time
      cachedAIGenState.current = {
        imageHash: uploadedImage ? fingerprintImage(uploadedImage) : null,
        presetName: selectedPreset?.name || '',
        userInput: userInput,
        activeTab: activeTab
      };
      
      if (selectedPreset) addUsedPreset(selectedPreset.name);
      if (uploadedImage) setGenerationCount(prev => prev + 1);
      
      const endTime = Date.now();
      const metricModel = res?.modelUsed || (isCloudflareProvider ? 'Cloudflare FLUX' : 'Google Gemini');
      setMetrics(prev => [...prev, { 
        timestamp: endTime, 
        latency: endTime - startTime, 
        success: true, 
        model: metricModel 
      }]);

      addLog('[PROCESS END] Synthesis complete.', 'success');
      playSuccessSound();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      const isAbort = (err as { name?: string }).name === 'AbortError' || 
                      errorMsg === 'Aborted' || 
                      errorMsg === 'The user aborted a request.' || 
                      errorMsg === 'Generation cancelled by user' ||
                      errorMsg.toLowerCase().includes('cancel');
      
      if (isAbort) {
        const errObj = err as Error;
        addDebugLog(`handleGenerate: abort detected. wasUser=${controller.signal.aborted}, isGlobalTimeout=${isGlobalTimeout}, errorName=${errObj.name || ''}, errorMsg=${errorMsg}`);
        if (isGlobalTimeout) {
          addLog('VORTEX: Synthesis Timeout (120s). The model is hanging or busy.', 'error', undefined, '504');
          setError('Generation timed out at 120s. Please retry with a simpler prompt.');
        } else if (controller.signal.aborted) {
          addLog('Synthesis cancelled by user.', 'info', undefined, 'ABORT');
        } else {
          // This is a system abort (e.g. browser timeout or network interruption)
          addLog(`Synthesis failed: The connection was interrupted or timed out. (${errorMsg || errObj.name || ''})`, 'error', undefined, 'ERR');
        }
        return;
      }

      // Handle 429 Rate Limits / Quota:
      const isRateLimit = errorMsg.includes('429') || 
                          errorMsg.includes('RESOURCE_EXHAUSTED') || 
                          errorMsg.includes('Quota') ||
                          errorMsg.includes('Rate limit');

      const isDailyQuota = errorMsg.toLowerCase().includes('daily') || errorMsg.toLowerCase().includes('quota exceeded') || errorMsg.toLowerCase().includes('billing');

      if (isRateLimit) {
        if (!isDailyQuota && retryCount < 1) {
          addLog('Rate limit encountered (RPM). Waiting 5 seconds for cooldown before retrying...', 'process', undefined, '429');
          setError('Google Gemini API rate limit cooldown in progress (retrying in 5s)...');
          setIsGenerating(false);
          isGeneratingRef.current = false;
          setTimeout(() => {
            generate(promptOverride, forceSimplified, bypassWarning, retryCount + 1);
          }, 5000);
          return;
        } else {
          const friendlyRateLimitMsg = isDailyQuota
            ? 'Google Gemini API daily free quota reached (HTTP 429). The shared API key has exceeded Google\'s free daily quota. Please add your personal Gemini API key in Settings (⚙) or switch to Cloudflare Workers AI (Zero-Cost Tier) for reliable image generation.'
            : 'Google Gemini API rate limit reached (HTTP 429). Please wait a moment or switch to Cloudflare Workers AI in Settings.';
          addLog(friendlyRateLimitMsg, 'error', undefined, '429');
          setError(friendlyRateLimitMsg);
          setIsGenerating(false);
          return;
        }
      }

      if (errorMsg.includes('API key not valid') || errorMsg.includes('invalid') || errorMsg.includes('401') || errorMsg.includes('unauthorized') || errorMsg.includes('authentication failed')) {
        const authMsg = errorMsg || 'Invalid Gemini API key. Please check your key in Settings.';
        addLog(authMsg, 'error', undefined, '401');
        setError(authMsg);
        setIsGenerating(false);
        return;
      }

      if (errorMsg.includes('blockedByFreeOnlyMode')) {
        setError("This model requires billing and is blocked in Free-Only Mode.");
        setIsGenerating(false);
        return;
      }

      if (errorMsg.includes('DAILY_LIMIT_REACHED')) {
        setError('Daily request limit of 500 reached.');
        setIsGenerating(false);
        return;
      }

      const isTimeout = errorMsg.toLowerCase().includes('timed out') || errorMsg.toLowerCase().includes('timeout');
      if (isTimeout) {
        addLog(`Synthesis timed out: ${errorMsg}`, 'error');
        return;
      }

      interface DebugError extends Error {
        debugObj?: {
          httpStatus: number | string;
          actualRuntimeModelId: string;
          authSource: string;
          rawErrorBody: string;
        }
      }
      
      const debugErr = err as DebugError;
      if (debugErr.debugObj) {
        const debug = debugErr.debugObj;
        addLog(`[GEMINI DEBUG] Status: ${debug.httpStatus} | Model: ${debug.actualRuntimeModelId} | Auth: ${debug.authSource}`, 'error');
        addLog(`[GEMINI DEBUG] Error: ${debug.rawErrorBody}`, 'error');
        
        if (debug.httpStatus === 403) {
          setResultImage(null);
          addLog('Gemini image model access denied for current API key/project.', 'error', undefined, '403');
          return;
        }
      }
      
      if (showDebug) console.error('Synthesis error details:', err);
      addDebugLog(`Synthesis error: ${errorMsg}`);
      
      const endTime = Date.now();
      setMetrics(prev => [...prev, { 
        timestamp: endTime, 
        latency: endTime - startTime, 
        success: false, 
        model: isCloudflareProvider ? 'Cloudflare FLUX' : 'Google Gemini' 
      }]);

      setError(errorMsg);
      setIsSimplifiedMode(false);

      if (errorMsg.includes('[GENERATION_BLOCKED]')) {
        addLog(`Generation Blocked: ${errorMsg.replace('[GENERATION_BLOCKED] ', '')}`, 'error', undefined, '403');
      } else if (errorMsg.includes('Failed to fetch') || errorMsg.includes('Network error') || errorMsg.includes('backend api error')) {
        addLog('Synthesis failed: Network/Backend connection issue. Please check your internet connection.', 'error', undefined, 'ERR');
      } else if (errorMsg.includes('404')) {
        addLog(`Synthesis failed: Model not found (404). ${errorMsg}`, 'error', undefined, '404');
      } else {
        addLog(`Synthesis failed: ${errorMsg}`, 'error', undefined, '500');
      }
    } finally {
      clearInterval(progressInterval);
      setGenerationProgress(100);
      addDebugLog('handleGenerate: finally block');
      clearTimeout(globalTimeoutId);
      setIsGenerating(false);
      isGeneratingRef.current = false;
      abortControllerRef.current = null;
      setIsSimplifiedMode(false);
    }
  }, [
    vectorAnalysisMode,
    isGeneratingRef,
    isSimplifiedMode,
    setIsSimplifiedMode,
    setIsGenerating,
    setGenerationProgress,
    setError,
    setResultImage,
    uploadedImage,
    uploadedMimeType,
    userInput,
    activeTab,
    selectedPreset,
    addLog,
    selectedModel,
    getActiveGeminiKey,
    selectedAspectRatio,
    selectedPalette,
    selectedLogoType,
    selectedLogoLayout,
    isVisualFidelity,
    setLastFinalPrompt,
    setShowPromptWarning,
    setPendingPromptLength,
    generationCount,
    setGenerationCount,
    addToHistory,
    setMetrics,
    addUsedPreset,
    addDebugLog,
    handleStop,
    showDebug
  ]);

  return {
    handleGenerate,
    handleStop,
    isGenerating
  };
}
