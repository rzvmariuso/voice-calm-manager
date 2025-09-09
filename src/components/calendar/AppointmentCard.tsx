import { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, Clock, Edit, Trash2, User, Calendar, MessageSquare, Phone, Mail } from "lucide-react";
import { AppointmentWithPatient } from "@/hooks/useAppointments";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatAppointmentTime } from "@/lib/dateUtils";

interface AppointmentCardProps {
  appointment: AppointmentWithPatient;
  onEdit: (appointment: AppointmentWithPatient) => void;
  onDelete: (appointment: AppointmentWithPatient) => void;
  compact?: boolean;
  style?: React.CSSProperties;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, appointment: AppointmentWithPatient) => void;
}

export const AppointmentCard = memo(({
  appointment,
  onEdit,
  onDelete,
  compact = false,
  style,
  draggable = false,
  onDragStart
}: AppointmentCardProps) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success/10 border-success/20 text-success-foreground';
      case 'completed':
        return 'bg-accent/10 border-accent/20 text-accent-foreground';
      case 'cancelled':
        return 'bg-destructive/10 border-destructive/20 text-destructive-foreground';
      default:
        return 'bg-warning/10 border-warning/20 text-warning-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Bestätigt';
      case 'completed':
        return 'Abgeschlossen';
      case 'cancelled':
        return 'Abgesagt';
      case 'pending':
        return 'Wartend';
      default:
        return status;
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointment.id);

      if (error) throw error;

      toast({
        title: "Status aktualisiert",
        description: `Termin status wurde auf "${getStatusLabel(newStatus)}" geändert.`,
      });

      // Status update will be reflected when component re-renders
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (compact) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <div 
            className={cn(
              "relative p-2 rounded-lg border cursor-pointer transition-all duration-200",
              "hover:shadow-soft",
              appointment.ai_booked
                ? "bg-card border-primary/20 hover:border-primary/30" 
                : "bg-card border-border hover:border-border/70",
              getStatusColor(appointment.status)
            )}
            style={style}
            draggable={draggable}
            onDragStart={onDragStart ? (e) => onDragStart(e, appointment) : undefined}
          >
            {/* Status indicator */}
            <div className={cn(
              "absolute top-2 left-2 w-2 h-2 rounded-full",
              appointment.status === 'confirmed' ? "bg-success" :
              appointment.status === 'pending' ? "bg-warning" :
              appointment.status === 'completed' ? "bg-primary" : "bg-destructive"
            )} />

            {/* Time & AI Badge */}
            <div className="flex items-start justify-between mb-1 pl-4">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-foreground">
                  {formatAppointmentTime(appointment.appointment_time)}
                </span>
                {appointment.ai_booked && (
                  <div className="text-xs px-1 py-0.5 bg-primary/15 text-primary rounded font-medium">
                    AI
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {appointment.duration_minutes || 30}m
              </span>
            </div>

            {/* Patient Name Only */}
            <div className="pl-4">
              <div className="text-sm font-medium text-card-foreground truncate">
                {appointment.patient.first_name} {appointment.patient.last_name}
              </div>
            </div>

            {/* Removed always visible action buttons - now only in popover */}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4 bg-popover border border-border">
          <AppointmentDetails 
            appointment={appointment}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={handleStatusChange}
            isUpdating={isUpdating}
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div 
      className={cn(
        "relative text-xs p-2 rounded border-l-2 cursor-pointer transition-all duration-200",
        "hover:shadow-soft hover:bg-card/80",
        appointment.ai_booked 
          ? 'border-l-primary bg-primary/5' 
          : 'border-l-accent bg-accent/5',
        getStatusColor(appointment.status)
      )}
      title={`${appointment.appointment_time} - ${appointment.patient.first_name} ${appointment.patient.last_name} (${appointment.service})`}
      draggable={draggable}
      onDragStart={onDragStart ? (e) => onDragStart(e, appointment) : undefined}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          {appointment.ai_booked && (
            <span className="text-xs px-1 bg-primary/10 text-primary rounded">
              KI
            </span>
          )}
          <span className="text-xs font-medium text-foreground">
            {formatAppointmentTime(appointment.appointment_time)}
          </span>
        </div>
        
        <span className="text-xs text-muted-foreground">
          {appointment.duration_minutes || 30}min
        </span>
      </div>

      {/* Patient info */}
      <div className="space-y-0.5">
        <div className="truncate text-xs font-medium text-card-foreground">
          {appointment.patient.first_name} {appointment.patient.last_name}
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {appointment.service}
        </div>
      </div>
      
      {/* Removed always visible action buttons - actions available only in popover */}
    </div>
  );
});

AppointmentCard.displayName = "AppointmentCard";

const AppointmentDetails = memo(({ 
  appointment, 
  onEdit, 
  onDelete, 
  onStatusChange, 
  isUpdating 
}: {
  appointment: AppointmentWithPatient;
  onEdit: (appointment: AppointmentWithPatient) => void;
  onDelete: (appointment: AppointmentWithPatient) => void;
  onStatusChange: (status: string) => void;
  isUpdating: boolean;
}) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-lg text-popover-foreground">
            {appointment.patient.first_name} {appointment.patient.last_name}
          </h4>
          <p className="text-sm text-muted-foreground">
            {format(new Date(`${appointment.appointment_date}T${appointment.appointment_time}`), 'PPpp', { locale: de })}
          </p>
        </div>
        {appointment.ai_booked && (
          <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
            <Bot className="w-3 h-3 mr-1" />
            KI-Buchung
          </Badge>
        )}
      </div>

      {/* Service & Duration */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-popover-foreground">{appointment.service}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-popover-foreground">{appointment.duration_minutes || 30} Minuten</span>
        </div>
      </div>

      {/* Patient Info */}
      <div className="space-y-2">
        {appointment.patient.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span className="text-popover-foreground">{appointment.patient.phone}</span>
          </div>
        )}
        {appointment.patient.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-popover-foreground">{appointment.patient.email}</span>
          </div>
        )}
      </div>

      {/* Notes */}
      {appointment.notes && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-popover-foreground">Notizen:</span>
          </div>
          <p className="text-sm bg-muted/50 text-muted-foreground p-2 rounded border border-border/50">
            {appointment.notes}
          </p>
        </div>
      )}

      {/* Status Change */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-popover-foreground">Status ändern:</label>
        <Select
          value={appointment.status}
          onValueChange={onStatusChange}
          disabled={isUpdating}
        >
          <SelectTrigger className="bg-background border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="pending">Wartend</SelectItem>
            <SelectItem value="confirmed">Bestätigt</SelectItem>
            <SelectItem value="completed">Abgeschlossen</SelectItem>
            <SelectItem value="cancelled">Abgesagt</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-2 border-t border-border/50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(appointment)}
          className="hover-scale bg-background border-border text-foreground hover:bg-accent"
          disabled={isUpdating}
        >
          <Edit className="w-4 h-4 mr-2" />
          Bearbeiten
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(appointment)}
          className="hover-scale"
          disabled={isUpdating}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Löschen
        </Button>
      </div>
    </div>
  );
});

AppointmentDetails.displayName = "AppointmentDetails";