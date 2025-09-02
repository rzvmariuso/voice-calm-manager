import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Repeat, 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Play,
  Pause,
  Users,
  UserPlus
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePractice } from "@/hooks/usePractice";
import { cn } from "@/lib/utils";

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
}

interface RecurringAppointment {
  id: string;
  practice_id: string;
  patient_id: string;
  service: string;
  duration_minutes: number;
  notes: string | null;
  recurrence_type: string; // Changed from union to string to match DB
  recurrence_interval: number;
  days_of_week: number[] | null;
  day_of_month: number | null;
  start_time: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  patient?: Patient;
}

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

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00"
];

const weekDays = [
  { value: 1, label: 'Mo' },
  { value: 2, label: 'Di' },
  { value: 3, label: 'Mi' },
  { value: 4, label: 'Do' },
  { value: 5, label: 'Fr' },
  { value: 6, label: 'Sa' },
  { value: 0, label: 'So' }
];

export function RecurringAppointments() {
  const { practice } = usePractice();
  const { toast } = useToast();
const [recurringAppointments, setRecurringAppointments] = useState<RecurringAppointment[]>([]);
const [patients, setPatients] = useState<Patient[]>([]);
const [loading, setLoading] = useState(true);
const [dialogOpen, setDialogOpen] = useState(false);
const [newPatientDialogOpen, setNewPatientDialogOpen] = useState(false);
const [appointmentCounts, setAppointmentCounts] = useState<Record<string, number>>({});
  
  const [formData, setFormData] = useState({
    patient_id: "",
    service: "",
    duration_minutes: 30,
    notes: "",
    recurrence_type: "weekly" as 'daily' | 'weekly' | 'monthly',
    recurrence_interval: 1,
    days_of_week: [] as number[],
    day_of_month: 1,
    start_time: "",
    start_date: new Date(),
    end_date: null as Date | null,
  });

  const [newPatientData, setNewPatientData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    date_of_birth: null as Date | null,
  });

  useEffect(() => {
    if (practice) {
      loadData();
    }
  }, [practice]);

  const loadData = async () => {
    if (!practice) return;

    try {
      setLoading(true);

// Load patients first (this is critical for the form)
const { data: patientsData, error: patientsError } = await supabase
  .from('patients')
  .select('id, first_name, last_name')
  .eq('practice_id', practice.id)
  .order('last_name', { ascending: true });

if (patientsError) throw patientsError;

// Load appointment counts per patient
const { data: appts, error: apptErr } = await supabase
  .from('appointments')
  .select('patient_id')
  .eq('practice_id', practice.id);

if (!apptErr && appts) {
  const counts: Record<string, number> = {};
  appts.forEach((a: any) => {
    if (a.patient_id) {
      counts[a.patient_id] = (counts[a.patient_id] || 0) + 1;
    }
  });
  setAppointmentCounts(counts);
}

// Load recurring appointments with a simpler query first, then enrich with patient data
const { data: recurringData, error: recurringError } = await supabase
  .from('recurring_appointments')
  .select('*')
  .eq('practice_id', practice.id)
  .order('created_at', { ascending: false });

if (recurringError) throw recurringError;

// Enrich recurring appointments with patient data
const appointmentsWithPatients = (recurringData || []).map(item => {
  const patient = patientsData?.find(p => p.id === item.patient_id);
  return {
    ...item,
    patient: patient || undefined
  };
});

setRecurringAppointments(appointmentsWithPatients as RecurringAppointment[]);
setPatients(patientsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Fehler",
        description: "Daten konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!practice || !formData.patient_id || !formData.service || !formData.start_time) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus",
        variant: "destructive",
      });
      return;
    }

    try {
      const recurringData = {
        practice_id: practice.id,
        patient_id: formData.patient_id,
        service: formData.service,
        duration_minutes: formData.duration_minutes,
        notes: formData.notes || null,
        recurrence_type: formData.recurrence_type,
        recurrence_interval: formData.recurrence_interval,
        days_of_week: formData.recurrence_type === 'weekly' ? formData.days_of_week : null,
        day_of_month: formData.recurrence_type === 'monthly' ? formData.day_of_month : null,
        start_time: formData.start_time,
        start_date: format(formData.start_date, 'yyyy-MM-dd'),
        end_date: formData.end_date ? format(formData.end_date, 'yyyy-MM-dd') : null,
        is_active: true
      };

      const { error } = await supabase
        .from('recurring_appointments')
        .insert([recurringData]);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Wiederkehrender Termin wurde erstellt",
      });

      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error creating recurring appointment:', error);
      toast({
        title: "Fehler",
        description: error.message || "Wiederkehrender Termin konnte nicht erstellt werden",
        variant: "destructive",
      });
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('recurring_appointments')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Status geändert",
        description: `Wiederkehrender Termin wurde ${!currentStatus ? 'aktiviert' : 'deaktiviert'}`,
      });

      loadData();
    } catch (error: any) {
      console.error('Error toggling status:', error);
      toast({
        title: "Fehler",
        description: "Status konnte nicht geändert werden",
        variant: "destructive",
      });
    }
  };

  const deleteRecurring = async (id: string) => {
    try {
      const { error } = await supabase
        .from('recurring_appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Gelöscht",
        description: "Wiederkehrender Termin wurde gelöscht",
      });

      loadData();
    } catch (error: any) {
      console.error('Error deleting recurring appointment:', error);
      toast({
        title: "Fehler",
        description: "Wiederkehrender Termin konnte nicht gelöscht werden",
        variant: "destructive",
      });
    }
  };

  const createNewPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!practice || !newPatientData.first_name || !newPatientData.last_name) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus",
        variant: "destructive",
      });
      return;
    }

    try {
      const patientData = {
        practice_id: practice.id,
        first_name: newPatientData.first_name,
        last_name: newPatientData.last_name,
        phone: newPatientData.phone || null,
        email: newPatientData.email || null,
        date_of_birth: newPatientData.date_of_birth ? format(newPatientData.date_of_birth, 'yyyy-MM-dd') : null,
        privacy_consent: true,
        consent_date: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('patients')
        .insert([patientData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Neuer Patient wurde erstellt",
      });

      // Update form with new patient
      setFormData(prev => ({ ...prev, patient_id: data.id }));
      setNewPatientDialogOpen(false);
      resetNewPatientForm();
      loadData();
    } catch (error: any) {
      console.error('Error creating patient:', error);
      toast({
        title: "Fehler",
        description: error.message || "Patient konnte nicht erstellt werden",
        variant: "destructive",
      });
    }
  };

  const resetNewPatientForm = () => {
    setNewPatientData({
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      date_of_birth: null,
    });
  };

  const resetForm = () => {
    setFormData({
      patient_id: "",
      service: "",
      duration_minutes: 30,
      notes: "",
      recurrence_type: "weekly",
      recurrence_interval: 1,
      days_of_week: [],
      day_of_month: 1,
      start_time: "",
      start_date: new Date(),
      end_date: null,
    });
  };

  const getRecurrenceText = (appointment: RecurringAppointment) => {
    const { recurrence_type, recurrence_interval, days_of_week, day_of_month } = appointment;
    
    if (recurrence_type === 'daily') {
      return `Täglich${recurrence_interval > 1 ? ` alle ${recurrence_interval} Tage` : ''}`;
    } else if (recurrence_type === 'weekly') {
      const dayNames = days_of_week?.map(day => 
        weekDays.find(wd => wd.value === day)?.label
      ).join(', ') || '';
      return `Wöchentlich${recurrence_interval > 1 ? ` alle ${recurrence_interval} Wochen` : ''} (${dayNames})`;
    } else if (recurrence_type === 'monthly') {
      return `Monatlich${recurrence_interval > 1 ? ` alle ${recurrence_interval} Monate` : ''} am ${day_of_month}.`;
    }
    
    return 'Unbekannt';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Wiederkehrende Termine</h2>
          <p className="text-muted-foreground">Verwalten Sie regelmäßige Termine</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Neuer Serientermin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Wiederkehrenden Termin erstellen</DialogTitle>
              <DialogDescription>
                Erstellen Sie einen Termin, der sich automatisch wiederholt
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Patient Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="patient">Patient *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setNewPatientDialogOpen(true)}
                    className="text-xs"
                  >
                    <UserPlus className="w-3 h-3 mr-1" />
                    Neuer Patient
                  </Button>
                </div>
                <Select
                  value={formData.patient_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, patient_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Patient auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
{Array.from(new Map(patients.map(p => [`${p.first_name} ${p.last_name}`.toLowerCase(), p])).values()).map((patient) => (
  <SelectItem key={patient.id} value={patient.id}>
    <div className="flex items-center gap-2">
      <Users className="w-4 h-4" />
      {patient.first_name} {patient.last_name}
      {appointmentCounts[patient.id] ? (
        <span className="text-muted-foreground text-xs">({appointmentCounts[patient.id]} Termine)</span>
      ) : null}
    </div>
  </SelectItem>
))}
                  </SelectContent>
                </Select>
              </div>

              {/* Service and Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service">Behandlung *</Label>
                  <Select
                    value={formData.service}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, service: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Behandlung wählen..." />
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
                    max="180"
                    step="15"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 30 }))}
                  />
                </div>
              </div>

              {/* Time and Start Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time">Uhrzeit *</Label>
                  <Select
                    value={formData.start_time}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, start_time: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Uhrzeit wählen..." />
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

                <div className="space-y-2">
                  <Label>Startdatum *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.start_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.start_date ? (
                          format(formData.start_date, "dd. MMMM yyyy", { locale: de })
                        ) : (
                          <span>Datum wählen</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.start_date}
                        onSelect={(date) => date && setFormData(prev => ({ ...prev, start_date: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Recurrence Settings */}
              <div className="space-y-4">
                <Label>Wiederholung *</Label>
                
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    value={formData.recurrence_type}
                    onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                      setFormData(prev => ({ ...prev, recurrence_type: value, days_of_week: [] }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Täglich</SelectItem>
                      <SelectItem value="weekly">Wöchentlich</SelectItem>
                      <SelectItem value="monthly">Monatlich</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2">
                    <Label htmlFor="interval">Alle</Label>
                    <Input
                      id="interval"
                      type="number"
                      min="1"
                      max="12"
                      value={formData.recurrence_interval}
                      onChange={(e) => setFormData(prev => ({ ...prev, recurrence_interval: parseInt(e.target.value) || 1 }))}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.recurrence_type === 'daily' && 'Tage'}
                      {formData.recurrence_type === 'weekly' && 'Wochen'}
                      {formData.recurrence_type === 'monthly' && 'Monate'}
                    </span>
                  </div>
                </div>

                {/* Weekly: Day Selection */}
                {formData.recurrence_type === 'weekly' && (
                  <div className="space-y-2">
                    <Label>Wochentage</Label>
                    <div className="flex flex-wrap gap-2">
                      {weekDays.map((day) => (
                        <div key={day.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`day-${day.value}`}
                            checked={formData.days_of_week.includes(day.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  days_of_week: [...prev.days_of_week, day.value]
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  days_of_week: prev.days_of_week.filter(d => d !== day.value)
                                }));
                              }
                            }}
                          />
                          <Label htmlFor={`day-${day.value}`} className="text-sm">
                            {day.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Monthly: Day Selection */}
                {formData.recurrence_type === 'monthly' && (
                  <div className="space-y-2">
                    <Label htmlFor="day-of-month">Tag im Monat</Label>
                    <Input
                      id="day-of-month"
                      type="number"
                      min="1"
                      max="31"
                      value={formData.day_of_month}
                      onChange={(e) => setFormData(prev => ({ ...prev, day_of_month: parseInt(e.target.value) || 1 }))}
                      className="w-20"
                    />
                  </div>
                )}
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label>Enddatum (optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.end_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.end_date ? (
                        format(formData.end_date, "dd. MMMM yyyy", { locale: de })
                      ) : (
                        <span>Kein Enddatum</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.end_date || undefined}
                      onSelect={(date) => setFormData(prev => ({ ...prev, end_date: date || null }))}
                      initialFocus
                    />
                    <div className="p-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, end_date: null }))}
                        className="w-full"
                      >
                        Enddatum entfernen
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notizen</Label>
                <Textarea
                  id="notes"
                  placeholder="Zusätzliche Informationen..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}
                >
                  Abbrechen
                </Button>
                <Button type="submit">
                  Serientermin erstellen
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* New Patient Dialog */}
        <Dialog open={newPatientDialogOpen} onOpenChange={setNewPatientDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Neuen Patient hinzufügen</DialogTitle>
              <DialogDescription>
                Erstellen Sie einen neuen Patienten für die Praxis
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={createNewPatient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-first-name">Vorname *</Label>
                  <Input
                    id="new-first-name"
                    value={newPatientData.first_name}
                    onChange={(e) => setNewPatientData(prev => ({ ...prev, first_name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-last-name">Nachname *</Label>
                  <Input
                    id="new-last-name"
                    value={newPatientData.last_name}
                    onChange={(e) => setNewPatientData(prev => ({ ...prev, last_name: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-phone">Telefon</Label>
                <Input
                  id="new-phone"
                  type="tel"
                  value={newPatientData.phone}
                  onChange={(e) => setNewPatientData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-email">E-Mail</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newPatientData.email}
                  onChange={(e) => setNewPatientData(prev => ({ ...prev, email: e.target.value }))}
                />
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
                        format(newPatientData.date_of_birth, "dd.MM.yyyy", { locale: de })
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
                      initialFocus
                      defaultMonth={new Date(1980, 0)}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setNewPatientDialogOpen(false);
                    resetNewPatientForm();
                  }}
                >
                  Abbrechen
                </Button>
                <Button type="submit">
                  Patient erstellen
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Recurring Appointments List */}
      <div className="grid gap-4">
        {recurringAppointments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Repeat className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Noch keine wiederkehrenden Termine erstellt
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          recurringAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover-glow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Repeat className="w-5 h-5" />
                      {appointment.patient?.first_name} {appointment.patient?.last_name}
                      <Badge variant={appointment.is_active ? "default" : "secondary"}>
                        {appointment.is_active ? "Aktiv" : "Pausiert"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {appointment.service} • {appointment.duration_minutes} Min • {appointment.start_time}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStatus(appointment.id, appointment.is_active)}
                    >
                      {appointment.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRecurring(appointment.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Repeat className="w-4 h-4 text-muted-foreground" />
                    <span>{getRecurrenceText(appointment)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                    <span>
                      Seit {format(new Date(appointment.start_date), 'dd.MM.yyyy', { locale: de })}
                      {appointment.end_date && (
                        <> bis {format(new Date(appointment.end_date), 'dd.MM.yyyy', { locale: de })}</>
                      )}
                    </span>
                  </div>
                  {appointment.notes && (
                    <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                      {appointment.notes}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}