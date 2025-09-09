import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { MobileHeader } from "./MobileHeader";

interface MobileOptimizedCalendarProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function MobileOptimizedCalendar({ 
  children, 
  title = "Kalender",
  subtitle = "Termine verwalten",
  className 
}: MobileOptimizedCalendarProps) {
  return (
    <div className={cn("flex flex-col min-h-screen", className)}>
      {/* Mobile Header */}
      <MobileHeader 
        title={title}
        subtitle={subtitle}
        showUpgradeButton={true}
      />
      
      {/* Main Content */}
      <main className="flex-1 p-3 sm:p-4 lg:p-6 space-y-4 lg:space-y-6 bg-background">
        {children}
      </main>
    </div>
  );
}

export function MobileCalendarStats({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn(
      "grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4",
      "lg:hidden", // Hide on desktop as it's shown in sidebar
      className
    )}>
      {children}
    </div>
  );
}

export function MobileCalendarGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn(
      // Mobile-first calendar grid
      "overflow-x-auto",
      // Ensure proper touch scrolling
      "touch-pan-x",
      // Better mobile styling
      "rounded-lg shadow-soft",
      className
    )}>
      <div className="min-w-full">
        {children}
      </div>
    </div>
  );
}

export function MobileTodayAppointments({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn(
      "lg:hidden", // Only show on mobile
      "bg-card rounded-lg p-3 mb-4 shadow-soft",
      className
    )}>
      {children}
    </div>
  );
}