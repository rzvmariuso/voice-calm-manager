import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PRACTICE_TYPES, PracticeType } from "@/constants/practiceTypes";
import { cn } from "@/lib/utils";

interface PracticeTypeSelectorProps {
  selectedType: PracticeType | null;
  onSelect: (type: PracticeType) => void;
}

export function PracticeTypeSelector({ selectedType, onSelect }: PracticeTypeSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">Welche Art von Praxis führen Sie?</h2>
        <p className="text-muted-foreground mt-2">
          Wählen Sie Ihren Praxistyp aus, um passende Services und AI-Unterstützung zu erhalten
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(PRACTICE_TYPES).map(([key, config]) => (
          <Card
            key={key}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-lg border-2",
              selectedType === key
                ? "border-primary bg-primary/5 shadow-md scale-105"
                : "border-border hover:border-primary/50"
            )}
            onClick={() => onSelect(key as PracticeType)}
          >
            <CardHeader className="text-center">
              <div className="text-4xl mb-2">{config.icon}</div>
              <CardTitle className="text-xl">{config.name}</CardTitle>
              <CardDescription className="text-sm">
                {config.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">Beispiel-Services:</p>
                <ul className="list-disc list-inside space-y-1">
                  {config.defaultServices.slice(0, 3).map((service, index) => (
                    <li key={index}>{service.name}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}