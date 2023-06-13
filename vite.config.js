import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'umd'],
      name: 'UnleashReact',
      fileName: 'unleash-react',
    },
    rollupOptions: {
      external: ['react', 'unleash-proxy-client'],
      output: {
        exports: 'named',
        globals: {
          react: 'react',
        },
      },
    },
  },
  plugins: [dts()],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      enabled: true,
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts'],
      provider: 'istanbul',
    },
    setupFiles: './testSetup.js',
  },
});
