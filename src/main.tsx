import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";

// Register Service Worker in production when not embedded in a cross-origin iframe
if ("serviceWorker" in navigator) {
  const isEmbeddedIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  const isProduction = process.env.NODE_ENV === "production" || window.location.protocol === "https:";

  // Avoid registering SW inside third-party iframes where service workers are disallowed or redirected
  if (!isEmbeddedIframe && isProduction) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          console.log("Service Worker registered successfully:", reg.scope);
        })
        .catch((err) => {
          // Gracefully log without breaking the app
          console.warn("Service Worker registration notice:", err?.message || err);
        });
    });
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

