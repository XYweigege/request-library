import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: '/test.html'
  },
  build: {
    rollupOptions: {
      input: {
        main: './test.html'
      }
    }
  }
});
