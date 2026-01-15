// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB2ac_RJQDSfTYq_L-IfaN3Q3k_mfd909k",
  authDomain: "reveal-magic-tool.firebaseapp.com",
  projectId: "reveal-magic-tool",
  storageBucket: "reveal-magic-tool.firebasestorage.app",
  messagingSenderId: "603356151636",
  appId: "1:603356151636:web:804372f8547f3a0805d2c1"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[sw.js] Received background message ', payload);
  
  // Only show notification if notification data exists (prevents duplicates)
  if (payload.notification) {
    // Use title as the main message (backend sends "Googly: {query}" in title)
    const notificationTitle = payload.notification.title || `Googly: ${payload.data?.query || ''}`;
    const notificationOptions = {
      body: '',
      icon: payload.notification.icon || '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: `googly-search-${payload.data?.searchId || Date.now()}`,
      requireInteraction: false
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
  }
});

// Workbox injection point - vite-plugin-pwa will inject manifest here
// The manifest array will be available as self.__WB_MANIFEST
// Import Workbox from CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

if (workbox) {
  // Precache assets - manifest will be injected by vite-plugin-pwa
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

  // Runtime caching strategies
  workbox.routing.registerRoute(
    ({ url }) => url.origin === 'https://fonts.googleapis.com',
    new workbox.strategies.CacheFirst({
      cacheName: 'google-fonts-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365
        })
      ]
    })
  );

  workbox.routing.registerRoute(
    ({ url }) => url.origin === 'https://cdn.tailwindcss.com',
    new workbox.strategies.CacheFirst({
      cacheName: 'tailwind-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365
        })
      ]
    })
  );

  workbox.routing.registerRoute(
    ({ url }) => url.origin === 'https://esm.sh',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'esm-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24
        })
      ]
    })
  );

  workbox.routing.registerRoute(
    ({ url }) => url.origin === 'https://www.gstatic.com',
    new workbox.strategies.CacheFirst({
      cacheName: 'gstatic-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 365
        })
      ]
    })
  );
}