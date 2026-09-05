import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  return {
    plugins: [react(), tailwindcss()],
    define: {
      "import.meta.env.VITE_API_URL": JSON.stringify(env.VITE_API_URL || ""),
      "process.env.VITE_API_URL": JSON.stringify(env.VITE_API_URL || ""),
      "process.env.GEMINI_API_KEY": JSON.stringify(process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || ""),
      "process.env.API_KEY": JSON.stringify(process.env.API_KEY || env.API_KEY || "")
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, ".")
      }
    },
    server: {
      host: "0.0.0.0",
      port: 3000,
      proxy: env.VITE_DEV_PROXY_TARGET
        ? {
            "/api": {
              target: env.VITE_DEV_PROXY_TARGET,
              changeOrigin: true,
              secure: false
            }
          }
        : undefined
    },
    preview: {
      port: 3000,
      host: "0.0.0.0",
      allowedHosts: true
    },
    build: {
      minify: "esbuild",
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom"],
            vendor: ["lucide-react", "motion"]
          }
        }
      }
    }
  };
});
