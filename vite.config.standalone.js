import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    {
      name: "standalone-relative-assets",
      transformIndexHtml(html) {
        return html
          .replace(/src="\/assets\//g, 'src="assets/')
          .replace(/href="\/assets\//g, 'href="assets/');
      },
    },
  ],
  base: "./",
  build: {
    outDir: "standalone",
    emptyOutDir: true,
    minify: false,
    rollupOptions: {
      output: {
        entryFileNames: "app.js",
        chunkFileNames: "app.js",
        assetFileNames: (assetInfo) => {
          return assetInfo.name && assetInfo.name.endsWith(".css") ? "style.css" : "assets/[name][extname]";
        },
      },
    },
  },
});
