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
      
      // Show notification only if we have notification data
      // Use tag to prevent duplicates - same tag will replace previous notification
      if (Notification.permission === 'granted' && payload.notification) {
        // Use title as the main message (backend sends "Googly: {query}" in title)
        const notificationTitle = payload.notification.title || `Googly: ${payload.data?.query || ''}`;
        const notificationOptions = {
          body: '',
          icon: payload.notification.icon || '/icon-192x192.png',
          badge: '/icon-192x192.png',
          tag: `googly-search-${payload.data?.searchId || Date.now()}`,
          requireInteraction: false
        };

        new Notification(notificationTitle, notificationOptions);
      }
    });
  } catch (error) {
    console.error('Error setting up foreground notifications:', error);
  }
};
