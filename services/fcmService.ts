import { messaging } from '../firebase/config';

// Handle foreground messages
export const setupForegroundNotifications = async () => {
  if (!messaging) {
    console.warn('Messaging not available');
    return;
  }

  try {
    // Dynamically import onMessage to avoid build issues
    const { onMessage } = await import('firebase/messaging');
    
    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      
      // Show notification
      if (Notification.permission === 'granted') {
        const notificationTitle = payload.notification?.title || 'Reveal: Search Received';
        const notificationOptions = {
          body: payload.notification?.body || payload.data?.query || 'New search captured',
          icon: payload.notification?.icon || '/icon-192x192.png',
          badge: '/icon-192x192.png',
          tag: 'reveal-search',
          requireInteraction: false
        };

        new Notification(notificationTitle, notificationOptions);
      }
    });
  } catch (error) {
    console.error('Error setting up foreground notifications:', error);
  }
};
