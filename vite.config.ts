import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  clearScreen: false,
  // tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
  // Env variables starting with the item of `envPrefix` will be exposed in tauri's source code through `import.meta.env`.
  envPrefix: ["VITE_", "TAURI_ENV_*"],
  build: {
    // Tauri uses Chromium on Windows and WebKit on macOS and Linux
    target: process.env.TAURI_ENV_PLATFORM == "windows" ? "chrome105" : "safari13",
    // terser provides deeper dead-code elimination than esbuild
    minify: !process.env.TAURI_ENV_DEBUG ? "terser" : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
    terserOptions: {
      compress: {
        // strip dev debug logs from release builds; console.error/warn are
        // real error handling and are left in place
        pure_funcs: ["console.log", "console.info", "console.debug"],
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // No manualChunks: a prior grouping (mermaid/tiptap/lowlight/i18n
        // into fixed chunks) produced a `ReferenceError: Cannot access
        // uninitialized variable` at module-eval time in built bundles
        // (both debug and release `tauri build`, never in `tauri dev` since
        // the dev server doesn't bundle) — a classic manualChunks
        // circular/init-order TDZ bug, most likely from splitting
        // `react-i18next` away from the `react` chunk it depends on at
        // eval time. Letting rollup auto-split by the import graph
        // guarantees correct init order at the cost of slightly less
        // predictable chunk names, which doesn't matter for a desktop app
        // serving local assets.
      },
    },
  },
  optimizeDeps: {
    exclude: ["@tauri-apps/api", "@tauri-apps/plugin-fs", "@tauri-apps/plugin-dialog"],
  },
}));
