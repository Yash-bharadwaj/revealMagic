
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { setupForegroundNotifications } from './services/fcmService';

// Setup FCM foreground notifications
setupForegroundNotifications();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
