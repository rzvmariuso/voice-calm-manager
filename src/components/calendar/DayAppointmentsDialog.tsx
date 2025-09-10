import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AppointmentWithPatient } from "@/hooks/useAppointments";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Clock, User, Calendar, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DayAppointmentsDialogProps {
  date: Date;
  appointments: AppointmentWithPatient[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditAppointment: (appointment: AppointmentWithPatient) => void;
  onDeleteAppointment: (appointment: AppointmentWithPatient) => void;
  onPatientClick: (patientId: string) => void;
}

export function DayAppointmentsDialog({
  date,
  appointments,
  open,
  onOpenChange,
  onEditAppointment,
  onDeleteAppointment,
  onPatientClick
}: DayAppointmentsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Termine für {format(date, 'PPPP', { locale: de })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {appointments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Keine Termine für diesen Tag
            </p>
          ) : (
            appointments.map((appointment) => (
              <div 
                key={appointment.id}
                className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    {/* Time and AI Badge */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        {appointment.appointment_time}
                      </div>
                      {appointment.ai_booked && (
                        <Badge variant="secondary" className="text-xs bg-primary/20 text-primary">
                          KI
                        </Badge>
                      )}
                    </div>

                    {/* Patient Name - Clickable */}
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <button 
                        onClick={() => onPatientClick(appointment.patient.id)}
                        className="text-primary hover:text-primary/80 hover:underline transition-colors font-medium text-left"
                      >
                        {appointment.patient.first_name} {appointment.patient.last_name}
                      </button>
                    </div>

                    {/* Service */}
                    <div className="text-sm text-muted-foreground">
                      {appointment.service}
                      {appointment.duration_minutes && (
                        <span> • {appointment.duration_minutes} Min</span>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      {appointment.patient.phone && (
                        <span>{appointment.patient.phone}</span>
                      )}
                      {appointment.patient.email && (
                        <span className="truncate max-w-[200px]">{appointment.patient.email}</span>
                      )}
                    </div>

                    {/* Notes */}
                    {appointment.notes && (
                      <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded border">
                        {appointment.notes}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditAppointment(appointment)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteAppointment(appointment)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}