import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Phone, Mic, Settings, ExternalLink } from 'lucide-react';
import { useRetell } from '@/hooks/useRetell';
import { usePractice } from '@/hooks/usePractice';

const RetellAgentManager: React.FC = () => {
  const [agentName, setAgentName] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Amara');
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [availablePhones, setAvailablePhones] = useState<any[]>([]);
  const [selectedPhone, setSelectedPhone] = useState('');
  
  const { practice } = usePractice();
  const { 
    isLoading,
    createAgent,
    listPhoneNumbers,
    buyPhoneNumber,
    registerPhoneNumber,
    makeOutboundCall
  } = useRetell();

  useEffect(() => {
    loadPhoneNumbers();
  }, []);

  const loadPhoneNumbers = async () => {
    const phones = await listPhoneNumbers();
    setAvailablePhones(phones);
  };

  const handleCreateAgent = async () => {
    if (!practice) return;
    
    const agentId = await createAgent(practice.id, agentName || undefined, selectedVoice);
    if (agentId) {
      setAgentName('');
      // Refresh practice data to show new agent ID
      window.location.reload();
    }
  };

  const handleRegisterPhone = async () => {
    if (!selectedPhone || !practice?.retell_agent_id) return;
    
    await registerPhoneNumber(selectedPhone, practice.retell_agent_id);
    loadPhoneNumbers();
  };

  const handleTestCall = async () => {
    if (!testPhoneNumber || !practice?.retell_agent_id) return;
    
    await makeOutboundCall(practice.retell_agent_id, testPhoneNumber, selectedPhone);
    setTestPhoneNumber('');
  };

  const voices = [
    { id: 'Amara', name: 'Amara (Deutsch, Weiblich)' },
    { id: 'Kai', name: 'Kai (Deutsch, Männlich)' },
    { id: 'Sophia', name: 'Sophia (Deutsch, Weiblich)' },
    { id: 'Marcus', name: 'Marcus (Deutsch, Männlich)' }
  ];

  return (
    <div className="space-y-6">
      {/* Agent Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Retell.ai Agent Status
          </CardTitle>
          <CardDescription>
            Verwalten Sie Ihren Retell.ai Sprach-Agenten
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {practice?.retell_agent_id ? (
                <>
                  <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                  <span className="font-medium">Agent aktiv</span>
                  <Badge variant="outline" className="border-success text-success">
                    ID: {practice.retell_agent_id.substring(0, 8)}...
                  </Badge>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-muted rounded-full"></div>
                  <span className="font-medium">Kein Agent erstellt</span>
                  <Badge variant="outline">
                    Inaktiv
                  </Badge>
                </>
              )}
            </div>
            {practice?.retell_agent_id && (
              <Button variant="outline" size="sm" asChild>
                <a 
                  href="https://dashboard.retellai.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Dashboard
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Agent */}
      {!practice?.retell_agent_id && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Neuen Agent erstellen
            </CardTitle>
            <CardDescription>
              Erstellen Sie einen neuen Retell.ai Sprach-Agenten für Ihre Praxis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="agent-name">Agent Name (optional)</Label>
              <Input
                id="agent-name"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder={`${practice?.name || 'Praxis'} AI Assistant`}
              />
            </div>

            <div>
              <Label htmlFor="voice-select">Stimme auswählen</Label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      {voice.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleCreateAgent}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Erstelle Agent...' : 'Agent erstellen'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Phone Management */}
      {practice?.retell_agent_id && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Telefonnummer verwalten
            </CardTitle>
            <CardDescription>
              Verknüpfen Sie eine Telefonnummer mit Ihrem Agent
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {availablePhones.length > 0 && (
              <div>
                <Label htmlFor="phone-select">Verfügbare Nummern</Label>
                <Select value={selectedPhone} onValueChange={setSelectedPhone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Telefonnummer auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePhones.map((phone) => (
                      <SelectItem key={phone.phoneNumber} value={phone.phoneNumber}>
                        {phone.phoneNumber} ({phone.areaCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedPhone && (
                  <Button 
                    onClick={handleRegisterPhone}
                    disabled={isLoading}
                    className="w-full mt-2"
                  >
                    {isLoading ? 'Registriere...' : 'Nummer mit Agent verknüpfen'}
                  </Button>
                )}
              </div>
            )}

            <div className="pt-4 border-t">
              <Label htmlFor="test-phone">Test-Anruf</Label>
              <div className="flex gap-2">
                <Input
                  id="test-phone"
                  type="tel"
                  value={testPhoneNumber}
                  onChange={(e) => setTestPhoneNumber(e.target.value)}
                  placeholder="+49 123 456789"
                />
                <Button 
                  onClick={handleTestCall}
                  disabled={isLoading || !testPhoneNumber || !selectedPhone}
                >
                  {isLoading ? 'Rufe an...' : 'Testen'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Startet einen Test-Anruf an die angegebene Nummer
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RetellAgentManager;