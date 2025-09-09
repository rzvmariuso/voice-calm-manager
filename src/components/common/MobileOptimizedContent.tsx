import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobileOptimizedContentProps {
  children: ReactNode;
  className?: string;
}

export function MobileOptimizedContent({ children, className }: MobileOptimizedContentProps) {
  return (
    <div className={cn(
      "w-full",
      // Mobile-first responsive padding
      "p-3 sm:p-4 lg:p-6",
      // Prevent horizontal overflow
      "overflow-x-hidden",
      // Ensure proper spacing on mobile
      "space-y-4 lg:space-y-6",
      className
    )}>
      {children}
    </div>
  );
}

export function MobileGrid({ children, className }: MobileOptimizedContentProps) {
  return (
    <div className={cn(
      // Responsive grid that adapts to mobile
      "grid gap-3 lg:gap-6",
      "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
      // On very small screens, single column
      "xs:grid-cols-1",
      className
    )}>
      {children}
    </div>
  );
}

export function MobileCard({ children, className }: MobileOptimizedContentProps) {
  return (
    <div className={cn(
      // Mobile-optimized card styling
      "bg-card text-card-foreground rounded-lg shadow-soft",
      "p-3 sm:p-4 lg:p-6",
      // Touch-friendly interactions
      "transition-all duration-200",
      "hover:shadow-elegant hover:-translate-y-1 active:scale-[0.98]",
      // Prevent content overflow on mobile
      "overflow-hidden",
      // Better mobile tap targets
      "min-h-[44px] touch-manipulation",
      className
    )}>
      {children}
    </div>
  );
}

export function MobileStatCard({ title, value, className }: { title: string; value: string | number; className?: string }) {
  return (
    <div className={cn(
      "bg-card rounded-lg p-3 text-center shadow-soft",
      "border border-border/50",
      "transition-all duration-200 hover:shadow-elegant",
      className
    )}>
      <div className="text-lg sm:text-xl font-bold text-foreground">
        {value}
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground">
        {title}
      </div>
    </div>
  );
}

export function MobileAppointmentPreview({ 
  appointment, 
  onClick, 
  className 
}: { 
  appointment: any; 
  onClick?: () => void; 
  className?: string; 
}) {
  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-3 bg-card rounded-lg shadow-soft",
        "border border-border/50 cursor-pointer",
        "transition-all duration-200 hover:shadow-elegant active:scale-[0.98]",
        "min-h-[60px] touch-manipulation",
        className
      )}
      onClick={onClick}
    >
      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-medium text-primary">
          {appointment.appointment_time?.slice(0, 2) || '??'}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {appointment.patient?.first_name} {appointment.patient?.last_name}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {appointment.service} • {appointment.appointment_time}
        </p>
      </div>
    </div>
  );
}