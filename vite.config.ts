import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
// `base` defaults to "/" (root deploy on Vercel / DigitalOcean). The
// `build:demo` script overrides it with --base=/demo/learning-platform/ so the
// app can be served from the Adminium demo sub-path.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        /*
         * Two vendor chunks. React barely changes between releases and the
         * icon set is the single biggest dependency, so splitting them keeps
         * the app chunk under the 500 kB warning threshold and lets a browser
         * reuse both across deploys.
         */
        manualChunks: {
          react: ["react", "react-dom", "react-dom/client"],
          icons: ["lucide-react"],
        },
      },
    },
  },
});
