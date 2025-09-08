import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Crown } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  showUpgradeButton?: boolean;
}

export function PageLayout({ children, title, showUpgradeButton = false }: PageLayoutProps) {
  const { isSubscribed } = useSubscription();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-x-hidden">
          {/* Mobile Header */}
          <div className="lg:hidden bg-background border-b border-border p-4 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MobileNavigation />
                <div className="w-8 h-8 bg-gradient-primary rounded-lg overflow-hidden flex items-center justify-center">
                  <img src="/lovable-uploads/f8bf1ba1-4dee-42dd-9c1d-543ca3de4a53.png" alt="Voxcal Logo" className="w-6 h-6 object-contain" />
                </div>
                <div>
                  <span className="font-bold text-lg">Voxcal</span>
                  {title && <p className="text-xs text-muted-foreground">{title}</p>}
                </div>
              </div>
              {showUpgradeButton && !isSubscribed && (
                <Link to="/billing">
                  <Button size="sm" className="button-gradient">
                    <Crown className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Desktop and Mobile Content */}
          <div className="p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 lg:mb-8 space-y-4 lg:space-y-0">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hidden lg:inline-flex" />
                {title && (
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                      {title}
                    </h1>
                  </div>
                )}
              </div>
              {showUpgradeButton && !isSubscribed && (
                <div className="hidden lg:block">
                  <Link to="/billing">
                    <Button className="button-gradient hover:scale-105 transition-all duration-300">
                      <Crown className="w-4 h-4 mr-2" />
                      Jetzt upgraden
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}