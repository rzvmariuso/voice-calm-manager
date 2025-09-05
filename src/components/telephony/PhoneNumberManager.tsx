import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Phone, Plus, TestTube, Trash2, Power } from 'lucide-react';
import { usePhoneNumbers } from '@/hooks/useUserPhoneNumbers';

export const PhoneNumberManager: React.FC = () => {
  const { phoneNumbers, isLoading, addPhoneNumber, togglePhoneNumber, testConnection, deletePhoneNumber } = usePhoneNumbers();
  const [newPhone, setNewPhone] = useState('');
  const [countryCode, setCountryCode] = useState('DE');
  const [areaCode, setAreaCode] = useState('');

  const handleAddPhone = async () => {
    if (!newPhone.trim()) return;
    
    await addPhoneNumber(newPhone, countryCode, areaCode || undefined);
    setNewPhone('');
    setAreaCode('');
  };

  const handleDeletePhone = async (phoneId: string) => {
    await deletePhoneNumber(phoneId);
  };

  const handleTogglePhone = async (phoneId: string, currentActive: boolean) => {
    await togglePhoneNumber(phoneId, !currentActive);
  };

  const handleTestConnection = async (phoneId: string) => {
    await testConnection(phoneId);
  };

  return (
    <div className="space-y-6">
      {/* Neue Nummer hinzufügen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Neue Telefonnummer hinzufügen
          </CardTitle>
          <CardDescription>
            Tragen Sie Ihre Telefonnummer ein. Sie können diese dann mit der AI verbinden.
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
            
            <div className="flex items-end">
              <Button 
                onClick={handleAddPhone}
                disabled={isLoading || !newPhone.trim()}
                className="w-full"
              >
                Hinzufügen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Telefonnummern verwalten */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Meine Telefonnummern
          </CardTitle>
          <CardDescription>
            Verwalten Sie Ihre Telefonnummern und testen Sie die AI-Verbindung
          </CardDescription>
        </CardHeader>
        <CardContent>
          {phoneNumbers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Noch keine Telefonnummern vorhanden</p>
              <p className="text-sm">Fügen Sie oben eine Nummer hinzu, um zu beginnen</p>
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
                        {phone.area_code && (
                          <Badge variant="secondary" className="text-xs">
                            {phone.area_code}
                          </Badge>
                        )}
                        <Badge 
                          variant={phone.is_active ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {phone.is_active ? 'Aktiv' : 'Inaktiv'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Aktivieren/Deaktivieren */}
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`active-${phone.id}`} className="text-sm">
                        {phone.is_active ? 'Aktiv' : 'Inaktiv'}
                      </Label>
                      <Switch
                        id={`active-${phone.id}`}
                        checked={phone.is_active}
                        onCheckedChange={() => handleTogglePhone(phone.id, phone.is_active)}
                        disabled={isLoading}
                      />
                    </div>

                    {/* Test-Button */}
                    <Button
                      onClick={() => handleTestConnection(phone.id)}
                      disabled={isLoading || !phone.is_active}
                      size="sm"
                      variant="outline"
                    >
                      <TestTube className="h-4 w-4" />
                      Test AI
                    </Button>

                    {/* Löschen-Button */}
                    <Button
                      onClick={() => handleDeletePhone(phone.id)}
                      disabled={isLoading}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

export default PhoneNumberManager;