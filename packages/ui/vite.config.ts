import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  const isLibBuild = process.env.BUILD_TARGET === "lib";

  return {
    plugins: [react()],
    build: isLibBuild
      ? {
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
            ],
            output: {
              globals: {
                react: "React",
                "react-dom": "ReactDOM",
                "react/jsx-runtime": "jsxRuntime",
                "@xyflow/react": "ReactFlow",
              },
            },
          },
          sourcemap: true,
          minify: "esbuild",
          target: "es2020",
        }
      : {
          sourcemap: true,
          minify: "esbuild",
          target: "es2020",
        },
  };
});

