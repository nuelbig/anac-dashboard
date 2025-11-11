import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // server: {
  //   allowedHosts: ['barnacle-inspired-gnat.ngrok-free.app'],
  // },

  // Configuration pour déploiement dans Spring Boot
  //base: "./", // ou base: '/nom-de-votre-war/' si problème
  base: "/dasboard/",

  build: {
    // Dossier de sortie (par défaut 'dist')
    outDir: "dist",

    // Optimisations
    rollupOptions: {
      output: {
        // Organisation des fichiers de sortie
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: ({ name }) => {
          if (/\.(gif|jpe?g|png|svg)$/.test(name ?? "")) {
            return "assets/images/[name]-[hash][extname]";
          }
          if (/\.css$/.test(name ?? "")) {
            return "assets/css/[name]-[hash][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },

  // Configuration pour le serveur de développement
  server: {
    port: 3000,
    proxy: {
      // Proxy des appels API vers Spring Boot en développement
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
