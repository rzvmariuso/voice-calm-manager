import { useMemo } from "react";
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isToday, isSameDay } from "date-fns";
import { de } from "date-fns/locale";
import { AppointmentWithPatient } from "@/hooks/useAppointments";
import { ModernAppointmentCard } from "./ModernAppointmentCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModernWeekViewProps {
  currentDate: Date;
  appointments: AppointmentWithPatient[];
  onEditAppointment: (appointment: AppointmentWithPatient) => void;
  onDeleteAppointment: (appointment: AppointmentWithPatient) => void;
  onPatientClick: (patientId: string) => void;
}

export function ModernWeekView({
  currentDate,
  appointments,
  onEditAppointment,
  onDeleteAppointment,
  onPatientClick
}: ModernWeekViewProps) {
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [currentDate]);

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      slots.push(hour);
    }
    return slots;
  }, []);

  const getAppointmentsForDay = (date: Date) => {
    return appointments
      .filter(appointment => 
        isSameDay(new Date(`${appointment.appointment_date}T00:00:00`), date)
      )
      .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
  };

  const getAppointmentPosition = (appointment: AppointmentWithPatient) => {
    const [hours, minutes] = appointment.appointment_time.split(':').map(Number);
    const startHour = 6; // 6 AM start
    const relativeHour = hours - startHour;
    const top = (relativeHour * 60 + minutes) * (64 / 60); // 64px per hour
    const duration = appointment.duration_minutes || 30;
    const height = (duration * 64) / 60; // Convert minutes to pixels
    
    return { top, height };
  };

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
      {/* Week Header */}
      <div className="grid grid-cols-8 border-b bg-muted/30">
        <div className="p-4 border-r">
          <span className="text-sm font-medium text-muted-foreground">Zeit</span>
        </div>
        {weekDays.map((date) => {
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const dayAppointments = getAppointmentsForDay(date);
          
          return (
            <div key={date.toISOString()} className={cn(
              "p-4 text-center border-r last:border-r-0",
              isWeekend && "bg-muted/20",
              isToday(date) && "bg-primary/5"
            )}>
              <div className="space-y-1">
                <div className="text-sm font-medium">
                  {format(date, 'EEEE', { locale: de })}
                </div>
                <div className={cn(
                  "text-lg font-bold",
                  isToday(date) && "w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto"
                )}>
                  {format(date, 'd')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {dayAppointments.length} {dayAppointments.length === 1 ? 'Termin' : 'Termine'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-8 relative overflow-x-auto">
        {/* Time Column */}
        <div className="border-r bg-muted/10">
          {timeSlots.map((hour) => (
            <div key={hour} className="h-16 border-b px-4 py-2 text-right">
              <span className="text-sm text-muted-foreground">
                {hour.toString().padStart(2, '0')}:00
              </span>
            </div>
          ))}
        </div>

        {/* Day Columns */}
        {weekDays.map((date, dayIndex) => {
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const dayAppointments = getAppointmentsForDay(date);
          
          return (
            <div key={date.toISOString()} className={cn(
              "relative border-r last:border-r-0",
              isWeekend && "bg-muted/10"
            )}>
              {/* Time Slots */}
              {timeSlots.map((hour) => (
                <div key={hour} className="h-16 border-b hover:bg-muted/20 transition-colors group">
                  {/* Add appointment button on hover */}
                  {!isWeekend && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 absolute inset-0 w-full h-full rounded-none transition-opacity"
                      onClick={() => {
                        // onDayClick could be extended to handle specific times
                        // For now, just trigger day click
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}

              {/* Appointments Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {dayAppointments.map((appointment) => {
                  const { top, height } = getAppointmentPosition(appointment);
                  
                  return (
                    <div
                      key={appointment.id}
                      className="absolute left-1 right-1 pointer-events-auto"
                      style={{ top: `${top}px`, height: `${Math.max(height, 32)}px` }}
                    >
                      <ModernAppointmentCard
                        appointment={appointment}
                        onEdit={onEditAppointment}
                        onDelete={onDeleteAppointment}
                        onPatientClick={onPatientClick}
                        variant="timeline"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}