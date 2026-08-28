import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'painel_atendente_provider',
      filename: 'remoteEntry.js',
      exposes: {
        './PainelAtendente': './src/components/PainelAtendente.jsx',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  build: {
    target: 'esnext',
    minify: true,
    cssCodeSplit: false,
  },
})
