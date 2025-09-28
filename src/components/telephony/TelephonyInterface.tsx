import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Bot, Shield, Zap } from 'lucide-react';
import PhoneNumberManager from './PhoneNumberManager';

interface TelephonyInterfaceProps {
  onCallStatusChange?: (status: string) => void;
}

const TelephonyInterface: React.FC<TelephonyInterfaceProps> = ({ onCallStatusChange }) => {
  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI-Telefonie Status
          </CardTitle>
          <CardDescription>
            Aktuelle Verbindung und System-Status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
              <span className="font-medium">AI-System bereit</span>
            </div>
            <Badge variant="outline" className="border-success text-success">
              Online
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Phone Number Manager */}
      <PhoneNumberManager />

      {/* Features Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Verfügbare Funktionen
          </CardTitle>
          <CardDescription>
            Was Ihre AI-Telefonie kann
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Terminbuchungen</h4>
                <p className="text-sm text-muted-foreground">
                  Automatische Terminvereinbarung und -verwaltung
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Bot className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Intelligente Weiterleitung</h4>
                <p className="text-sm text-muted-foreground">
                  Bei Bedarf automatische Weiterleitung an Mitarbeiter
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">DSGVO-konform</h4>
                <p className="text-sm text-muted-foreground">
                  Vollständig Deutschland-konform und datenschutzrechtlich sicher
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">24/7 Verfügbar</h4>
                <p className="text-sm text-muted-foreground">
                  Rund um die Uhr einsatzbereit für Ihre Patienten
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TelephonyInterface;