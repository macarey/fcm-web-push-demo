import { defineConfig, loadEnv } from 'vite';
import { copyFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  const swContent = `importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: '${env.VITE_FIREBASE_API_KEY}',
  authDomain: '${env.VITE_FIREBASE_AUTH_DOMAIN}',
  projectId: '${env.VITE_FIREBASE_PROJECT_ID}',
  storageBucket: '${env.VITE_FIREBASE_STORAGE_BUCKET}',
  messagingSenderId: '${env.VITE_FIREBASE_MESSAGING_SENDER_ID}',
  appId: '${env.VITE_FIREBASE_APP_ID}',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'Background Message';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/firebase-logo.png'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
`;

  return {
    base: '/',
    publicDir: false,
    server: {
      headers: {
        'Service-Worker-Allowed': '/'
      }
    },
    plugins: [react(), {
      name: 'generate-sw',
      writeBundle() {
        writeFileSync(resolve('dist/firebase-messaging-sw.js'), swContent);
        copyFileSync(resolve('firebase-logo.png'), resolve('dist/firebase-logo.png'));
      }
    }],
    build: {
      rollupOptions: {
        input: ['index.html'],
        output: {
          entryFileNames: '[name].js',
        }
      }
    }
  };
});
