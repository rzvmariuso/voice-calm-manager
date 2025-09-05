import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Plus,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { formatInBerlinTime, formatGermanDate } from "@/lib/dateUtils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePractice } from "@/hooks/usePractice";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAppointmentWebhook } from "@/hooks/useAppointmentWebhook";

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  service: string;
  duration_minutes: number;
  notes: string | null;
  status: string;
  ai_booked: boolean;
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
  };
}

interface AppointmentListProps {
  onEdit?: (appointment: Appointment) => void;
  onAdd?: () => void;
  refreshTrigger?: number;
}

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  confirmed: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  completed: "bg-green-500/10 text-green-700 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-700 border-red-500/20"
};

const statusLabels = {
  pending: "Geplant",
  confirmed: "Bestätigt", 
  completed: "Abgeschlossen",
  cancelled: "Abgesagt"
};

export function AppointmentList({ onEdit, onAdd, refreshTrigger }: AppointmentListProps) {
  const { practice } = usePractice();
  const { toast } = useToast();
  const { triggerWebhook } = useAppointmentWebhook();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (practice) {
      loadAppointments();
    }
  }, [practice, refreshTrigger]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          appointment_time,
          service,
          duration_minutes,
          notes,
          status,
          ai_booked,
          patient:patients (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq('practice_id', practice?.id)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast({
        title: "Fehler",
        description: "Termine konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) return;

    const oldData = { ...appointment };

    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId)
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

      // Trigger appropriate webhook based on status
      let action: 'confirmed' | 'cancelled' | 'updated' = 'updated';
      if (newStatus === 'confirmed') action = 'confirmed';
      else if (newStatus === 'cancelled') action = 'cancelled';

      if (data) {
        await triggerWebhook(action, appointmentId, data, data.patient, oldData);
      }

      toast({
        title: "Status aktualisiert",
        description: `Termin wurde als ${statusLabels[newStatus as keyof typeof statusLabels]} markiert.`,
      });

      loadAppointments(); // Refresh the list
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!appointmentToDelete) return;

    try {
      setDeletingId(appointmentToDelete.id);

      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentToDelete.id);

      if (error) throw error;

      // Optimistisch entfernen mit kleiner Verzögerung für Fade-Out
      setTimeout(() => {
        setAppointments(prev => prev.filter(a => a.id !== appointmentToDelete.id));
      }, 250);

      toast({
        title: "Erfolg",
        description: "Termin wurde gelöscht",
      });
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast({
        title: "Fehler",
        description: "Termin konnte nicht gelöscht werden",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setTimeout(() => {
        setDeletingId(null);
        setAppointmentToDelete(null);
      }, 300);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.patient.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patient.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <Loading text="Termine werden geladen..." />;
  }

  if (appointments.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="Keine Termine vorhanden"
        description="Erstellen Sie Ihren ersten Termin, um loszulegen."
        action={
          onAdd ? {
            label: "Ersten Termin erstellen",
            onClick: onAdd
          } : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Termine durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="pending">Geplant</SelectItem>
              <SelectItem value="confirmed">Bestätigt</SelectItem>
              <SelectItem value="completed">Abgeschlossen</SelectItem>
              <SelectItem value="cancelled">Abgesagt</SelectItem>
            </SelectContent>
          </Select>
          
          {onAdd && (
            <Button onClick={onAdd} className="button-gradient">
              <Plus className="w-4 h-4 mr-2" />
              Neuer Termin
            </Button>
          )}
        </div>
      </div>

      {/* Appointments List */}
      <div className="grid gap-4">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Keine Termine gefunden.</p>
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <Card
              key={appointment.id}
              className={`card-interactive hover:shadow-soft transition-all duration-300 ${deletingId === appointment.id ? 'animate-fade-out' : 'animate-fade-in'}`}
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Main Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-medium">
                          {formatGermanDate(appointment.appointment_date)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>{appointment.appointment_time}</span>
                        <span className="text-muted-foreground">
                          ({appointment.duration_minutes} Min.)
                        </span>
                      </div>

                      <Badge
                        variant="outline"
                        className={statusColors[appointment.status as keyof typeof statusColors]}
                      >
                        {statusLabels[appointment.status as keyof typeof statusLabels]}
                      </Badge>

                      {appointment.ai_booked && (
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-700">
                          KI-Buchung
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {appointment.patient.first_name} {appointment.patient.last_name}
                        </span>
                      </div>

                      {appointment.patient.email && (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Mail className="w-4 h-4" />
                          <span>{appointment.patient.email}</span>
                        </div>
                      )}

                      {appointment.patient.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Phone className="w-4 h-4" />
                          <span>{appointment.patient.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-medium text-primary">
                        {appointment.service}
                      </div>

                      {appointment.notes && (
                        <p className="text-sm text-muted-foreground">
                          {appointment.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {/* Status Update Buttons */}
                    {appointment.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                          className="hover:scale-105 transition-transform duration-200 text-blue-600 hover:text-blue-700"
                        >
                          ✅ Bestätigen
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                          className="hover:scale-105 transition-transform duration-200 text-red-600 hover:text-red-700"
                        >
                          ❌ Absagen
                        </Button>
                      </>
                    )}

                    {appointment.status === 'confirmed' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(appointment.id, 'completed')}
                          className="hover:scale-105 transition-transform duration-200 text-green-600 hover:text-green-700"
                        >
                          ✔️ Abgeschlossen
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                          className="hover:scale-105 transition-transform duration-200 text-red-600 hover:text-red-700"
                        >
                          ❌ Absagen
                        </Button>
                      </>
                    )}

                    {appointment.status === 'cancelled' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(appointment.id, 'pending')}
                        className="hover:scale-105 transition-transform duration-200 text-yellow-600 hover:text-yellow-700"
                      >
                        🔄 Reaktivieren
                      </Button>
                    )}

                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(appointment)}
                        className="hover:scale-105 transition-transform duration-200"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAppointmentToDelete(appointment);
                        setDeleteDialogOpen(true);
                      }}
                      className="hover:scale-105 transition-transform duration-200 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Termin löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie diesen Termin löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
              {appointmentToDelete && (
                <div className="mt-2 p-2 bg-muted rounded text-sm">
                  <strong>
                    {appointmentToDelete.patient.first_name} {appointmentToDelete.patient.last_name}
                  </strong>
                  <br />
                  {formatInBerlinTime(appointmentToDelete.appointment_date, "dd. MMMM yyyy")} 
                  {" um "} {appointmentToDelete.appointment_time}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}