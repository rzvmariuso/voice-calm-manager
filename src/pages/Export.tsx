import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ExportData } from "@/components/common/ExportData";
import { useAuth } from "@/hooks/useAuth";
import { usePractice } from "@/hooks/usePractice";
import { LoadingPage } from "@/components/common/LoadingSpinner";

export default function Export() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { practice, loading: practiceLoading } = usePractice();

  if (authLoading || practiceLoading) {
    return (
      <div className="min-h-screen bg-background">
        <LoadingPage 
          title="Lade Export..." 
          description="Export-Funktionen werden geladen" 
        />
      </div>
    );
  }

  if (!user || !practice) {
    return (
      <div className="min-h-screen bg-background">
        <LoadingPage 
          title="Weiterleitung..." 
          description="Sie werden zur Anmeldung weitergeleitet" 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
                className="h-9 w-9 p-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg overflow-hidden flex items-center justify-center">
                  <img 
                    src="/lovable-uploads/f8bf1ba1-4dee-42dd-9c1d-543ca3de4a53.png" 
                    alt="Voxcal Logo" 
                    className="w-6 h-6 object-contain" 
                  />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">Datenexport</h1>
                  <p className="text-sm text-muted-foreground">
                    Exportieren Sie Ihre Praxisdaten
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <ExportData />
        </div>
      </main>
    </div>
  );
}