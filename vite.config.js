import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    host: "127.0.0.1", // force IPv4 so browser can connect (avoids ::1 issues on Windows)
    port: 5173,
    strictPort: true,
  },
  // If you deploy under a sub-path, set: base: "/your-subpath/"
});
