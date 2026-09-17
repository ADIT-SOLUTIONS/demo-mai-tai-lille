import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // La scène 3D du cocktail (Three.js, ~590 Ko minifiés) est un morceau séparé chargé à la demande
    chunkSizeWarningLimit: 650,
  },
})
