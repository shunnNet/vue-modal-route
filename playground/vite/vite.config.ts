// import { configDefaults } from 'vitest/config'
import UnoCSS from 'unocss/vite'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
// https://vitejs.dev/guide/build.html#library-mode
export default defineConfig({
  plugins: [
    vue(),
    UnoCSS(),
  ],
  define: {
    // enable hydration mismatch details in production build
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true',
    __VUE_PROD_DEVTOOLS__: 'false',
    __VUE_OPTIONS_API__: 'true',
  },
  resolve: {
    alias: {
      '@vmr/vue-modal-route': resolve(__dirname, '../../packages/modal-route/src/index.ts'),
      '~': resolve(__dirname, './src'),
    },
  },
})
