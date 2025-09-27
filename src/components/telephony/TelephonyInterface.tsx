import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, Bot, Shield, Zap } from 'lucide-react';
import PhoneNumberManager from './PhoneNumberManager';
import RetellAgentManager from './RetellAgentManager';

interface TelephonyInterfaceProps {
  onCallStatusChange?: (status: string) => void;
}

const TelephonyInterface: React.FC<TelephonyInterfaceProps> = ({ onCallStatusChange }) => {
  return (
    <div className="space-y-6">
      {/* Provider Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI-Telefonie Provider
          </CardTitle>
          <CardDescription>
            Wählen Sie Ihren bevorzugten AI-Telefonie Anbieter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="vapi" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="vapi">VAPI</TabsTrigger>
              <TabsTrigger value="retell">Retell.ai</TabsTrigger>
            </TabsList>
            
            <TabsContent value="vapi" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                  <span className="font-medium">VAPI System bereit</span>
                </div>
                <Badge variant="outline" className="border-success text-success">
                  Online
                </Badge>
              </div>
              
              {/* VAPI Phone Number Manager */}
              <PhoneNumberManager />
            </TabsContent>
            
            <TabsContent value="retell" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                  <span className="font-medium">Retell.ai System bereit</span>
                </div>
                <Badge variant="outline" className="border-primary text-primary">
                  Online
                </Badge>
              </div>
              
              {/* Retell Agent Manager */}
              <RetellAgentManager />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

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