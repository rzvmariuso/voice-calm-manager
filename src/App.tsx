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
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import Appointments from "./pages/Appointments";
import Calendar from "./pages/Calendar";
import Patients from "./pages/Patients";
import AIAgent from "./pages/AIAgent";
import Automation from "./pages/Automation";
import Phone from "./pages/Phone";
import FAQ from "./pages/FAQ";
import Auth from "./pages/Auth";
import PracticeSetup from "./pages/PracticeSetup";
import Privacy from "./pages/Privacy";
import Billing from "./pages/Billing";
import Terms from "./pages/Terms";
import DataProtection from "./pages/DataProtection";
import Imprint from "./pages/Imprint";
import Analytics from "./pages/Analytics";
import Notifications from "./pages/Notifications";
import Recurring from "./pages/Recurring";
import PatientDetails from "./pages/PatientDetails";
import Export from "./pages/Export";
import Compliance from "./pages/Compliance";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  useKeyboardShortcuts();
  
  return (
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
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <AppContent />
            <ConsentBanner />
            <PWAInstallPrompt />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
