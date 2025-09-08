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
      "hover:shadow-elegant hover:-translate-y-1",
      // Prevent content overflow on mobile
      "overflow-hidden",
      className
    )}>
      {children}
    </div>
  );
}