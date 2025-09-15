import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Clock, User, FileText, Save, X, UserPlus, Users, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Link } from "react-router-dom";
import { formatInBerlinTime, nowInBerlin, fromBerlinTime } from "@/lib/dateUtils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePractice } from "@/hooks/usePractice";
import { useConflictDetection } from "@/hooks/useConflictDetection";
import { cn } from "@/lib/utils";
import { useAppointmentWebhook } from "@/hooks/useAppointmentWebhook";

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
}

interface NewPatientData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: Date | null;
  privacy_consent: boolean;
}

interface AppointmentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  appointment?: any;
  isEditing?: boolean;
}

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00"
];

const services = [
  "Erstberatung",
  "Physiotherapie", 
  "Massage",
  "Krankengymnastik",
  "Kontrolle",
  "Manuelle Therapie",
  "Elektrotherapie",
  "Lymphdrainage",
  "Hot Stone Massage",
  "Ultraschalltherapie",
  "Beratungsgespräch",
  "Fango-Packung",
  "Krafttraining",
  "Osteopathie",
  "Pilates"
];

export function AppointmentForm({ onSuccess, onCancel, appointment, isEditing = false }: AppointmentFormProps) {
  const { practice } = usePractice();
  const { toast } = useToast();
  const { triggerWebhook } = useAppointmentWebhook();
  const { checkAppointmentConflicts } = useConflictDetection([]);
  
const [loading, setLoading] = useState(false);
const [patients, setPatients] = useState<Patient[]>([]);
const [appointmentCounts, setAppointmentCounts] = useState<Record<string, number>>({});
const [patientMode, setPatientMode] = useState<'existing' | 'new'>('existing');
  
  const [formData, setFormData] = useState({
    patient_id: appointment?.patient_id || appointment?.patient?.id || "",
    appointment_date: appointment?.appointment_date ? new Date(appointment.appointment_date) : nowInBerlin(),
    appointment_time: appointment?.appointment_time || "",
    service: appointment?.service || "",
    duration_minutes: appointment?.duration_minutes || 30,
    notes: appointment?.notes || "",
    status: appointment?.status || "pending"
  });

  const [newPatientData, setNewPatientData] = useState<NewPatientData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: null,
    privacy_consent: false
  });

  // Update form data when appointment changes
  useEffect(() => {
    if (appointment) {
      setFormData({
        patient_id: appointment.patient_id || appointment.patient?.id || "",
        appointment_date: appointment.appointment_date ? new Date(appointment.appointment_date) : nowInBerlin(),
        appointment_time: appointment.appointment_time || "",
        service: appointment.service || "",
        duration_minutes: appointment.duration_minutes || 30,
        notes: appointment.notes || "",
        status: appointment.status || "pending"
      });
    }
  }, [appointment]);

  useEffect(() => {
    if (practice) {
      loadPatients();
    }
  }, [practice]);

  const createNewPatient = async (): Promise<string | null> => {
    if (!practice) return null;

    // Validate required fields
    if (!newPatientData.first_name.trim() || !newPatientData.last_name.trim()) {
      toast({
        title: "Fehler",
        description: "Vor- und Nachname sind Pflichtfelder für neue Patienten",
        variant: "destructive",
      });
      return null;
    }

    if (!newPatientData.privacy_consent) {
      toast({
        title: "Datenschutz",
        description: "Die Datenschutzerklärung muss akzeptiert werden",
        variant: "destructive",
      });
      return null;
    }

    try {
      const patientDataToInsert = {
        practice_id: practice.id,
        first_name: newPatientData.first_name.trim(),
        last_name: newPatientData.last_name.trim(),
        email: newPatientData.email.trim() || null,
        phone: newPatientData.phone.trim() || null,
        date_of_birth: newPatientData.date_of_birth ? format(newPatientData.date_of_birth, 'yyyy-MM-dd') : null,
        privacy_consent: newPatientData.privacy_consent,
        consent_date: new Date().toISOString(),
        data_retention_until: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 10 years from now
      };

      const { data, error } = await supabase
        .from('patients')
        .insert([patientDataToInsert])
        .select('id, first_name, last_name')
        .single();

      if (error) throw error;

      toast({
        title: "Patient erstellt",
        description: `${data.first_name} ${data.last_name} wurde erfolgreich angelegt`,
      });

      // Reload patients list
      await loadPatients();
      
      return data.id;
    } catch (error: any) {
      console.error('Error creating patient:', error);
      toast({
        title: "Fehler",
        description: error.message || "Patient konnte nicht erstellt werden",
        variant: "destructive",
      });
      return null;
    }
  };
