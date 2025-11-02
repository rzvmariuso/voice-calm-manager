import { Link, useLocation } from "react-router-dom";
import { Calendar, Users, BarChart3, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    name: "Kalender",
    href: "/calendar",
    icon: Calendar,
  },
  {
    name: "Patienten",
    href: "/patients", 
    icon: Users,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Einstellungen",
    href: "/settings",
    icon: Settings,
  },
];

export function BottomNavigation() {
  const location = useLocation();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border/50 shadow-elegant">
      <div className="flex items-center justify-around px-2 py-3 safe-area-inset-bottom">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 touch-manipulation",
                isActive 
                  ? "text-primary bg-primary/10 scale-105" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:scale-105 active:scale-95"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 mb-1 flex-shrink-0 transition-transform",
                isActive && "scale-110"
              )} />
              <span className={cn(
                "text-xs truncate transition-all",
                isActive ? "font-semibold" : "font-medium"
              )}>{item.name}</span>
            </Link>
          );
        })}
        
        {/* Floating Action Button */}
        <div className="relative -mt-2">
          <Link to="/appointments">
            <Button
              size="sm"
              className="w-14 h-14 rounded-full shadow-glow hover:shadow-elegant hover:scale-110 active:scale-95 transition-all duration-300 button-gradient"
            >
              <Plus className="w-6 h-6" />
              <span className="sr-only">Neuer Termin</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}