import { localIconPlugin } from "./scripts/local-icon-plugin";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
// Derive the Pages base path from the current repository slug, including after a rename.
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] || "FoundPhone-Studio";
export default defineConfig(({ command }) => ({
  base: command === "build" ? `/${repositoryName}/` : "./",
  optimizeDeps: { entries: ["index.html"] },
  plugins: [
    localIconPlugin(command),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "捡手机",
        short_name: "捡手机",
        display: "standalone",
        background_color: "#000000",
        theme_color: "#000000",
        icons: [{ src: "icon.svg", sizes: "any", type: "image/svg+xml" }],
      },
      workbox: {
        clientsClaim: true,
        globPatterns: ["**/*.{js,css,html,svg,json,txt,png,jpg}"],
        maximumFileSizeToCacheInBytes: 8000000,
      },
    }),
  ],
}));
