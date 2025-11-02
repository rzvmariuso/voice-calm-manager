import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Crown, Search } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { MobileNavigation } from "./MobileNavigation";
import { GlobalSearch } from "@/components/common/GlobalSearch";
import { DarkModeToggle } from "@/components/common/DarkModeToggle";

interface MobileHeaderProps {
  title?: string;
  subtitle?: string;
  showUpgradeButton?: boolean;
}

export function MobileHeader({ title, subtitle, showUpgradeButton = false }: MobileHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const { isSubscribed } = useSubscription();

  return (
    <>
    <div className="lg:hidden bg-card/95 border-b border-border/50 p-4 sticky top-0 z-10 backdrop-blur-lg shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <MobileNavigation />
          <div className="w-10 h-10 bg-gradient-primary rounded-xl overflow-hidden flex items-center justify-center shadow-soft flex-shrink-0">
            <img 
              src="/lovable-uploads/f8bf1ba1-4dee-42dd-9c1d-543ca3de4a53.png" 
              alt="Voxcal Logo" 
              className="w-7 h-7 object-contain" 
            />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-bold text-lg truncate block text-foreground">
              {title || "Voxcal"}
            </span>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate leading-tight">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSearchOpen(true)}
            data-search-trigger
            className="h-9 w-9 p-0 hover:bg-accent/50 rounded-lg transition-all"
          >
            <Search className="w-4 h-4" />
            <span className="sr-only">Suchen</span>
          </Button>
          
          <DarkModeToggle />
          
          {showUpgradeButton && !isSubscribed && (
            <Link to="/billing">
              <Button size="sm" className="button-gradient flex-shrink-0 h-9 px-3 shadow-soft hover:shadow-glow transition-all">
                <Crown className="w-4 h-4" />
                <span className="sr-only">Upgrade</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
    
    <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}