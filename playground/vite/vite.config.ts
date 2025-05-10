import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), UnoCSS()],
  define: {
    // enable hydration mismatch details in production build
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true',
    __VUE_PROD_DEVTOOLS__: 'false',
    __VUE_OPTIONS_API__: 'true',
  },
  resolve: {
    alias: {
      '@vmrh/core': resolve(__dirname, '../../packages/core/src/index.ts'),
      '~': resolve(__dirname, './src'),
    },
  },
})
