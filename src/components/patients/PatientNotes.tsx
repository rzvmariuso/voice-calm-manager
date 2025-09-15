import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Plus, Save, X, Calendar, User, Clock } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePractice } from "@/hooks/usePractice";
import { cn } from "@/lib/utils";

interface PatientNote {
  id: string;
  patient_id: string;
  practice_id: string;
  note: string;
  note_type: 'general' | 'medical' | 'appointment' | 'reminder';
  created_at: string;
  updated_at: string;
}

interface PatientNotesProps {
  patientId: string;
  patientName: string;
  className?: string;
}

const noteTypeLabels = {
  general: 'Allgemein',
  medical: 'Medizinisch',
  appointment: 'Termin',
  reminder: 'Erinnerung'
};

const noteTypeColors = {
  general: 'default',
  medical: 'destructive',
  appointment: 'secondary',
  reminder: 'outline'
} as const;

export function PatientNotes({ patientId, patientName, className }: PatientNotesProps) {
  const { toast } = useToast();
  const { practice } = usePractice();
  const [notes, setNotes] = useState<PatientNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState({
    content: '',
    note_type: 'general' as PatientNote['note_type']
  });

  useEffect(() => {
    loadNotes();
  }, [patientId]);

  const loadNotes = async () => {
    if (!practice?.id) return;

    try {
      const { data, error } = await supabase
        .from('patient_notes')
        .select('*')
        .eq('patient_id', patientId)
        .eq('practice_id', practice.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes((data || []) as PatientNote[]);
    } catch (error) {
      console.error('Error loading notes:', error);
      toast({
        title: "Fehler",
        description: "Notizen konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveNote = async () => {
    if (!newNote.content.trim() || !practice?.id) return;

    try {
      const { error } = await supabase
        .from('patient_notes')
        .insert([{
          patient_id: patientId,
          practice_id: practice.id,
          note: newNote.content.trim(),
          note_type: newNote.note_type
        }]);

      if (error) throw error;

      toast({
        title: "Notiz gespeichert",
        description: "Die Notiz wurde erfolgreich hinzugefügt",
      });

      setNewNote({ content: '', note_type: 'general' });
      setIsAdding(false);
      loadNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "Fehler",
        description: "Notiz konnte nicht gespeichert werden",
        variant: "destructive",
      });
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!practice?.id) return;

    try {
      const { error } = await supabase
        .from('patient_notes')
        .delete()
        .eq('id', noteId)
        .eq('practice_id', practice.id);

      if (error) throw error;

      toast({
        title: "Notiz gelöscht",
        description: "Die Notiz wurde erfolgreich gelöscht",
      });

      loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Fehler",
        description: "Notiz konnte nicht gelöscht werden",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-32" />
          <div className="h-4 bg-muted rounded w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded w-24" />
                <div className="h-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Patientennotizen
            </CardTitle>
            <CardDescription>
              Notizen zu {patientName} ({notes.length} {notes.length === 1 ? 'Notiz' : 'Notizen'})
            </CardDescription>
          </div>
          <Button
            onClick={() => setIsAdding(true)}
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Neue Notiz
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Add New Note */}
        {isAdding && (
          <Card className="border-dashed border-primary/50">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex gap-2">
                  {Object.entries(noteTypeLabels).map(([type, label]) => (
                    <Button
                      key={type}
                      variant={newNote.note_type === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewNote(prev => ({ ...prev, note_type: type as PatientNote['note_type'] }))}
                    >
                      {label}
                    </Button>
                  ))}
                </div>

                <Textarea
                  placeholder="Notiz eingeben..."
                  value={newNote.content}
                  onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                  className="min-h-[100px]"
                  autoFocus
                />

                <div className="flex gap-2">
                  <Button onClick={saveNote} size="sm" className="gap-2">
                    <Save className="w-4 h-4" />
                    Speichern
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsAdding(false);
                      setNewNote({ content: '', note_type: 'general' });
                    }}
                    size="sm"
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Abbrechen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes List */}
        {notes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Noch keine Notizen vorhanden</p>
            <p className="text-sm">Klicken Sie auf "Neue Notiz" um zu beginnen</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note, index) => (
              <div key={note.id}>
                <Card className="relative group">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={noteTypeColors[note.note_type]}>
                            {noteTypeLabels[note.note_type]}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {format(new Date(note.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                          </div>
                        </div>
                        
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {note.note}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNote(note.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {index < notes.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}