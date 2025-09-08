import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calendar, 
  Clock, 
  FileText, 
  Plus, 
  Edit3, 
  Save, 
  X,
  History,
  TrendingUp,
  Activity
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

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
}

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  service: string;
  status: string;
  notes: string | null;
  duration_minutes: number;
  created_at: string;
}

interface PatientNote {
  id: string;
  note: string;
  created_at: string;
  updated_at: string;
  type: 'general' | 'treatment' | 'medical';
}

interface PatientHistoryProps {
  patient: Patient;
  onClose?: () => void;
}

export function PatientHistory({ patient, onClose }: PatientHistoryProps) {
  const { practice } = usePractice();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notes, setNotes] = useState<PatientNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [noteType, setNoteType] = useState<'general' | 'treatment' | 'medical'>('general');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");

  useEffect(() => {
    loadPatientData();
  }, [patient.id, practice]);

  const loadPatientData = async () => {
    if (!practice) return;

    try {
      setLoading(true);

      // Load appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('practice_id', practice.id)
        .eq('patient_id', patient.id)
        .order('appointment_date', { ascending: false });

      if (appointmentsError) throw appointmentsError;

      setAppointments(appointmentsData || []);

      // Load notes from database - for now empty until notes system is implemented
      setNotes([]);
    } catch (error) {
      console.error('Error loading patient data:', error);
      toast({
        title: "Fehler",
        description: "Patientendaten konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;

    try {
      const note: PatientNote = {
        id: Date.now().toString(),
        note: newNote.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        type: noteType
      };

      setNotes(prev => [note, ...prev]);
      setNewNote("");
      
      toast({
        title: "Notiz hinzugefügt",
        description: "Die Notiz wurde erfolgreich gespeichert",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Notiz konnte nicht gespeichert werden",
        variant: "destructive",
      });
    }
  };

  const updateNote = async (noteId: string) => {
    if (!editingNoteText.trim()) return;

    try {
      setNotes(prev => prev.map(note => 
        note.id === noteId 
          ? { ...note, note: editingNoteText.trim(), updated_at: new Date().toISOString() }
          : note
      ));

      setEditingNote(null);
      setEditingNoteText("");
      
      toast({
        title: "Notiz aktualisiert",
        description: "Die Notiz wurde erfolgreich aktualisiert",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Notiz konnte nicht aktualisiert werden",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'no_show':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Abgeschlossen';
      case 'cancelled':
        return 'Abgesagt';
      case 'no_show':
        return 'Nicht erschienen';
      case 'pending':
        return 'Ausstehend';
      default:
        return status;
    }
  };

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case 'treatment':
        return 'bg-primary/10 text-primary';
      case 'medical':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getNoteTypeText = (type: string) => {
    switch (type) {
      case 'treatment':
        return 'Behandlung';
      case 'medical':
        return 'Medizinisch';
      default:
        return 'Allgemein';
    }
  };

  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getAppointmentStats = () => {
    const total = appointments.length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;
    const noShow = appointments.filter(a => a.status === 'no_show').length;
    
    return { total, completed, cancelled, noShow };
  };

  const stats = getAppointmentStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Patient Info Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                {patient.first_name} {patient.last_name}
              </CardTitle>
              <CardDescription className="flex items-center gap-4 mt-2">
                {patient.email && <span>📧 {patient.email}</span>}
                {patient.phone && <span>📱 {patient.phone}</span>}
                {patient.date_of_birth && (
                  <span>🎂 {calculateAge(patient.date_of_birth)} Jahre</span>
                )}
              </CardDescription>
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Termine gesamt</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">Abgeschlossen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{stats.cancelled}</div>
              <div className="text-sm text-muted-foreground">Abgesagt</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{stats.noShow}</div>
              <div className="text-sm text-muted-foreground">Nicht erschienen</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Appointment History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Terminhistorie
            </CardTitle>
            <CardDescription>
              Alle Termine des Patienten ({appointments.length})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {appointments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Noch keine Termine vorhanden
                </p>
              ) : (
                appointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {format(new Date(appointment.appointment_date), 'dd. MMM yyyy', { locale: de })}
                        </span>
                        <Clock className="w-4 h-4 text-muted-foreground ml-2" />
                        <span>{appointment.appointment_time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {appointment.service} ({appointment.duration_minutes} Min)
                      </p>
                      {appointment.notes && (
                        <p className="text-sm bg-muted p-2 rounded text-muted-foreground">
                          {appointment.notes}
                        </p>
                      )}
                    </div>
                    <Badge variant={getStatusBadgeVariant(appointment.status)}>
                      {getStatusText(appointment.status)}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Patient Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Patientennotizen
            </CardTitle>
            <CardDescription>
              Behandlungsnotizen und wichtige Informationen
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Add New Note */}
            <div className="space-y-3 mb-6 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Label htmlFor="note-type">Notiztyp:</Label>
                <select
                  id="note-type"
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value as any)}
                  className="px-2 py-1 border rounded text-sm"
                >
                  <option value="general">Allgemein</option>
                  <option value="treatment">Behandlung</option>
                  <option value="medical">Medizinisch</option>
                </select>
              </div>
              <Textarea
                placeholder="Neue Notiz hinzufügen..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={2}
              />
              <Button 
                onClick={addNote} 
                size="sm" 
                disabled={!newNote.trim()}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Notiz hinzufügen
              </Button>
            </div>

            {/* Notes List */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {notes.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Noch keine Notizen vorhanden
                </p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={`text-xs ${getNoteTypeColor(note.type)}`}>
                        {getNoteTypeText(note.type)}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingNote(note.id);
                            setEditingNoteText(note.note);
                          }}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {editingNote === note.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editingNoteText}
                          onChange={(e) => setEditingNoteText(e.target.value)}
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => updateNote(note.id)}>
                            <Save className="w-4 h-4 mr-1" />
                            Speichern
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setEditingNote(null);
                              setEditingNoteText("");
                            }}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Abbrechen
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm mb-2">{note.note}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(note.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                          {note.updated_at !== note.created_at && " (bearbeitet)"}
                        </p>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}