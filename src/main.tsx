import React from "react";
import ReactDOM from "react-dom/client";
import App from './App.tsx';
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { AppStateProvider } from "@/hooks/useAppState";
import "./index.css";

// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <AppStateProvider>
      <App />
    </AppStateProvider>
  </ErrorBoundary>
);
