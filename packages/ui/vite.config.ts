import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "AgentvisUI",
      fileName: (format) => `agentvis-ui.${format}.js`,
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "@xyflow/react",
        "@dagrejs/dagre",
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "jsxRuntime",
          "@xyflow/react": "ReactFlow",
          "@dagrejs/dagre": "Dagre",
        },
      },
    },
    sourcemap: true,
    minify: "esbuild",
    target: "es2020",
  },
});
