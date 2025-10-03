import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/pages": path.resolve(__dirname, "./src/pages"),
      "@/assets": path.resolve(__dirname, "./src/assets"),
      "@/utils": path.resolve(__dirname, "./src/utils"),
    },
  },
  server: {
    historyApiFallback: true, // Important for React Router
  },
});
