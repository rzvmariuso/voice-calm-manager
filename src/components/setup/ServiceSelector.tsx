import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { PRACTICE_TYPES, PracticeType, ServiceTemplate } from "@/constants/practiceTypes";

interface ServiceSelectorProps {
  practiceType: PracticeType;
  selectedServices: ServiceTemplate[];
  onServicesChange: (services: ServiceTemplate[]) => void;
}

export function ServiceSelector({ practiceType, selectedServices, onServicesChange }: ServiceSelectorProps) {
  const [customService, setCustomService] = useState({ name: "", description: "", duration: 30 });
  const practiceConfig = PRACTICE_TYPES[practiceType];

  const toggleService = (service: ServiceTemplate, checked: boolean) => {
    if (checked) {
      onServicesChange([...selectedServices, service]);
    } else {
      onServicesChange(selectedServices.filter(s => s.name !== service.name));
    }
  };

  const addCustomService = () => {
    if (customService.name.trim()) {
      onServicesChange([...selectedServices, { ...customService }]);
      setCustomService({ name: "", description: "", duration: 30 });
    }
  };

  const removeCustomService = (serviceName: string) => {
    onServicesChange(selectedServices.filter(s => s.name !== serviceName));
  };

  const isServiceSelected = (serviceName: string) => {
    return selectedServices.some(s => s.name === serviceName);
  };

  const isDefaultService = (serviceName: string) => {
    return practiceConfig.defaultServices.some(s => s.name === serviceName);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">Services auswählen</h2>
        <p className="text-muted-foreground mt-2">
          Wählen Sie die Services aus, die Sie in Ihrer {practiceConfig.name} anbieten
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">{practiceConfig.icon}</span>
            Empfohlene Services für {practiceConfig.name}
          </CardTitle>
          <CardDescription>
            Diese Services sind speziell für Ihren Praxistyp empfohlen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {practiceConfig.defaultServices.map((service) => (
            <div key={service.name} className="flex items-start space-x-3">
              <Checkbox
                id={service.name}
                checked={isServiceSelected(service.name)}
                onCheckedChange={(checked) => toggleService(service, checked as boolean)}
              />
              <div className="flex-1">
                <Label htmlFor={service.name} className="font-medium cursor-pointer">
                  {service.name}
                </Label>
                <p className="text-sm text-muted-foreground">{service.description}</p>
                <p className="text-xs text-muted-foreground">{service.duration} Minuten</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Eigene Services hinzufügen</CardTitle>
          <CardDescription>
            Fügen Sie weitere individuelle Services hinzu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="serviceName">Service Name</Label>
              <Input
                id="serviceName"
                value={customService.name}
                onChange={(e) => setCustomService({ ...customService, name: e.target.value })}
                placeholder="z.B. Spezialbehandlung"
              />
            </div>
            <div>
              <Label htmlFor="serviceDescription">Beschreibung</Label>
              <Input
                id="serviceDescription"
                value={customService.description}
                onChange={(e) => setCustomService({ ...customService, description: e.target.value })}
                placeholder="Kurze Beschreibung"
              />
            </div>
            <div>
              <Label htmlFor="serviceDuration">Dauer (Minuten)</Label>
              <Input
                id="serviceDuration"
                type="number"
                min="5"
                max="240"
                value={customService.duration}
                onChange={(e) => setCustomService({ ...customService, duration: parseInt(e.target.value) || 30 })}
              />
            </div>
          </div>
          <Button onClick={addCustomService} className="w-full" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Service hinzufügen
          </Button>
        </CardContent>
      </Card>

      {selectedServices.some(s => !isDefaultService(s.name)) && (
        <Card>
          <CardHeader>
            <CardTitle>Ihre eigenen Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {selectedServices
              .filter(s => !isDefaultService(s.name))
              .map((service) => (
                <div key={service.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-muted-foreground">{service.description} · {service.duration} Min</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCustomService(service.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      <div className="text-center text-sm text-muted-foreground">
        {selectedServices.length} Service(s) ausgewählt
      </div>
    </div>
  );
}