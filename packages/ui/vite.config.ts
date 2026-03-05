import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Simple Vite React app config – no library build
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
    minify: "esbuild",
    target: "es2020",
  },
});