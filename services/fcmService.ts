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
      
      // Always show notification when message is received, regardless of app state
      // Check if we have notification data or data payload
      if (payload.notification || payload.data?.query) {
        showNotification(payload);
      }
    });
  } catch (error) {
    console.error('Error setting up foreground notifications:', error);
  }
};

// Helper function to show notification
const showNotification = (payload: any) => {
  // Check notification permission
  if (Notification.permission === 'default') {
    // Request permission if not set
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        displayNotification(payload);
      } else {
        console.warn('Notification permission denied');
      }
    });
  } else if (Notification.permission === 'granted') {
    // Show notification immediately if permission is granted
    displayNotification(payload);
  } else {
    console.warn('Notification permission denied by user');
  }
};

// Display the actual notification
const displayNotification = (payload: any) => {
  const notificationTitle = payload.notification?.title || payload.data?.query || '';
  const notificationBody = payload.notification?.body || 'received from Googly';
  const notificationOptions = {
    body: notificationBody,
    icon: payload.notification?.icon || '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: `googly-search-${payload.data?.searchId || Date.now()}`,
    requireInteraction: false,
    silent: false
  };

  try {
    const notification = new Notification(notificationTitle, notificationOptions);
    
    // Optional: Handle notification click
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (error) {
    console.error('Error showing notification:', error);
  }
};
