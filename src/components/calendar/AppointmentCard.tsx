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
        return 'bg-success hover:bg-success/80';
      case 'completed':
        return 'bg-muted hover:bg-muted/80';
      case 'cancelled':
        return 'bg-destructive hover:bg-destructive/80';
      default:
        return 'bg-warning hover:bg-warning/80';
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

      // Trigger a refetch of appointments
      window.location.reload();
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
            className={`
              relative group text-xs p-2 rounded text-white cursor-pointer transition-all duration-200 animate-fade-in
              ${appointment.ai_booked 
                ? 'bg-gradient-primary shadow-sm hover:shadow-lg' 
                : getStatusColor(appointment.status)
              }
            `}
            style={style}
            draggable={draggable}
            onDragStart={onDragStart ? (e) => onDragStart(e, appointment) : undefined}
          >
            <div className="flex items-center gap-1 mb-1">
              {appointment.ai_booked && <Bot className="w-2 h-2" />}
              <Clock className="w-2 h-2" />
              <span className="font-medium">{appointment.appointment_time}</span>
            </div>
            <div className="truncate font-medium">
              {appointment.patient.first_name} {appointment.patient.last_name}
            </div>
            <div className="truncate text-xs opacity-90">
              {appointment.service}
            </div>

            {/* Quick action buttons */}
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-4 w-4 p-0 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(appointment);
                }}
              >
                <Edit className="h-2 w-2" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-4 w-4 p-0 text-white hover:bg-red-500/50"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(appointment);
                }}
              >
                <Trash2 className="h-2 w-2" />
              </Button>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80 animate-scale-in">
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
        relative group text-xs p-2 rounded text-white cursor-pointer truncate transition-all duration-200 animate-fade-in
        ${appointment.ai_booked 
          ? 'bg-gradient-primary shadow-sm hover:shadow-lg' 
          : getStatusColor(appointment.status)
        }
      `}
      title={`${appointment.appointment_time} - ${appointment.patient.first_name} ${appointment.patient.last_name} (${appointment.service})`}
      draggable={draggable}
      onDragStart={onDragStart ? (e) => onDragStart(e, appointment) : undefined}
    >
      <div className="flex items-center gap-1">
        {appointment.ai_booked && <Bot className="w-2 h-2" />}
        <Clock className="w-2 h-2" />
        <span>{appointment.appointment_time}</span>
      </div>
      <div className="truncate">
        {appointment.patient.first_name} {appointment.patient.last_name}
      </div>
      
      {/* Action buttons - appear on hover */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
        <Button
          size="sm"
          variant="ghost"
          className="h-4 w-4 p-0 text-white hover:bg-white/20"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(appointment);
          }}
        >
          <Edit className="h-2 w-2" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-4 w-4 p-0 text-white hover:bg-red-500/50"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(appointment);
          }}
        >
          <Trash2 className="h-2 w-2" />
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