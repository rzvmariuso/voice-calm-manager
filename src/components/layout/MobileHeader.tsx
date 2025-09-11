import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Crown, Search } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { MobileNavigation } from "./MobileNavigation";
import { GlobalSearch } from "@/components/common/GlobalSearch";

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
    <div className="lg:hidden bg-background border-b border-border p-4 sticky top-0 z-10 backdrop-blur-sm bg-background/95">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MobileNavigation />
          <div className="w-8 h-8 bg-gradient-primary rounded-lg overflow-hidden flex items-center justify-center">
            <img 
              src="/lovable-uploads/f8bf1ba1-4dee-42dd-9c1d-543ca3de4a53.png" 
              alt="Voxcal Logo" 
              className="w-6 h-6 object-contain" 
            />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-bold text-lg truncate block">
              {title || "Voxcal"}
            </span>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="w-4 h-4" />
            <span className="sr-only">Search</span>
          </Button>
          
          {showUpgradeButton && !isSubscribed && (
            <Link to="/billing">
              <Button size="sm" className="button-gradient flex-shrink-0">
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