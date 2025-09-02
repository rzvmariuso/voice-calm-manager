import { RecurringAppointments } from "@/components/appointments/RecurringAppointments";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function Recurring() {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-subtle">
          <AppSidebar />
          <MobileNavigation />
          
          <main className="flex-1 flex flex-col overflow-hidden">
            <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4 lg:px-6">
              <SidebarTrigger className="lg:hidden" />
              <div className="flex-1" />
            </header>
            
            <div className="flex-1 overflow-auto p-4 lg:p-6">
              <RecurringAppointments />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}