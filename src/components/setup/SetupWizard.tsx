import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building2, 
  Clock, 
  Bot, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Phone,
  Mail
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface SetupWizardProps {
  onComplete: () => void;
}

interface PracticeData {
  name: string;
  address: string;
  phone: string;
  email: string;
  business_hours: {
    monday: { open: string; close: string; closed?: boolean };
    tuesday: { open: string; close: string; closed?: boolean };
    wednesday: { open: string; close: string; closed?: boolean };
    thursday: { open: string; close: string; closed?: boolean };
    friday: { open: string; close: string; closed?: boolean };
    saturday: { open: string; close: string; closed?: boolean };
    sunday: { open: string; close: string; closed?: boolean };
  };
  ai_prompt: string;
}

const STEPS = [
  { id: 1, title: "Praxisdaten", description: "Grundlegende Informationen" },
  { id: 2, title: "Öffnungszeiten", description: "Sprechzeiten festlegen" },
  { id: 3, title: "KI-Assistent", description: "Terminbuchung personalisieren" },
  { id: 4, title: "Fertig", description: "Setup abschließen" }
];

const DEFAULT_BUSINESS_HOURS = {
  monday: { open: "09:00", close: "17:00" },
  tuesday: { open: "09:00", close: "17:00" },
  wednesday: { open: "09:00", close: "17:00" },
  thursday: { open: "09:00", close: "17:00" },
  friday: { open: "09:00", close: "17:00" },
  saturday: { closed: true, open: "09:00", close: "17:00" },
  sunday: { closed: true, open: "09:00", close: "17:00" }
};

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [practiceData, setPracticeData] = useState<PracticeData>({
    name: "",
    address: "",
    phone: "",
    email: user?.email || "",
    business_hours: DEFAULT_BUSINESS_HOURS,
    ai_prompt: "Sie sind ein freundlicher AI-Assistent für Terminbuchungen. Helfen Sie Patienten dabei, Termine zu buchen und allgemeine Fragen zu beantworten."
  });

  const progress = (currentStep / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) {
      toast({
        title: "Fehler",
        description: "Benutzer nicht angemeldet",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('practices')
        .insert([{
          owner_id: user.id,
          name: practiceData.name,
          address: practiceData.address,
          phone: practiceData.phone,
          email: practiceData.email,
          business_hours: practiceData.business_hours,
          ai_prompt: practiceData.ai_prompt,
        }]);

      if (error) throw error;

      toast({
        title: "Setup erfolgreich!",
        description: "Ihre Praxis wurde erfolgreich eingerichtet.",
      });

      onComplete();
    } catch (error: any) {
      console.error('Setup error:', error);
      toast({
        title: "Setup-Fehler",
        description: error.message || "Das Setup konnte nicht abgeschlossen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBusinessHours = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setPracticeData(prev => ({
      ...prev,
      business_hours: {
        ...prev.business_hours,
        [day]: {
          ...prev.business_hours[day as keyof typeof prev.business_hours],
          [field]: value
        }
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gradient">Praxis-Setup</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Richten Sie Ihre Praxis in wenigen Schritten ein
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">
              Schritt {currentStep} von {STEPS.length}
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round(progress)}% abgeschlossen
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps Navigation */}
        <div className="flex items-center justify-center mb-8 space-x-4">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                step.id === currentStep
                  ? 'bg-primary text-primary-foreground'
                  : step.id < currentStep
                  ? 'bg-success/20 text-success'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step.id < currentStep ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-current opacity-20"></span>
              )}
              <div className="hidden sm:block">
                <div className="text-sm font-medium">{step.title}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStep === 1 && <Building2 className="w-5 h-5 text-primary" />}
              {currentStep === 2 && <Clock className="w-5 h-5 text-primary" />}
              {currentStep === 3 && <Bot className="w-5 h-5 text-primary" />}
              {currentStep === 4 && <CheckCircle className="w-5 h-5 text-success" />}
              {STEPS[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              {STEPS[currentStep - 1].description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Basic Practice Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="practice-name">Praxisname *</Label>
                  <Input
                    id="practice-name"
                    placeholder="Dr. Mustermann Allgemeinmedizin"
                    value={practiceData.name}
                    onChange={(e) => setPracticeData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse *</Label>
                  <Textarea
                    id="address"
                    placeholder="Musterstraße 123&#10;12345 Berlin"
                    value={practiceData.address}
                    onChange={(e) => setPracticeData(prev => ({ ...prev, address: e.target.value }))}
                    className="min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+49 30 12345678"
                      value={practiceData.phone}
                      onChange={(e) => setPracticeData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-Mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="praxis@beispiel.de"
                      value={practiceData.email}
                      onChange={(e) => setPracticeData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Business Hours */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Legen Sie Ihre Sprechzeiten fest. Diese werden für die automatische Terminbuchung verwendet.
                </p>
                
                <div className="space-y-3">
                  {Object.entries(practiceData.business_hours).map(([day, hours]) => (
                    <div key={day} className="flex items-center gap-4 p-3 border border-border rounded-lg">
                      <div className="w-20 text-sm font-medium capitalize">
                        {day === 'monday' && 'Montag'}
                        {day === 'tuesday' && 'Dienstag'}
                        {day === 'wednesday' && 'Mittwoch'}
                        {day === 'thursday' && 'Donnerstag'}
                        {day === 'friday' && 'Freitag'}
                        {day === 'saturday' && 'Samstag'}
                        {day === 'sunday' && 'Sonntag'}
                      </div>
                      
                      <div className="flex items-center gap-2 flex-1">
                        <Select
                          value={hours.closed ? 'closed' : 'open'}
                          onValueChange={(value) => updateBusinessHours(day, 'closed', value === 'closed')}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Offen</SelectItem>
                            <SelectItem value="closed">Geschlossen</SelectItem>
                          </SelectContent>
                        </Select>

                        {!hours.closed && (
                          <>
                            <Input
                              type="time"
                              value={hours.open}
                              onChange={(e) => updateBusinessHours(day, 'open', e.target.value)}
                              className="w-32"
                            />
                            <span className="text-muted-foreground">bis</span>
                            <Input
                              type="time"
                              value={hours.close}
                              onChange={(e) => updateBusinessHours(day, 'close', e.target.value)}
                              className="w-32"
                            />
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: AI Assistant */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-5 h-5 text-primary" />
                    <h4 className="font-medium text-primary">KI-Terminassistent</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Passen Sie das Verhalten Ihres KI-Assistenten für die automatische Terminbuchung an. 
                    Dieser Text bestimmt, wie der Assistent mit Ihren Patienten interagiert.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ai-prompt">Assistent-Verhalten</Label>
                  <Textarea
                    id="ai-prompt"
                    value={practiceData.ai_prompt}
                    onChange={(e) => setPracticeData(prev => ({ ...prev, ai_prompt: e.target.value }))}
                    className="min-h-[120px]"
                    placeholder="Beschreiben Sie, wie sich Ihr KI-Assistent verhalten soll..."
                  />
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Beispiel-Prompts:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• "Sie sind ein höflicher Assistent einer Allgemeinpraxis..."</li>
                    <li>• "Sprechen Sie Patienten freundlich und professionell an..."</li>
                    <li>• "Bei Notfällen verweisen Sie an die Notaufnahme..."</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 4: Complete */}
            {currentStep === 4 && (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">Setup fast abgeschlossen!</h3>
                  <p className="text-muted-foreground">
                    Überprüfen Sie Ihre Eingaben und schließen Sie das Setup ab.
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 text-left">
                  <h4 className="font-medium mb-3">Zusammenfassung:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Praxis:</span>
                      <span className="font-medium">{practiceData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">E-Mail:</span>
                      <span className="font-medium">{practiceData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">KI-Assistent:</span>
                      <span className="font-medium text-success">Konfiguriert</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück
              </Button>

              {currentStep < STEPS.length ? (
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !practiceData.name) ||
                    (currentStep === 1 && !practiceData.address)
                  }
                  className="button-gradient"
                >
                  Weiter
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={loading}
                  className="button-gradient"
                >
                  {loading ? "Setup wird abgeschlossen..." : "Setup abschließen"}
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}