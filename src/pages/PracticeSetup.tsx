import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { PracticeTypeSelector } from "@/components/setup/PracticeTypeSelector";
import { ServiceSelector } from "@/components/setup/ServiceSelector";
import { PracticeType, PRACTICE_TYPES, ServiceTemplate } from "@/constants/practiceTypes";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface BusinessHours {
  [key: string]: {
    open?: string;
    close?: string;
    closed?: boolean;
  };
}

export default function PracticeSetup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [practiceType, setPracticeType] = useState<PracticeType | null>(null);
  const [selectedServices, setSelectedServices] = useState<ServiceTemplate[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
    ai_prompt: "",
  });
  const [businessHours, setBusinessHours] = useState<BusinessHours>({
    monday: { open: "09:00", close: "17:00" },
    tuesday: { open: "09:00", close: "17:00" },
    wednesday: { open: "09:00", close: "17:00" },
    thursday: { open: "09:00", close: "17:00" },
    friday: { open: "09:00", close: "17:00" },
    saturday: { closed: true },
    sunday: { closed: true },
  });
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Check if user already has a practice
    const checkExistingPractice = async () => {
      try {
        const { data, error } = await supabase
          .from('practices')
          .select('id')
          .eq('owner_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking practice:', error);
        } else if (data) {
          // User already has a practice, redirect to dashboard
          navigate("/");
          return;
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setCheckingExisting(false);
      }
    };

    checkExistingPractice();
  }, [user, navigate]);

  const handleBusinessHourChange = (day: string, field: string, value: string | boolean) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !practiceType) {
      toast({
        title: "Fehler",
        description: "Sie müssen angemeldet sein und einen Praxistyp auswählen.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create practice with practice_type
      const { data: practice, error: practiceError } = await supabase
        .from("practices")
        .insert([
          {
            owner_id: user.id,
            name: formData.name,
            address: formData.address,
            phone: formData.phone,
            email: formData.email,
            business_hours: businessHours,
            practice_type: practiceType,
            ai_prompt: formData.ai_prompt || PRACTICE_TYPES[practiceType].aiPrompt,
          },
        ])
        .select()
        .single();

      if (practiceError) throw practiceError;

      // Create services for the practice
      if (selectedServices.length > 0) {
        const servicesData = selectedServices.map((service, index) => ({
          practice_id: practice.id,
          name: service.name,
          description: service.description,
          duration_minutes: service.duration,
          price: service.price,
          is_active: true,
          display_order: index,
        }));

        const { error: servicesError } = await supabase
          .from("practice_services")
          .insert(servicesData);

        if (servicesError) throw servicesError;
      }

      toast({
        title: "Praxis erfolgreich eingerichtet!",
        description: `Ihre ${PRACTICE_TYPES[practiceType].name} wurde mit ${selectedServices.length} Services erstellt.`,
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Fehler beim Erstellen der Praxis",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !practiceType) {
      toast({
        title: "Praxistyp auswählen",
        description: "Bitte wählen Sie einen Praxistyp aus.",
        variant: "destructive",
      });
      return;
    }
    if (currentStep === 2 && selectedServices.length === 0) {
      toast({
        title: "Services auswählen",
        description: "Bitte wählen Sie mindestens einen Service aus.",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handlePracticeTypeSelect = (type: PracticeType) => {
    setPracticeType(type);
    // Auto-select recommended services
    setSelectedServices([...PRACTICE_TYPES[type].defaultServices]);
    // Set default AI prompt
    setFormData(prev => ({
      ...prev,
      ai_prompt: PRACTICE_TYPES[type].aiPrompt
    }));
  };

  if (checkingExisting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Praxis einrichten
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Schritt {currentStep} von 3: {
                currentStep === 1 ? "Praxistyp auswählen" :
                currentStep === 2 ? "Services konfigurieren" :
                "Praxisdaten eingeben"
              }
            </p>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <PracticeTypeSelector
                selectedType={practiceType}
                onSelect={handlePracticeTypeSelect}
              />
            )}

            {currentStep === 2 && practiceType && (
              <ServiceSelector
                practiceType={practiceType}
                selectedServices={selectedServices}
                onServicesChange={setSelectedServices}
              />
            )}

            {currentStep === 3 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold">Praxisdaten eingeben</h3>
                  <p className="text-muted-foreground">
                    Geben Sie die Details für Ihre {practiceType && PRACTICE_TYPES[practiceType].name} ein
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Praxisname *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Dr. Mustermann Praxis"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefonnummer</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+49 123 456789"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Musterstraße 123, 12345 Musterstadt"
                  />
                </div>

                <div>
                  <Label htmlFor="email">E-Mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="info@praxis-mustermann.de"
                  />
                </div>

                <div>
                  <Label>Öffnungszeiten</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {Object.entries(businessHours).map(([day, hours]) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Label className="w-20 capitalize">
                          {day === 'monday' ? 'Montag' : 
                           day === 'tuesday' ? 'Dienstag' :
                           day === 'wednesday' ? 'Mittwoch' :
                           day === 'thursday' ? 'Donnerstag' :
                           day === 'friday' ? 'Freitag' :
                           day === 'saturday' ? 'Samstag' : 'Sonntag'}
                        </Label>
                        {hours.closed ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                              Geschlossen
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleBusinessHourChange(day, "closed", false)
                              }
                            >
                              Öffnen
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Input
                              type="time"
                              value={hours.open}
                              onChange={(e) =>
                                handleBusinessHourChange(day, "open", e.target.value)
                              }
                              className="w-24"
                            />
                            <span>-</span>
                            <Input
                              type="time"
                              value={hours.close}
                              onChange={(e) =>
                                handleBusinessHourChange(day, "close", e.target.value)
                              }
                              className="w-24"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleBusinessHourChange(day, "closed", true)
                              }
                            >
                              Schließen
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="ai_prompt">
                    AI-Assistent Anweisungen
                  </Label>
                  <Textarea
                    id="ai_prompt"
                    value={formData.ai_prompt}
                    onChange={(e) =>
                      setFormData({ ...formData, ai_prompt: e.target.value })
                    }
                    placeholder="Diese Anweisungen wurden basierend auf Ihrem Praxistyp vorgegeben..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Diese Anweisungen wurden automatisch für Ihren Praxistyp angepasst
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <LoadingSpinner /> : "Praxis einrichten"}
                </Button>
              </form>
            )}

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück
              </Button>
              
              {currentStep < 3 && (
                <Button onClick={handleNextStep}>
                  Weiter
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}