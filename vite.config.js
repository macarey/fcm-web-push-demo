import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/',
  publicDir: false,
  server: {
    headers: {
      'Service-Worker-Allowed': '/'
    }
  },
  build: {
    rollupOptions: {
      input: [
        'index.html',
        'firebase-messaging-sw.js'
      ],
      output: {
        entryFileNames: '[name].js',
      }
    }
  }
});
