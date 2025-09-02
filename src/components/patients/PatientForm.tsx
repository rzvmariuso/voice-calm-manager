import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, User, Phone, Mail, Save, X, FileText } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePractice } from "@/hooks/usePractice";
import { cn } from "@/lib/utils";

interface PatientFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  patient?: any;
  isEditing?: boolean;
}

export function PatientForm({ onSuccess, onCancel, patient, isEditing = false }: PatientFormProps) {
  const { practice } = usePractice();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: patient?.first_name || "",
    last_name: patient?.last_name || "",
    email: patient?.email || "",
    phone: patient?.phone || "",
    date_of_birth: patient?.date_of_birth ? new Date(patient.date_of_birth) : undefined,
    privacy_consent: patient?.privacy_consent || false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!practice) {
      toast({
        title: "Fehler",
        description: "Praxis nicht gefunden",
        variant: "destructive",
      });
      return;
    }

    if (!formData.first_name || !formData.last_name || !formData.privacy_consent) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus und bestätigen Sie die Datenschutzerklärung",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const patientData = {
        practice_id: practice.id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email || null,
        phone: formData.phone || null,
        date_of_birth: formData.date_of_birth ? format(formData.date_of_birth, 'yyyy-MM-dd') : null,
        privacy_consent: formData.privacy_consent,
        consent_date: formData.privacy_consent ? new Date().toISOString() : null,
      };

      if (isEditing && patient) {
        const { error } = await supabase
          .from('patients')
          .update(patientData)
          .eq('id', patient.id);

        if (error) throw error;

        toast({
          title: "Erfolg",
          description: "Patient wurde aktualisiert",
        });
      } else {
        const { error } = await supabase
          .from('patients')
          .insert([patientData]);

        if (error) throw error;

        toast({
          title: "Erfolg", 
          description: "Patient wurde erstellt",
        });
      }

      onSuccess?.();
    } catch (error: any) {
      console.error('Error saving patient:', error);
      toast({
        title: "Fehler",
        description: error.message || "Patient konnte nicht gespeichert werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          {isEditing ? "Patient bearbeiten" : "Neuer Patient"}
        </CardTitle>
        <CardDescription>
          {isEditing ? "Bearbeiten Sie die Patientendaten" : "Erstellen Sie einen neuen Patienten"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Persönliche Daten</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Vorname *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  placeholder="Max"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Nachname *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  placeholder="Mustermann"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Geburtsdatum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date_of_birth && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date_of_birth ? (
                      format(formData.date_of_birth, "dd. MMMM yyyy", { locale: de })
                    ) : (
                      <span>Geburtsdatum wählen</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date_of_birth}
                    onSelect={(date) => setFormData(prev => ({ ...prev, date_of_birth: date }))}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Kontaktdaten</h3>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="max@beispiel.de"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+49 123 456789"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Privacy Consent */}
          <div className="space-y-4 border-t border-border pt-4">
            <h3 className="text-lg font-medium text-foreground">Datenschutz</h3>
            
            <div className="flex items-start space-x-3">
              <Checkbox
                id="privacy_consent"
                checked={formData.privacy_consent}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, privacy_consent: !!checked }))
                }
                className="mt-1"
              />
              <div className="space-y-1">
                <Label 
                  htmlFor="privacy_consent" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Datenschutzerklärung akzeptiert *
                </Label>
                <p className="text-sm text-muted-foreground">
                  Ich stimme der Verarbeitung meiner personenbezogenen Daten gemäß der 
                  Datenschutzerklärung zu. Die Daten werden für die Terminverwaltung und 
                  medizinische Dokumentation verwendet.
                </p>
                {!isEditing && (
                  <p className="text-xs text-muted-foreground">
                    Speicherfrist: 10 Jahre ab der letzten Behandlung (gesetzliche Aufbewahrungspflicht)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={loading || !formData.privacy_consent}
              className="flex-1 button-gradient"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Speichere..." : (isEditing ? "Aktualisieren" : "Patient erstellen")}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                <X className="w-4 h-4 mr-2" />
                Abbrechen
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}