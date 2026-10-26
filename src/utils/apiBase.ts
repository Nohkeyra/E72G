import { safeLocalStorage } from "./storageUtils";

export function isPreviewEnvironment(): boolean {
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    // AI Studio preview or local dev
    return origin.includes(".run.app") || origin.includes("localhost:3000");
  }
  return false;
}

function trimTrailingSlash(v: string): string {
  return v.replace(/\/+$/, "");
}

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    // If running in the AI Studio preview or local dev where frontend and backend are served together,
    // always use relative paths to prevent stale URL issues.
    if (origin.includes(".run.app") || origin.includes("localhost:3000")) {
      return "";
    }
  }

  // Check localStorage for user-configured backend URL first (essential for Capacitor APK)
  if (typeof window !== "undefined") {
    try {
      const publicUrl = safeLocalStorage.getItem("publicBackendUrl");
      if (publicUrl && publicUrl.trim() !== "") {
        return trimTrailingSlash(publicUrl.trim());
      }
    } catch {
      // Ignore localStorage read errors
    }
  }

  // Use import.meta.env?.VITE_API_URL if configured during build/packaging
  const metaEnv = (import.meta as unknown as { env?: Record<string, string> })?.env;
  const configured = metaEnv?.VITE_API_URL?.trim();
  if (configured) {
    return trimTrailingSlash(configured);
  }

  return "";
}

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  const base = getApiBaseUrl();
  return base ? `${base}${p}` : p;
}

/**
 * Creates headers for backend API requests, attaching the personal Gemini API key
 * via header instead of URL query parameters or client-side storage injection.
 */
export function getApiHeaders(personalKey?: string, additionalHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...additionalHeaders
  };

  const trimmedKey = personalKey ? personalKey.trim() : "";
  if (trimmedKey) {
    headers["x-gemini-api-key"] = trimmedKey;
  }

  return headers;
}
