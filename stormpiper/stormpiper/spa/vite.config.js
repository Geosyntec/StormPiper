import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import nodePolyfills from "rollup-plugin-polyfill-node";
import analyze from 'rollup-plugin-analyzer'

export default defineConfig({
  plugins: [react()],
  root: "src",
  build: {
    outDir: "../build",
    emptyOutDir: true,
    rollupOptions: {
      plugins: [
        // Enable rollup polyfills plugin
        // used during production bundling
        nodePolyfills({ include: null }),
        analyze({limit:20})
      ],
    },
  },
  // resolve: {
  //   alias: {
  //     "./runtimeConfig": "./runtimeConfig.browser",
  //   },
  // },
});
