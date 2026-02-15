import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const base = process.env.GITHUB_PAGES
  ? "/fantasy-auto-battle/"
  : "/";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base,
});
