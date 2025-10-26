import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { PRACTICE_TYPES } from "@/constants/practiceTypes";

interface EnhancedPracticeTypeSelectorProps {
  selectedType: string;
  onSelect: (type: string) => void;
}

export function EnhancedPracticeTypeSelector({ selectedType, onSelect }: EnhancedPracticeTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-2xl font-bold">Welche Art von Praxis betreiben Sie?</h2>
        <p className="text-muted-foreground">
          Wir passen VoxCal automatisch an Ihre Branche an
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.values(PRACTICE_TYPES).map((type) => {
          const isSelected = selectedType === type.id;
          
          return (
            <Card
              key={type.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected 
                  ? 'border-primary ring-2 ring-primary ring-offset-2' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => onSelect(type.id)}
            >
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                    isSelected 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    {type.icon}
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <CardTitle className="text-lg">{type.name}</CardTitle>
                  <CardDescription className="mt-1.5">
                    {type.description}
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-2">Typische Services:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {type.defaultServices.slice(0, 3).map((service, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {service.name}
                        </Badge>
                      ))}
                      {type.defaultServices.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{type.defaultServices.length - 3} mehr
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Features:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Branchenspezifisches Dashboard</li>
                      <li>• Vorkonfigurierte Termine</li>
                      <li>• Optimierte KI-Prompts</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedType && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Gut gewählt!</strong> VoxCal wird automatisch mit Services, 
            Öffnungszeiten und KI-Einstellungen für {Object.values(PRACTICE_TYPES).find(t => t.id === selectedType)?.name} konfiguriert.
          </p>
        </div>
      )}
    </div>
  );
}