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
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
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
