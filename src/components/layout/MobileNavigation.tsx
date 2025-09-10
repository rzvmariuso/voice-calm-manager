import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Menu, 
  Calendar, 
  Phone, 
  Settings, 
  Users, 
  BarChart3, 
  Bot, 
  CreditCard, 
  Zap, 
  HelpCircle,
  X,
  LogOut,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { usePractice } from "@/hooks/usePractice";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: BarChart3,
    badge: null,
  },
  {
    title: "Termine",
    url: "/appointments",
    icon: Calendar,
    badge: null,
  },
  {
    title: "Kalender",
    url: "/calendar",
    icon: Calendar,
    badge: null,
  },
  {
    title: "KI-Agent",
    url: "/ai-agent",
    icon: Bot,
    badge: "KI",
  },
  {
    title: "Automation",
    url: "/automation",
    icon: Zap,
    badge: "Pro",
  },
  {
    title: "Telefonie",
    url: "/phone",
    icon: Phone,
    badge: null,
  },
  {
    title: "Billing & Abos",
    url: "/billing",
    icon: CreditCard,
    badge: null,
  },
  {
    title: "Patienten",
    url: "/patients",
    icon: Users,
    badge: null,
  },
  {
    title: "FAQ",
    url: "/faq",
    icon: HelpCircle,
    badge: null,
  },
  {
    title: "Einstellungen",
    url: "/settings",
    icon: Settings,
    badge: null,
  },
];

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const { user, signOut } = useAuth();
  const { practice } = usePractice();

  const handleNavigation = (url: string) => {
    setIsOpen(false);
  };

  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover-scale"
            aria-label="Navigation öffnen"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="left" 
          className="w-80 p-0 animate-slide-in-right"
        >
          <div className="flex h-full flex-col">
            {/* Header */}
            <SheetHeader className="border-b p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-lg overflow-hidden flex items-center justify-center">
                    <img src="/lovable-uploads/f8bf1ba1-4dee-42dd-9c1d-543ca3de4a53.png" alt="Voxcal Logo" className="w-8 h-8 object-contain" />
                  </div>
                  <div>
                    <SheetTitle className="font-bold text-lg">
                      {practice?.name || "Voxcal"}
                    </SheetTitle>
                    <p className="text-sm text-muted-foreground">KI-Terminbuchung</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsOpen(false)}
                  className="hover-scale"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* User Profile Section */}
              {user && (
                <div className="flex items-center gap-3 mt-4 p-3 bg-muted/20 rounded-lg">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gradient-primary text-white">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.user_metadata?.display_name || user.email}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              )}
            </SheetHeader>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="space-y-1 px-4">
                {navigationItems.map((item, index) => {
                  const isActive = currentPath === item.url;
                  const Icon = item.icon;

                   return (
                     <Link
                       key={item.url}
                       to={item.url}
                       onClick={() => handleNavigation(item.url)}
                       className={cn(
                         "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200 hover-scale",
                         "animate-fade-in",
                         isActive 
                           ? 'bg-gradient-primary text-white shadow-glow font-medium' 
                           : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                       )}
                       style={{ animationDelay: `${index * 0.05}s` }}
                     >
                       <Icon className={cn(
                         "w-5 h-5 flex-shrink-0",
                         isActive ? 'text-white' : 'text-muted-foreground'
                       )} />
                       <span className="flex-1">{item.title}</span>
                       {item.badge && (
                         <Badge 
                           variant={isActive ? "secondary" : "outline"} 
                           className="text-xs"
                         >
                           {item.badge}
                         </Badge>
                       )}
                     </Link>
                  );
                })}
              </nav>
            </div>

            {/* Footer */}
            <div className="border-t p-4 space-y-3">
              {/* Logout Button */}
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={async () => {
                  await signOut();
                  setIsOpen(false);
                }}
              >
                <LogOut className="w-4 h-4" />
                Abmelden
              </Button>
              
              <div className="text-center text-xs text-muted-foreground">
                <p>Version 1.0.0</p>
                <p className="mt-1">© 2024 Voxcal</p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Quick access floating action button for mobile
export function MobileQuickActions() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 lg:hidden">
      <div className="flex flex-col gap-2">
        <Link
          to="/appointments"
          className="w-12 h-12 rounded-full bg-gradient-primary shadow-glow hover:shadow-lg transition-all duration-300 hover-scale flex items-center justify-center"
          aria-label="Neuer Termin"
        >
          <Calendar className="w-6 h-6 text-white" />
        </Link>
        
        <Button 
          variant="ghost"
          size="icon"
          className="w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm"
          onClick={() => setIsVisible(false)}
          aria-label="Aktionen ausblenden"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}