import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const here = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@bao/shared": resolve(here, "../../packages/shared/src/index.ts"),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 3821,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3820",
        changeOrigin: true,
      },
      "/ws": {
        target: "ws://127.0.0.1:3820",
        ws: true,
      },
    },
  },
});
