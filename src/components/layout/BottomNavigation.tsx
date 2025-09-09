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
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="flex items-center justify-around px-2 py-2">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-0 flex-1",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <Icon className="w-5 h-5 mb-1 flex-shrink-0" />
              <span className="text-xs font-medium truncate">{item.name}</span>
            </Link>
          );
        })}
        
        {/* Floating Action Button */}
        <div className="relative">
          <Link to="/appointments">
            <Button
              size="sm"
              className="w-12 h-12 rounded-full shadow-elegant hover:shadow-glow transition-all duration-300 button-gradient"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}