import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/asystent-wop/', // Wpisz tutaj DOKŁADNĄ nazwę swojego repozytorium na GitHub
})
