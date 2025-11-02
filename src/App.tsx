import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { CookieBanner } from "@/components/CookieBanner";
import { ConsentBanner } from "@/components/gdpr/ConsentBanner";
import { PWAInstallPrompt } from "@/components/common/PWAInstallPrompt";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { lazy, Suspense } from "react";

// Lazy load all route components for better code splitting and CSS optimization
const Index = lazy(() => import("./pages/Index"));
const Settings = lazy(() => import("./pages/Settings"));
const Appointments = lazy(() => import("./pages/Appointments"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Patients = lazy(() => import("./pages/Patients"));
const AIAgent = lazy(() => import("./pages/AIAgent"));
const Automation = lazy(() => import("./pages/Automation"));
const Phone = lazy(() => import("./pages/Phone"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Auth = lazy(() => import("./pages/Auth"));
const PracticeSetup = lazy(() => import("./pages/PracticeSetup"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Billing = lazy(() => import("./pages/Billing"));
const Terms = lazy(() => import("./pages/Terms"));
const DataProtection = lazy(() => import("./pages/DataProtection"));
const Imprint = lazy(() => import("./pages/Imprint"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Recurring = lazy(() => import("./pages/Recurring"));
const PatientDetails = lazy(() => import("./pages/PatientDetails"));
const Export = lazy(() => import("./pages/Export"));
const Compliance = lazy(() => import("./pages/Compliance"));
const Install = lazy(() => import("./pages/Install"));
const Team = lazy(() => import("./pages/Team"));
const Security = lazy(() => import("./pages/Security"));
const Inbox = lazy(() => import("./pages/Inbox"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function AppContent() {
  useKeyboardShortcuts();
  
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/setup" element={<PracticeSetup />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/patients/:id" element={<PatientDetails />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/recurring" element={<Recurring />} />
        <Route path="/ai-agent" element={<AIAgent />} />
        <Route path="/automation" element={<Automation />} />
        <Route path="/phone" element={<Phone />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/data-protection" element={<DataProtection />} />
        <Route path="/imprint" element={<Imprint />} />
        <Route path="/export" element={<Export />} />
        <Route path="/compliance" element={<Compliance />} />
        <Route path="/install" element={<Install />} />
        <Route path="/team" element={<Team />} />
        <Route path="/security" element={<Security />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <AuthProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <AppContent />
                <ConsentBanner />
                <PWAInstallPrompt />
              </TooltipProvider>
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
