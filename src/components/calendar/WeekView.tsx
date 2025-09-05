import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, Clock, Edit, Trash2 } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday } from "date-fns";
import { de } from "date-fns/locale";
import { AppointmentWithPatient } from "@/hooks/useAppointments";
import { AppointmentCard } from "./AppointmentCard";
import { toBerlinTime, isTodayInBerlin } from "@/lib/dateUtils";

interface WeekViewProps {
  currentDate: Date;
  appointments: AppointmentWithPatient[];
  onEditAppointment: (appointment: AppointmentWithPatient) => void;
  onDeleteAppointment: (appointment: AppointmentWithPatient) => void;
}

export function WeekView({ 
  currentDate, 
  appointments, 
  onEditAppointment, 
  onDeleteAppointment 
}: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(appointment => 
      isSameDay(toBerlinTime(`${appointment.appointment_date}T00:00:00`), date)
    ).sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
  };

  const timeSlots = Array.from({ length: 19 }, (_, i) => {
    const hour = i + 6; // Start at 6 AM
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Wochenansicht
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-8 gap-2">
          {/* Time column */}
          <div className="space-y-2">
            <div className="h-12 flex items-center justify-center text-sm font-medium border-b">
              Zeit
            </div>
            {timeSlots.map(time => (
              <div key={time} className="h-16 flex items-center justify-center text-xs text-muted-foreground border-r">
                {time}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, dayIndex) => {
            const dayAppointments = getAppointmentsForDay(day);
            const isTodayDate = isTodayInBerlin(day);
            
            return (
              <div key={dayIndex} className="space-y-2">
                {/* Day header */}
                <div className={`
                  h-12 flex flex-col items-center justify-center text-sm border-b
                  ${isTodayDate ? 'bg-primary/5 border-primary/30' : ''}
                `}>
                  <div className={`font-medium ${isTodayDate ? 'text-primary' : ''}`}>
                    {format(day, 'EEE', { locale: de })}
                  </div>
                  <div className={`text-xs ${isTodayDate ? 'text-primary' : 'text-muted-foreground'}`}>
                    {format(day, 'dd.MM')}
                  </div>
                </div>

                {/* Time slots with appointments */}
                <div className="relative space-y-2">
                  {timeSlots.map((timeSlot, slotIndex) => {
                    const slotAppointments = dayAppointments.filter(apt => {
                      const aptHour = parseInt(apt.appointment_time.split(':')[0]);
                      const slotHour = parseInt(timeSlot.split(':')[0]);
                      return aptHour === slotHour;
                    });

                    return (
                      <div key={slotIndex} className="h-16 relative border border-border/30 rounded">
                        {slotAppointments.map((appointment, aptIndex) => (
                          <AppointmentCard
                            key={appointment.id}
                            appointment={appointment}
                            onEdit={onEditAppointment}
                            onDelete={onDeleteAppointment}
                            compact
                            style={{ 
                              position: 'absolute',
                              top: `${aptIndex * 20}px`,
                              left: '2px',
                              right: '2px',
                              height: `${Math.max(40, (appointment.duration_minutes || 30) / 60 * 64)}px`,
                              zIndex: 10 + aptIndex
                            }}
                          />
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}