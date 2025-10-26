import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Shield, 
  Smartphone, 
  Key, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Monitor,
  Laptop,
  Tablet
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function Security() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isSetup2FAOpen, setIsSetup2FAOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const { toast } = useToast();

  const sessions = [
    {
      id: '1',
      device: 'Desktop Browser',
      location: 'Berlin, Deutschland',
      lastActive: 'Gerade eben',
      current: true,
      icon: Monitor
    },
    {
      id: '2',
      device: 'iPhone 15 Pro',
      location: 'Berlin, Deutschland',
      lastActive: 'vor 2 Stunden',
      current: false,
      icon: Smartphone
    },
    {
      id: '3',
      device: 'MacBook Pro',
      location: 'München, Deutschland',
      lastActive: 'vor 1 Tag',
      current: false,
      icon: Laptop
    }
  ];

  const auditLogs = [
    {
      id: '1',
      action: 'Login',
      timestamp: '2024-01-15 14:32:00',
      device: 'Desktop Browser',
      status: 'success'
    },
    {
      id: '2',
      action: 'Password changed',
      timestamp: '2024-01-14 09:15:00',
      device: 'iPhone',
      status: 'success'
    },
    {
      id: '3',
      action: 'Failed login attempt',
      timestamp: '2024-01-13 22:45:00',
      device: 'Unknown device',
      status: 'failed'
    }
  ];

  const handleEnable2FA = () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Ungültiger Code",
        description: "Bitte geben Sie den 6-stelligen Verifizierungscode ein.",
        variant: "destructive"
      });
      return;
    }

    setIs2FAEnabled(true);
    setIsSetup2FAOpen(false);
    toast({
      title: "2FA aktiviert",
      description: "Zwei-Faktor-Authentifizierung wurde erfolgreich eingerichtet.",
    });
  };

  const handleEnableBiometric = async () => {
    try {
      // Check if WebAuthn is available
      if (!window.PublicKeyCredential) {
        toast({
          title: "Nicht unterstützt",
          description: "Ihr Browser unterstützt keine biometrische Authentifizierung.",
          variant: "destructive"
        });
        return;
      }

      setIsBiometricEnabled(!isBiometricEnabled);
      toast({
        title: isBiometricEnabled ? "Biometrie deaktiviert" : "Biometrie aktiviert",
        description: isBiometricEnabled 
          ? "Biometrische Authentifizierung wurde deaktiviert."
          : "Biometrische Authentifizierung wurde aktiviert.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Biometrische Authentifizierung konnte nicht aktiviert werden.",
        variant: "destructive"
      });
    }
  };

  const handleRevokeSession = (sessionId: string) => {
    toast({
      title: "Sitzung beendet",
      description: "Die Sitzung wurde erfolgreich beendet.",
    });
  };

  return (
    <PageLayout title="Sicherheit">
      <div className="space-y-6">
        {/* Two-Factor Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Zwei-Faktor-Authentifizierung (2FA)
            </CardTitle>
            <CardDescription>
              Erhöhen Sie die Sicherheit Ihres Kontos mit einer zusätzlichen Verifizierungsebene
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  is2FAEnabled ? 'bg-success/10' : 'bg-muted'
                }`}>
                  {is2FAEnabled ? (
                    <CheckCircle2 className="w-6 h-6 text-success" />
                  ) : (
                    <Shield className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">
                    {is2FAEnabled ? '2FA ist aktiviert' : '2FA ist deaktiviert'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {is2FAEnabled 
                      ? 'Ihr Konto ist durch 2FA geschützt'
                      : 'Aktivieren Sie 2FA für zusätzliche Sicherheit'
                    }
                  </p>
                </div>
              </div>

              <Dialog open={isSetup2FAOpen} onOpenChange={setIsSetup2FAOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant={is2FAEnabled ? "outline" : "default"}
                    className={!is2FAEnabled ? "bg-gradient-primary" : ""}
                  >
                    {is2FAEnabled ? 'Deaktivieren' : 'Aktivieren'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>2FA einrichten</DialogTitle>
                    <DialogDescription>
                      Scannen Sie den QR-Code mit Ihrer Authenticator-App und geben Sie den Code ein
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex justify-center p-8 bg-muted rounded-lg">
                      <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center">
                        <span className="text-muted-foreground">QR Code</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="verification-code">Verifizierungscode</Label>
                      <Input
                        id="verification-code"
                        placeholder="000000"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground">
                        Geben Sie den 6-stelligen Code aus Ihrer Authenticator-App ein
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsSetup2FAOpen(false)}>
                      Abbrechen
                    </Button>
                    <Button onClick={handleEnable2FA} className="bg-gradient-primary">
                      Bestätigen
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Biometric Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              Biometrische Authentifizierung
            </CardTitle>
            <CardDescription>
              Melden Sie sich mit Fingerabdruck oder Gesichtserkennung an
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="font-semibold">Biometrischer Login</h3>
                  <p className="text-sm text-muted-foreground">
                    Nutzen Sie Fingerabdruck oder Face ID zur Anmeldung
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={isBiometricEnabled}
                  onCheckedChange={handleEnableBiometric}
                />
                <Label>{isBiometricEnabled ? 'Aktiviert' : 'Deaktiviert'}</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-primary" />
              Aktive Sitzungen
            </CardTitle>
            <CardDescription>
              Verwalten Sie alle Geräte, auf denen Sie angemeldet sind
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions.map((session) => {
                const Icon = session.icon;
                return (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{session.device}</h3>
                          {session.current && (
                            <Badge variant="secondary" className="text-xs">Aktuell</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{session.location}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {session.lastActive}
                        </p>
                      </div>
                    </div>
                    {!session.current && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRevokeSession(session.id)}
                      >
                        Beenden
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Security Audit Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Sicherheitsprotokoll
            </CardTitle>
            <CardDescription>
              Verlauf aller sicherheitsrelevanten Aktivitäten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      log.status === 'success' ? 'bg-success' : 'bg-destructive'
                    }`} />
                    <div>
                      <h3 className="font-medium text-sm">{log.action}</h3>
                      <p className="text-xs text-muted-foreground">{log.device}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                    {log.status === 'failed' && (
                      <div className="flex items-center gap-1 text-destructive text-xs mt-1">
                        <AlertCircle className="w-3 h-3" />
                        Fehlgeschlagen
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
