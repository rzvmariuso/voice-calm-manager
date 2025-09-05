import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Phone, PhoneCall, PhoneOff, User, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePractice } from '@/hooks/usePractice';
import { useUserPhoneNumbers } from '@/hooks/useUserPhoneNumbers';
import UserPhoneNumbers from './UserPhoneNumbers';

interface VapiInterfaceProps {
  onCallStatusChange?: (status: string) => void;
}

export const VapiInterface: React.FC<VapiInterfaceProps> = ({ onCallStatusChange }) => {
  const { toast } = useToast();
  const { practice } = usePractice();
  const { phoneNumbers } = useUserPhoneNumbers();
  const [isLoading, setIsLoading] = useState(false);
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<string>('idle');

  // Get Vapi-connected phone numbers for calls
  const vapiPhoneNumbers = phoneNumbers.filter(phone => phone.vapi_phone_id && phone.is_active);


  const setupInboundCalls = async (userPhoneId: string) => {
    if (!practice) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('vapi-phone', {
        body: { 
          action: 'setup_inbound',
          practiceId: practice.id,
          userPhoneId: userPhoneId
        }
      });

      if (error) throw error;

      if (data && data.success) {
        toast({
          title: "Inbound Calls konfiguriert!",
          description: "Du kannst jetzt die Nummer anrufen!",
        });
      }
    } catch (error) {
      console.error('Error setting up inbound calls:', error);
      toast({
        title: "Fehler",
        description: error.message || "Inbound-Setup fehlgeschlagen",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTestCall = async (userPhoneId: string) => {
    if (!practice) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('vapi-phone', {
        body: { 
          action: 'create_call',
          practiceId: practice.id,
          userPhoneId: userPhoneId
        }
      });

      if (error) throw error;

      if (data.success) {
        setActiveCall(data.callId);
        setCallStatus('active');
        onCallStatusChange?.('active');
        
        toast({
          title: "Anruf gestartet",
          description: `Anruf-ID: ${data.callId}`,
        });
      }
    } catch (error) {
      console.error('Error creating call:', error);
      toast({
        title: "Fehler",
        description: "Anruf konnte nicht gestartet werden",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const endCall = () => {
    setActiveCall(null);
    setCallStatus('idle');
    onCallStatusChange?.('idle');
    
    toast({
      title: "Anruf beendet",
      description: "Der Anruf wurde erfolgreich beendet",
    });
  };

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Vapi Voice Interface
          </CardTitle>
          <CardDescription>
            Ihre mit Vapi verbundenen Nummern - bereit für Voice AI Anrufe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant={callStatus === 'active' ? 'default' : 'secondary'}>
                {callStatus === 'active' ? 'Aktiv' : 'Bereit'}
              </Badge>
              {activeCall && (
                <span className="text-sm text-muted-foreground">
                  Call ID: {activeCall}
                </span>
              )}
            </div>
            
            {activeCall ? (
              <Button 
                onClick={endCall}
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
              >
                <PhoneOff className="h-4 w-4" />
                Anruf beenden
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Active Vapi Numbers for Testing */}
      {vapiPhoneNumbers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Test-Anrufe
            </CardTitle>
            <CardDescription>
              Testen Sie Ihre Vapi-verbundenen Nummern
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {vapiPhoneNumbers.map((phoneNumber) => (
                <div 
                  key={phoneNumber.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <PhoneCall className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{phoneNumber.phone_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {phoneNumber.provider} • {phoneNumber.country_code}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setupInboundCalls(phoneNumber.id)}
                      disabled={isLoading}
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Settings className="h-3 w-3" />
                      Setup Eingehend
                    </Button>
                    
                    <Button
                      onClick={() => createTestCall(phoneNumber.id)}
                      disabled={isLoading || !!activeCall}
                      size="sm"
                      variant="outline"
                    >
                      Test-Anruf
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Phone Number Management */}
      <UserPhoneNumbers />

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Verfügbare Funktionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">✓</Badge>
              <div>
                <p className="font-medium">Termine buchen</p>
                <p className="text-sm text-muted-foreground">
                  Automatische Terminbuchung via Spracheingabe
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">✓</Badge>
              <div>
                <p className="font-medium">Termine verschieben/löschen</p>
                <p className="text-sm text-muted-foreground">
                  Bestehende Termine verwalten
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">✓</Badge>
              <div>
                <p className="font-medium">Human Handoff</p>
                <p className="text-sm text-muted-foreground">
                  Weiterleitung an echte Mitarbeiter
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">✓</Badge>
              <div>
                <p className="font-medium">DSGVO-konform</p>
                <p className="text-sm text-muted-foreground">
                  Deutsche Server und Datenschutz
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VapiInterface;