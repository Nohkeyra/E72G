import { useAppStore } from '../store/useAppStore';
import { resizeImage } from '../services/imageUtils';

export function useAssets(fileInputRef: React.RefObject<HTMLInputElement | null>) {
  const {
    setUploadedImage,
    setUploadedMimeType,
    setError,
    setGenerationCount,
    setShowCamera,
    setShowColorPalette,
    addLog
  } = useAppStore();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const resized = await resizeImage(reader.result as string, 1024);
          setUploadedImage(resized);
          setUploadedMimeType('image/jpeg');
          addLog('Image uploaded and optimized to 1024px, visual DNA active.', 'success');
        } catch {
          setUploadedImage(reader.result as string);
          setUploadedMimeType(file.type);
          addLog('Image uploaded in raw format, ready for analysis.', 'success');
        }
        setError(null);
        setGenerationCount(0);
      };
      reader.readAsDataURL(file);
    }
  };

  const onUploadClick = () => {
    fileInputRef.current?.click();
  };

  const onCameraClick = () => {
    setShowCamera(true);
  };

  const onColorPaletteClick = () => {
    setShowColorPalette(true);
  };

  return {
    handleFileUpload,
    onUploadClick,
    onCameraClick,
    onColorPaletteClick,
  };
}
