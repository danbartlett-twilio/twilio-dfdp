import { fileURLToPath, URL } from 'url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(
  {
  plugins: [vue()],
  base: "/clients/flex-agent/",
  build: {    
    outDir: "../../assets/clients/flex-agent/",
    
  },  
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