const loadPatients = async () => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('id, first_name, last_name, email, phone')
      .eq('practice_id', practice?.id)
      .order('last_name', { ascending: true });

    if (error) throw error;
    setPatients(data || []);

    // Load appointment counts per patient
    const { data: appts, error: apptErr } = await supabase
      .from('appointments')
      .select('patient_id')
      .eq('practice_id', practice?.id);

    if (!apptErr && appts) {
      const counts: Record<string, number> = {};
      appts.forEach((a: any) => {
        if (a.patient_id) {
          counts[a.patient_id] = (counts[a.patient_id] || 0) + 1;
        }
      });
      setAppointmentCounts(counts);
    }
  } catch (error) {
    console.error('Error loading patients:', error);
    toast({
      title: "Fehler",
      description: "Patienten konnten nicht geladen werden",
      variant: "destructive",
    });
  }
};

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

    let patientId = formData.patient_id;

    // If creating new patient, create patient first
    if (patientMode === 'new' && !isEditing) {
      const newPatientId = await createNewPatient();
      if (!newPatientId) return; // Error already handled in createNewPatient
      patientId = newPatientId;
    }

    if (!patientId || !formData.appointment_time || !formData.service) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Check for duplicate appointments (same patient, date, and time)
      if (!isEditing || (isEditing && appointment && (
        appointment.patient_id !== patientId ||
        appointment.appointment_date !== format(formData.appointment_date, 'yyyy-MM-dd') ||
        appointment.appointment_time !== formData.appointment_time
      ))) {
        const { data: existingAppointment } = await supabase
          .from('appointments')
          .select('id')
          .eq('practice_id', practice.id)
          .eq('patient_id', patientId)
          .eq('appointment_date', format(formData.appointment_date, 'yyyy-MM-dd'))
          .eq('appointment_time', formData.appointment_time)
          .maybeSingle();

        if (existingAppointment) {
          toast({
            title: "Termin bereits vorhanden",
            description: "Für diesen Patienten existiert bereits ein Termin zu diesem Zeitpunkt.",
            variant: "destructive",
          });
          return;
        }
      }

      const appointmentData = {
        practice_id: practice.id,
        patient_id: patientId,
        appointment_date: format(formData.appointment_date, 'yyyy-MM-dd'),
        appointment_time: formData.appointment_time,
        service: formData.service,
        duration_minutes: formData.duration_minutes,
        notes: formData.notes,
        status: formData.status,
      };

      if (isEditing && appointment) {
        const oldData = { ...appointment };
        
        const { data, error } = await supabase
          .from('appointments')
          .update(appointmentData)
          .eq('id', appointment.id)
          .select(`
            *,
            patient:patients (
              id,
              first_name,
              last_name,
              email,
              phone
            )
          `)
          .single();

        if (error) throw error;

        // Trigger webhook for appointment update
        if (data) {
          await triggerWebhook('updated', appointment.id, data, data.patient, oldData);
        }

        toast({
          title: "Erfolg",
          description: "Termin wurde aktualisiert",
        });
      } else {
        const { data, error } = await supabase
          .from('appointments')
          .insert([appointmentData])
          .select(`
            *,
            patient:patients (
              id,
              first_name,
              last_name,
              email,
              phone
            )
          `)
          .single();

        if (error) throw error;

        // Trigger webhook for new appointment
        if (data) {
          await triggerWebhook('created', data.id, data, data.patient);
        }

        toast({
          title: "Erfolg", 
          description: "Termin wurde erstellt",
        });
      }

      onSuccess?.();
    } catch (error: any) {
      console.error('Error saving appointment:', error);
      toast({
        title: "Fehler",
        description: error.message || "Termin konnte nicht gespeichert werden",
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
          <CalendarIcon className="w-5 h-5 text-primary" />
          {isEditing ? "Termin bearbeiten" : "Neuer Termin"}
        </CardTitle>
        <CardDescription>
          {isEditing ? "Bearbeiten Sie die Termindetails" : "Erstellen Sie einen neuen Termin"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection Tabs */}
          {!isEditing && (
            <div className="space-y-4">
              <Label className="text-base font-semibold">Patient auswählen</Label>
              <Tabs value={patientMode} onValueChange={(value) => setPatientMode(value as 'existing' | 'new')} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="existing" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Bestehender Patient
                  </TabsTrigger>
                  <TabsTrigger value="new" className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Neuer Patient
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="existing" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient">Patient auswählen *</Label>
                    <Select
                      value={formData.patient_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, patient_id: value }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Patient auswählen..." />
                      </SelectTrigger>
                      <SelectContent>
{patients.length > 0 ? Array.from(new Map(patients.map(p => [`${p.first_name} ${p.last_name}`.toLowerCase(), p])).values()).map((patient) => (
  <SelectItem key={patient.id} value={patient.id}>
    <div className="flex items-center gap-2">
      <User className="w-4 h-4" />
      {patient.first_name} {patient.last_name}
      {patient.email && (
        <span className="text-muted-foreground text-sm">({patient.email})</span>
      )}
      {appointmentCounts[patient.id] ? (
        <span className="text-muted-foreground text-xs">({appointmentCounts[patient.id]} Termine)</span>
      ) : null}
    </div>
  </SelectItem>
)) : (
  <div className="px-2 py-1.5 text-sm text-muted-foreground">
    Keine Patienten gefunden
  </div>
)}
                      </SelectContent>
                    </Select>
                    {patients.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Keine Patienten vorhanden. Erstellen Sie einen neuen Patienten.
                      </p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="new" className="space-y-4 mt-4">
                  <div className="space-y-4 p-4 bg-accent/30 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <UserPlus className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold">Neuen Patient anlegen</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-first-name">Vorname *</Label>
                        <Input
                          id="new-first-name"
                          value={newPatientData.first_name}
                          onChange={(e) => setNewPatientData(prev => ({ ...prev, first_name: e.target.value }))}
                          placeholder="Max"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-last-name">Nachname *</Label>
                        <Input
                          id="new-last-name"
                          value={newPatientData.last_name}
                          onChange={(e) => setNewPatientData(prev => ({ ...prev, last_name: e.target.value }))}
                          placeholder="Mustermann"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-email">E-Mail</Label>
                        <Input
                          id="new-email"
                          type="email"
                          value={newPatientData.email}
                          onChange={(e) => setNewPatientData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="max@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-phone">Telefon</Label>
                        <Input
                          id="new-phone"
                          value={newPatientData.phone}
                          onChange={(e) => setNewPatientData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+49 123 456789"
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
                              !newPatientData.date_of_birth && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newPatientData.date_of_birth ? (
                              format(newPatientData.date_of_birth, "dd. MMMM yyyy", { locale: de })
                            ) : (
                              <span>Geburtsdatum wählen</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={newPatientData.date_of_birth || undefined}
                            onSelect={(date) => setNewPatientData(prev => ({ ...prev, date_of_birth: date || null }))}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="flex items-start space-x-2 pt-2">
                      <input
                        type="checkbox"
                        id="privacy-consent"
                        checked={newPatientData.privacy_consent}
                        onChange={(e) => setNewPatientData(prev => ({ ...prev, privacy_consent: e.target.checked }))}
                        className="mt-1"
                        required
                      />
                      <Label htmlFor="privacy-consent" className="text-sm leading-relaxed">
                        Ich stimme der Verarbeitung meiner personenbezogenen Daten gemäß der{" "}
                        <Link to="/privacy" target="_blank" className="text-primary hover:underline">
                          Datenschutzerklärung
                        </Link>{" "}
                        zu. *
                      </Label>
                    </div>
                    
                    {!newPatientData.privacy_consent && (
                      <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                        Die Datenschutzerklärung muss akzeptiert werden, um den Patienten anzulegen.
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
              <Separator />
            </div>
          )}

          {/* Existing Patient Selection for Editing */}
          {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="patient">Patient</Label>
              <Select
                value={formData.patient_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, patient_id: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Patient auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {patient.first_name} {patient.last_name}
                        {patient.email && (
                          <span className="text-muted-foreground text-sm">({patient.email})</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Datum *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.appointment_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.appointment_date ? (
                      format(formData.appointment_date, "dd. MMMM yyyy", { locale: de })
                    ) : (
                      <span>Datum wählen</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.appointment_date}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, appointment_date: date }))}
                    disabled={(date) => {
                       // Vergangenheit blockieren
                       const today = nowInBerlin();
                       today.setHours(0, 0, 0, 0);
                       if (date < today) return true;
                       // Wochenenden blockieren (Samstag = 6, Sonntag = 0)
                      const dayOfWeek = date.getDay();
                      return dayOfWeek === 0 || dayOfWeek === 6;
                    }}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Uhrzeit *</Label>
              <Select
                value={formData.appointment_time}
                onValueChange={(value) => setFormData(prev => ({ ...prev, appointment_time: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Zeit auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {time}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Service & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service">Leistung *</Label>
              <Select
                value={formData.service}
                onValueChange={(value) => setFormData(prev => ({ ...prev, service: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Leistung auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Dauer (Minuten)</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                max="240"
                step="15"
                value={formData.duration_minutes}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  duration_minutes: parseInt(e.target.value) || 30 
                }))}
                className="w-full"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Geplant</SelectItem>
                <SelectItem value="confirmed">Bestätigt</SelectItem>
                <SelectItem value="completed">Abgeschlossen</SelectItem>
                <SelectItem value="cancelled">Abgesagt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notizen</Label>
            <Textarea
              id="notes"
              placeholder="Zusätzliche Informationen zum Termin..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 button-gradient"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Speichere..." : (isEditing ? "Aktualisieren" : "Termin erstellen")}
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