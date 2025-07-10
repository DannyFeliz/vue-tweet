import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'
import dts from 'vite-plugin-dts'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VueDevTools(),
    dts({
      include: ['src/**/*.vue', 'src/**/*.ts'],
      insertTypesEntry: true,
      staticImport: true,
      rollupTypes: true,
      copyDtsFiles: true,
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
      compilerOptions: {
        strict: false,
        skipLibCheck: true,
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        noImplicitAny: false,
        noImplicitReturns: false,
        noImplicitThis: false,
        noUnusedLocals: false,
        noUnusedParameters: false,
      },
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'vue-tweet',
      formats: ['es', 'umd'],
      fileName: (format) => `vue-tweet.${format === 'es' ? 'js' : 'umd.cjs'}`,
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
