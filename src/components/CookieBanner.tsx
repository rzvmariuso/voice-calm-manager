import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cookie, X, Settings, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('praxisflow-cookie-consent');
    if (!cookieConsent) {
      // Show banner after 2 seconds to not be too intrusive
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('praxisflow-cookie-consent', 'all');
    setShowBanner(false);
  };

  const handleAcceptNecessary = () => {
    localStorage.setItem('praxisflow-cookie-consent', 'necessary');
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem('praxisflow-cookie-consent', 'rejected');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-in-right">
      <Card className="max-w-4xl mx-auto shadow-elegant border-2 border-primary/20 bg-background/95 backdrop-blur-sm">
        <CardContent className="p-6">
          {!showSettings ? (
            // Main Banner
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Cookie className="w-6 h-6 text-primary animate-bounce-gentle" />
                <h3 className="text-lg font-semibold">Cookies & Datenschutz</h3>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                Wir verwenden nur <strong>technisch notwendige Cookies</strong> für die Funktionalität unserer Praxisverwaltung. 
                Marketing- oder Tracking-Cookies setzen wir nicht ein. Ihre Daten bleiben sicher und DSGVO-konform geschützt.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button 
                  onClick={handleAcceptAll}
                  className="button-gradient flex-1"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Akzeptieren
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setShowSettings(true)}
                  className="flex-1"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Einstellungen
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleReject}
                  className="sm:w-auto"
                >
                  <X className="w-4 h-4 mr-2" />
                  Ablehnen
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2">
                <Link to="/data-protection" className="hover:text-primary hover:underline">
                  Datenschutzerklärung
                </Link>
                <Link to="/imprint" className="hover:text-primary hover:underline">
                  Impressum
                </Link>
                <Link to="/terms" className="hover:text-primary hover:underline">
                  AGB
                </Link>
              </div>
            </div>
          ) : (
            // Detailed Settings
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-semibold">Cookie-Einstellungen</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowSettings(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {/* Necessary Cookies */}
                <div className="p-4 border border-border rounded-lg bg-muted/20">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Shield className="w-4 h-4 text-success" />
                      Technisch notwendige Cookies
                    </h4>
                    <div className="text-sm px-2 py-1 bg-success/20 text-success-foreground rounded">
                      Immer aktiv
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Diese Cookies sind für die Grundfunktionen der Website erforderlich und können nicht deaktiviert werden. 
                    Sie speichern keine persönlichen Informationen und dienen der Sicherheit und Funktionalität.
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <strong>Beispiele:</strong> Session-Management, Anmeldestatus, Sicherheits-Token
                  </div>
                </div>
                
                {/* Analytics - Disabled */}
                <div className="p-4 border border-border rounded-lg opacity-60">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Cookie className="w-4 h-4 text-muted-foreground" />
                      Analyse-Cookies
                    </h4>
                    <div className="text-sm px-2 py-1 bg-muted text-muted-foreground rounded">
                      Nicht verwendet
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Wir verwenden keine Analyse- oder Tracking-Cookies. Ihre Nutzung wird nicht verfolgt oder analysiert.
                  </p>
                </div>
                
                {/* Marketing - Disabled */}
                <div className="p-4 border border-border rounded-lg opacity-60">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Cookie className="w-4 h-4 text-muted-foreground" />
                      Marketing-Cookies
                    </h4>
                    <div className="text-sm px-2 py-1 bg-muted text-muted-foreground rounded">
                      Nicht verwendet
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Wir setzen keine Marketing- oder Werbe-Cookies ein. Ihr Verhalten wird nicht zu Werbezwecken getrackt.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
                <Button 
                  onClick={handleAcceptNecessary}
                  className="button-gradient flex-1"
                >
                  Nur notwendige Cookies
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setShowSettings(false)}
                  className="flex-1"
                >
                  Zurück
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}