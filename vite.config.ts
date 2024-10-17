// Configure Vitest (https://vitest.dev/config/)
/// <reference types="vitest" />
// import { configDefaults } from 'vitest/config'
import UnoCSS from 'unocss/vite'

import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
// https://vitejs.dev/guide/build.html#library-mode
export default defineConfig({
  // base: '/vue-modal-route',
  plugins: [
    vue(),
    UnoCSS(),
    // dts({ rollupTypes: true })
  ],
  define: {
    // enable hydration mismatch details in production build
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true',
    __VUE_PROD_DEVTOOLS__: 'false',
    __VUE_OPTIONS_API__: 'true',
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, './src'),
    },
  },

  // build: {
  //   copyPublicDir: false,
  //   lib: {
  //     entry: resolve(__dirname, 'src/modal/index.ts'),
  //     name: 'useModalContext',
  //     fileName: 'index',
  //   },
  //   rollupOptions: {
  //     external: ['vue'],
  //     output: {
  //       // Provide global variables to use in the UMD build
  //       // for externalized deps
  //       globals: {
  //         vue: 'Vue',
  //       },
  //     },
  //   },
  // },
})
