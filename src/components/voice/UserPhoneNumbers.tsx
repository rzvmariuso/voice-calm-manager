import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Phone, Plus, Settings, Check, X } from 'lucide-react';
import { useUserPhoneNumbers } from '@/hooks/useUserPhoneNumbers';

export const UserPhoneNumbers: React.FC = () => {
  const { phoneNumbers, isLoading, addPhoneNumber, connectToVapi, deletePhoneNumber, buyVapiNumber, testVapiConnection } = useUserPhoneNumbers();
  const [newPhone, setNewPhone] = useState('');
  const [countryCode, setCountryCode] = useState('DE');
  const [areaCode, setAreaCode] = useState('');

  const handleAddPhone = async () => {
    if (!newPhone.trim()) return;
    
    await addPhoneNumber(newPhone, countryCode, areaCode || undefined);
    setNewPhone('');
    setAreaCode('');
  };

  const handleBuyVapiNumber = async () => {
    await buyVapiNumber(countryCode, areaCode || undefined);
    setAreaCode('');
  };

  const handleDeletePhone = async (phoneId: string) => {
    await deletePhoneNumber(phoneId);
  };

  return (
    <div className="space-y-6">
      {/* Add Phone Number */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Telefonnummer hinzufügen
          </CardTitle>
          <CardDescription>
            Fügen Sie Ihre eigene Nummer hinzu oder erwerben Sie eine neue Vapi-Nummer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="countryCode">Land</Label>
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DE">Deutschland (+49)</SelectItem>
                  <SelectItem value="US">USA (+1)</SelectItem>
                  <SelectItem value="AT">Österreich (+43)</SelectItem>
                  <SelectItem value="CH">Schweiz (+41)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="areaCode">Vorwahl (Optional)</Label>
              <Input
                id="areaCode"
                value={areaCode}
                onChange={(e) => setAreaCode(e.target.value)}
                placeholder="030, 089, etc."
              />
            </div>
            
            <div>
              <Label htmlFor="phoneNumber">Telefonnummer</Label>
              <Input
                id="phoneNumber"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+49 30 12345678"
              />
            </div>
            
            <div className="flex items-end gap-2">
              <Button 
                onClick={handleAddPhone}
                disabled={isLoading || !newPhone.trim()}
                className="flex-1"
              >
                Hinzufügen
              </Button>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Oder neue Vapi-Nummer kaufen</h4>
                <p className="text-sm text-muted-foreground">
                  Automatisch konfiguriert für Voice AI
                </p>
              </div>
              <Button 
                onClick={handleBuyVapiNumber}
                disabled={isLoading}
                variant="outline"
              >
                Vapi-Nummer kaufen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phone Numbers List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Meine Telefonnummern
          </CardTitle>
          <CardDescription>
            Verwalten Sie Ihre Telefonnummern und Vapi-Verbindungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {phoneNumbers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Noch keine Telefonnummern vorhanden
            </div>
          ) : (
            <div className="space-y-4">
              {phoneNumbers.map((phone) => (
                <div 
                  key={phone.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{phone.phone_number}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {phone.country_code}
                        </Badge>
                        <Badge 
                          variant={phone.provider === 'vapi' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {phone.provider}
                        </Badge>
                        {phone.is_verified && (
                          <Badge variant="secondary" className="text-xs flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Verifiziert
                          </Badge>
                        )}
                        {phone.vapi_assistant_id && (
                          <Badge variant="default" className="text-xs flex items-center gap-1">
                            <Settings className="h-3 w-3" />
                            Vapi AI aktiv
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {!phone.vapi_phone_id && phone.provider !== 'vapi' && (
                      <Button
                        onClick={() => connectToVapi(phone.id)}
                        disabled={isLoading}
                        size="sm"
                        variant="outline"
                      >
                        Mit Vapi verbinden
                      </Button>
                    )}
                    
                    {phone.vapi_phone_id && (
                      <Button
                        onClick={() => testVapiConnection(phone.id)}
                        disabled={isLoading}
                        size="sm"
                        variant="default"
                      >
                        Vapi testen
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => handleDeletePhone(phone.id)}
                      disabled={isLoading}
                      size="sm"
                      variant="destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    
                    <Badge 
                      variant={phone.is_active ? 'default' : 'secondary'}
                      className="px-3 py-1"
                    >
                      {phone.is_active ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPhoneNumbers;