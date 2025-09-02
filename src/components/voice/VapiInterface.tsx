import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Phone, PhoneCall, PhoneOff, User, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePractice } from '@/hooks/usePractice';

interface VapiInterfaceProps {
  onCallStatusChange?: (status: string) => void;
}

export const VapiInterface: React.FC<VapiInterfaceProps> = ({ onCallStatusChange }) => {
  const { toast } = useToast();
  const { practice } = usePractice();
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumbers, setPhoneNumbers] = useState<any[]>([]);
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<string>('idle');

  // Load available phone numbers
  useEffect(() => {
    loadPhoneNumbers();
  }, []);

  const loadPhoneNumbers = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('vapi-phone', {
        body: { action: 'get_phone_numbers' }
      });

      if (error) throw error;

      if (data.success) {
        setPhoneNumbers(data.phoneNumbers || []);
      }
    } catch (error) {
      console.error('Error loading phone numbers:', error);
      toast({
        title: "Fehler",
        description: "Telefonnummern konnten nicht geladen werden",
        variant: "destructive",
      });
    }
  };

  const buyPhoneNumber = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('vapi-phone', {
        body: { 
          action: 'buy_phone_number',
          areaCode: '212', // New York area code for US numbers
          country: 'US'
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Telefonnummer erworben",
          description: `Neue Nummer: ${data.phoneNumber.number}`,
        });
        await loadPhoneNumbers();
      }
    } catch (error) {
      console.error('Error buying phone number:', error);
      toast({
        title: "Fehler",
        description: "Telefonnummer konnte nicht erworben werden",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTestCall = async (phoneNumberId: string) => {
    if (!practice) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('vapi-phone', {
        body: { 
          action: 'create_call',
          practiceId: practice.id,
          phoneNumber: phoneNumberId
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
            Vapi Voice AI über Twilio - Jetzt mit US-Nummer zum Testen
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

      {/* Phone Numbers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Telefonnummern verwalten
          </CardTitle>
          <CardDescription>
            Verfügbare Telefonnummern für eingehende Anrufe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {phoneNumbers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Noch keine Telefonnummern gefunden
              </p>
              <Button 
                onClick={loadPhoneNumbers}
                disabled={isLoading}
                className="flex items-center gap-2 mr-2"
              >
                <Phone className="h-4 w-4" />
                Nummern neu laden
              </Button>
              <Button 
                onClick={buyPhoneNumber}
                disabled={isLoading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Phone className="h-4 w-4" />
                {isLoading ? 'Wird erworben...' : 'US-Nummer hinzufügen'}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {phoneNumbers.map((phoneNumber) => (
                <div 
                  key={phoneNumber.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <PhoneCall className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{phoneNumber.number}</p>
                      <p className="text-sm text-muted-foreground">
                        {phoneNumber.provider} • {phoneNumber.country}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => createTestCall(phoneNumber.id)}
                    disabled={isLoading || !!activeCall}
                    size="sm"
                    variant="outline"
                  >
                    Test-Anruf
                  </Button>
                </div>
              ))}
              
              <Button 
                onClick={buyPhoneNumber}
                disabled={isLoading}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <Phone className="h-4 w-4" />
                Weitere Nummer hinzufügen
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

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