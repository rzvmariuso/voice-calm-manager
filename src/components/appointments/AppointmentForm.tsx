import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, User, FileText, Save, X } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePractice } from "@/hooks/usePractice";
import { cn } from "@/lib/utils";
import { useAppointmentWebhook } from "@/hooks/useAppointmentWebhook";

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
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
  "Beratung",
  "Behandlung", 
  "Kontrolle",
  "Ersttermin",
  "Nachsorge",
  "Diagnose"
];

export function AppointmentForm({ onSuccess, onCancel, appointment, isEditing = false }: AppointmentFormProps) {
  const { practice } = usePractice();
  const { toast } = useToast();
  const { triggerWebhook } = useAppointmentWebhook();
  
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [formData, setFormData] = useState({
    patient_id: appointment?.patient_id || "",
    appointment_date: appointment?.appointment_date ? new Date(appointment.appointment_date) : new Date(),
    appointment_time: appointment?.appointment_time || "",
    service: appointment?.service || "",
    duration_minutes: appointment?.duration_minutes || 30,
    notes: appointment?.notes || "",
    status: appointment?.status || "pending"
  });

  useEffect(() => {
    if (practice) {
      loadPatients();
    }
  }, [practice]);

  const loadPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, email, phone')
        .eq('practice_id', practice?.id)
        .order('last_name', { ascending: true });

      if (error) throw error;
      setPatients(data || []);
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

    if (!formData.patient_id || !formData.appointment_time || !formData.service) {
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
        appointment.patient_id !== formData.patient_id ||
        appointment.appointment_date !== format(formData.appointment_date, 'yyyy-MM-dd') ||
        appointment.appointment_time !== formData.appointment_time
      ))) {
        const { data: existingAppointment, error: checkError } = await supabase
          .from('appointments')
          .select('id')
          .eq('practice_id', practice.id)
          .eq('patient_id', formData.patient_id)
          .eq('appointment_date', format(formData.appointment_date, 'yyyy-MM-dd'))
          .eq('appointment_time', formData.appointment_time)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

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
        patient_id: formData.patient_id,
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
          {/* Patient Selection */}
          <div className="space-y-2">
            <Label htmlFor="patient">Patient *</Label>
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
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
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