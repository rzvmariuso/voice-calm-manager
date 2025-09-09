import { useState } from "react";
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

export function AppointmentCard({
  appointment,
  onEdit,
  onDelete,
  compact = false,
  style,
  draggable = false,
  onDragStart
}: AppointmentCardProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success hover:bg-success/90 shadow-sm hover:shadow-lg';
      case 'completed':
        return 'bg-accent hover:bg-accent/80 border border-accent-foreground/20';
      case 'cancelled':
        return 'bg-destructive hover:bg-destructive/90 shadow-sm hover:shadow-lg';
      default:
        return 'bg-warning hover:bg-warning/90 shadow-sm hover:shadow-lg';
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
              "relative group p-2 rounded-lg border cursor-pointer transition-all duration-200",
              "hover:shadow-soft hover:-translate-y-0.5",
              appointment.ai_booked
                ? "bg-background border-primary/20 hover:border-primary/40" 
                : "bg-background border-border hover:border-border/60"
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
              <div className="text-sm font-medium text-foreground truncate">
                {appointment.patient.first_name} {appointment.patient.last_name}
              </div>
            </div>

            {/* Hover Actions */}
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-accent"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(appointment);
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(appointment);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4">
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
      className={`
        relative group text-xs p-2 rounded border-l-2 cursor-pointer 
        transition-colors duration-150
        ${appointment.ai_booked 
          ? 'border-l-primary bg-primary/10 hover:bg-primary/15' 
          : 'border-l-accent bg-accent/10 hover:bg-accent/15'
        }
      `}
      title={`${appointment.appointment_time} - ${appointment.patient.first_name} ${appointment.patient.last_name} (${appointment.service})`}
      draggable={draggable}
      onDragStart={onDragStart ? (e) => onDragStart(e, appointment) : undefined}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          {appointment.ai_booked && (
            <span className="text-xs px-1 bg-primary/20 text-primary rounded">
              KI
            </span>
          )}
          <span className="text-xs font-medium">
            {formatAppointmentTime(appointment.appointment_time)}
          </span>
        </div>
        
        <span className="text-xs text-muted-foreground">
          {appointment.duration_minutes || 30}min
        </span>
      </div>

      {/* Patient info */}
      <div className="space-y-0.5">
        <div className="truncate text-xs font-medium text-foreground">
          {appointment.patient.first_name} {appointment.patient.last_name}
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {appointment.service}
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
        <Button
          size="sm"
          variant="ghost"
          className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(appointment);
          }}
        >
          <Edit className="h-2.5 w-2.5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(appointment);
          }}
        >
          <Trash2 className="h-2.5 w-2.5" />
        </Button>
      </div>
    </div>
  );
}

function AppointmentDetails({ 
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
}) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-lg">
            {appointment.patient.first_name} {appointment.patient.last_name}
          </h4>
          <p className="text-sm text-muted-foreground">
            {format(new Date(`${appointment.appointment_date}T${appointment.appointment_time}`), 'PPpp', { locale: de })}
          </p>
        </div>
        {appointment.ai_booked && (
          <Badge variant="outline" className="border-primary text-primary">
            <Bot className="w-3 h-3 mr-1" />
            KI-Buchung
          </Badge>
        )}
      </div>

      {/* Service & Duration */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{appointment.service}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span>{appointment.duration_minutes || 30} Minuten</span>
        </div>
      </div>

      {/* Patient Info */}
      <div className="space-y-2">
        {appointment.patient.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span>{appointment.patient.phone}</span>
          </div>
        )}
        {appointment.patient.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span>{appointment.patient.email}</span>
          </div>
        )}
      </div>

      {/* Notes */}
      {appointment.notes && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Notizen:</span>
          </div>
          <p className="text-sm bg-muted p-2 rounded">{appointment.notes}</p>
        </div>
      )}

      {/* Status Change */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Status ändern:</label>
        <Select
          value={appointment.status}
          onValueChange={onStatusChange}
          disabled={isUpdating}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Wartend</SelectItem>
            <SelectItem value="confirmed">Bestätigt</SelectItem>
            <SelectItem value="completed">Abgeschlossen</SelectItem>
            <SelectItem value="cancelled">Abgesagt</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-2 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(appointment)}
          className="hover-scale"
        >
          <Edit className="w-4 h-4 mr-2" />
          Bearbeiten
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(appointment)}
          className="hover-scale"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Löschen
        </Button>
      </div>
    </div>
  );
}