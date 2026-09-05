export function isPreviewEnvironment(): boolean {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    // AI Studio preview or local dev
    return origin.includes('.run.app') || origin.includes('localhost:3000');
  }
  return false;
}

function trimTrailingSlash(v: string) {
  return v.replace(/\/+$/, "");
}

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    // If running in the AI Studio preview or local dev where frontend and backend are served together,
    // always use relative paths to prevent stale URL issues.
    if (origin.includes('.run.app') || origin.includes('localhost:3000')) {
      return "";
    }
  }

  // Check localStorage for user-configured backend URL first (useful for APKs)
  if (typeof window !== 'undefined') {
    try {
      const publicUrl = localStorage.getItem("publicBackendUrl");
      if (publicUrl && publicUrl.trim() !== "") {
        return trimTrailingSlash(publicUrl.trim());
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  // Use import.meta.env.VITE_API_URL if available
  const configured = import.meta.env.VITE_API_URL?.trim();
  if (configured) {
    return trimTrailingSlash(configured);
  }

  // Fallback to relative path if in browser and no config found
  if (typeof window !== 'undefined') {
    
    return "";
  }

  return "";
}

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  const base = getApiBaseUrl();
  return base ? `${base}${p}` : p;
}
