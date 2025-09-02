import React from "react";
import ReactDOM from "react-dom/client";
import App from './App.tsx';
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { AppStateProvider } from "@/hooks/useAppState";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <AppStateProvider>
      <App />
    </AppStateProvider>
  </ErrorBoundary>
);
