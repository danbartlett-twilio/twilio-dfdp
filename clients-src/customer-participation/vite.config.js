import { fileURLToPath, URL } from 'url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/


export default defineConfig(
  {
  plugins: [vue()],
  base: "/clients/customer-participation/",
  build: {    
    outDir: "../../assets/clients/customer-participation/",
    
  },  
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})