import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import nodePolyfills from "rollup-plugin-polyfill-node";

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
      ],
    },
  },
  // resolve: {
  //   alias: {
  //     "./runtimeConfig": "./runtimeConfig.browser",
  //   },
  // },
});
