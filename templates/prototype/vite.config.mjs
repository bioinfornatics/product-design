import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { gooseAnnotatePlugin } from "./vite-annotate-plugin.mjs";

export default defineConfig({
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react(), gooseAnnotatePlugin()],
});
