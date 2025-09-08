import React from "react";
import ReactDOM from "react-dom/client";
import App from './App.tsx';
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import "./index.css";

// Enhanced Service Worker registration with update handling
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
        
        // Check for updates every 30 seconds
        setInterval(() => {
          registration.update();
        }, 30000);
        
        // Listen for waiting service worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && registration.active) {
                // New service worker is ready, activate it immediately
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
    
    // Listen for service worker messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'SW_UPDATED') {
        console.log('Service Worker updated to version:', event.data.version);
        // Force reload to get fresh content
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    });
    
    // Handle service worker controller change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service Worker controller changed - reloading');
      window.location.reload();
    });
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
