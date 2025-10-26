import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Smartphone, Check, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkInstalled = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(checkInstalled);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      toast({
        title: "App installiert!",
        description: "Voxcal wurde erfolgreich auf Ihrem Gerät installiert.",
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      toast({
        title: "Installation nicht verfügbar",
        description: "Die App ist bereits installiert oder Ihr Browser unterstützt PWAs nicht.",
        variant: "destructive"
      });
      return;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      toast({
        title: "Installation gestartet",
        description: "Die App wird jetzt installiert...",
      });
    }
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-subtle">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-success" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">App bereits installiert</h1>
            <p className="text-muted-foreground">
              Voxcal ist bereits auf Ihrem Gerät installiert und einsatzbereit!
            </p>
          </div>
          <Button onClick={() => navigate("/")} className="w-full">
            Zur App
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-subtle">
      <Card className="max-w-md w-full p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
            <Smartphone className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Voxcal installieren</h1>
            <p className="text-muted-foreground">
              Installieren Sie Voxcal auf Ihrem Gerät für schnellen Zugriff und Offline-Nutzung
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
            <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">Schneller Zugriff</h3>
              <p className="text-sm text-muted-foreground">
                Starten Sie die App direkt vom Homescreen
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
            <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">Offline verfügbar</h3>
              <p className="text-sm text-muted-foreground">
                Arbeiten Sie auch ohne Internetverbindung
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
            <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">Push-Benachrichtigungen</h3>
              <p className="text-sm text-muted-foreground">
                Erhalten Sie wichtige Updates in Echtzeit
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleInstall} 
            className="w-full bg-gradient-primary"
            size="lg"
          >
            <Download className="w-4 h-4 mr-2" />
            Jetzt installieren
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate("/")} 
            className="w-full"
          >
            Später
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Die Installation erfordert keine zusätzlichen Berechtigungen und nimmt nur wenige Sekunden in Anspruch.
        </p>
      </Card>
    </div>
  );
}
