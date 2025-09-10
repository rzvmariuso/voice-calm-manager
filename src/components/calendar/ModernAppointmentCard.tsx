import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bot, Clock, Edit, Trash2, User, Phone, Mail, Calendar } from "lucide-react";
import { AppointmentWithPatient } from "@/hooks/useAppointments";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { formatAppointmentTime } from "@/lib/dateUtils";

interface ModernAppointmentCardProps {
  appointment: AppointmentWithPatient;
  onEdit: (appointment: AppointmentWithPatient) => void;
  onDelete: (appointment: AppointmentWithPatient) => void;
  onPatientClick?: (patientId: string) => void;
  variant?: 'compact' | 'timeline' | 'full';
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}

export function ModernAppointmentCard({
  appointment,
  onEdit,
  onDelete,
  onPatientClick,
  variant = 'compact',
  draggable = false,
  onDragStart
}: ModernAppointmentCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Bestätigt';
      case 'completed': return 'Abgeschlossen';
      case 'cancelled': return 'Abgesagt';
      case 'pending': return 'Wartend';
      default: return status;
    }
  };

  if (variant === 'compact') {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div
            className={cn(
              "relative p-2 rounded-lg border cursor-pointer transition-all group hover:shadow-md",
              appointment.ai_booked 
                ? "bg-primary/5 border-primary/30 hover:bg-primary/10" 
                : "bg-card border-border hover:bg-muted/50",
              draggable && "cursor-move"
            )}
            draggable={draggable}
            onDragStart={onDragStart}
          >
            {/* Status Indicator */}
            <div className={cn("absolute top-1 right-1 w-2 h-2 rounded-full", getStatusColor(appointment.status))} />
            
            {/* Time & AI Badge */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-foreground">
                  {formatAppointmentTime(appointment.appointment_time)}
                </span>
                {appointment.ai_booked && (
                  <Badge variant="secondary" className="text-xs px-1 py-0 h-4 bg-primary/20 text-primary">
                    KI
                  </Badge>
                )}
              </div>
            </div>

            {/* Patient Name */}
            <div className="text-xs font-medium text-card-foreground truncate">
              {appointment.patient.first_name} {appointment.patient.last_name}
            </div>
            
            {/* Service */}
            <div className="text-xs text-muted-foreground truncate">
              {appointment.service}
            </div>
          </div>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-0" side="right" align="start">
          <AppointmentDetails 
            appointment={appointment}
            onEdit={() => { onEdit(appointment); setIsOpen(false); }}
            onDelete={() => { onDelete(appointment); setIsOpen(false); }}
            onPatientClick={onPatientClick ? (patientId) => { onPatientClick(patientId); setIsOpen(false); } : undefined}
          />
        </PopoverContent>
      </Popover>
    );
  }

  if (variant === 'timeline') {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className={cn(
            "h-full w-full rounded border-l-2 p-1 cursor-pointer transition-all hover:shadow-sm",
            appointment.ai_booked 
              ? "bg-primary/10 border-l-primary hover:bg-primary/20" 
              : "bg-card border-l-muted-foreground hover:bg-muted/50"
          )}>
            <div className="h-full flex flex-col justify-between text-xs">
              <div>
                <div className="font-medium text-foreground truncate">
                  {appointment.patient.first_name} {appointment.patient.last_name}
                </div>
                <div className="text-muted-foreground truncate">
                  {appointment.service}
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-medium">
                  {formatAppointmentTime(appointment.appointment_time)}
                </span>
                {appointment.ai_booked && (
                  <Badge variant="secondary" className="text-xs px-1 py-0 h-3 bg-primary/20 text-primary">
                    KI
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-0" side="right">
          <AppointmentDetails 
            appointment={appointment}
            onEdit={() => { onEdit(appointment); setIsOpen(false); }}
            onDelete={() => { onDelete(appointment); setIsOpen(false); }}
            onPatientClick={onPatientClick ? (patientId) => { onPatientClick(patientId); setIsOpen(false); } : undefined}
          />
        </PopoverContent>
      </Popover>
    );
  }

  // Full variant - for detailed views
  return (
    <div className={cn(
      "p-4 rounded-lg border bg-card hover:shadow-md transition-all",
      appointment.ai_booked && "border-primary/30"
    )}>
      <AppointmentDetails 
        appointment={appointment}
        onEdit={() => onEdit(appointment)}
        onDelete={() => onDelete(appointment)}
        onPatientClick={onPatientClick}
        showActions
      />
    </div>
  );
}

function AppointmentDetails({ 
  appointment, 
  onEdit, 
  onDelete,
  onPatientClick,
  showActions = true
}: {
  appointment: AppointmentWithPatient;
  onEdit: () => void;
  onDelete: () => void;
  onPatientClick?: (patientId: string) => void;
  showActions?: boolean;
}) {
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h4 className="font-semibold text-lg flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            {onPatientClick ? (
              <button 
                onClick={() => onPatientClick(appointment.patient.id)}
                className="text-primary hover:text-primary/80 hover:underline transition-colors text-left"
              >
                {appointment.patient.first_name} {appointment.patient.last_name}
              </button>
            ) : (
              <span>{appointment.patient.first_name} {appointment.patient.last_name}</span>
            )}
          </h4>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
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
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{appointment.service}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span>{appointment.duration_minutes || 30} Minuten</span>
        </div>
      </div>

      {/* Contact Info */}
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
            <span className="truncate">{appointment.patient.email}</span>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Status:</span>
        <Badge variant="outline" className="text-xs">
          {(() => {
            switch (appointment.status) {
              case 'confirmed': return 'Bestätigt';
              case 'completed': return 'Abgeschlossen';
              case 'cancelled': return 'Abgesagt';
              case 'pending': return 'Wartend';
              default: return appointment.status;
            }
          })()}
        </Badge>
      </div>

      {/* Notes */}
      {appointment.notes && (
        <div className="space-y-1">
          <span className="text-sm font-medium">Notizen:</span>
          <p className="text-sm bg-muted/50 p-2 rounded border">
            {appointment.notes}
          </p>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Bearbeiten
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Löschen
          </Button>
        </div>
      )}
    </div>
  );
}