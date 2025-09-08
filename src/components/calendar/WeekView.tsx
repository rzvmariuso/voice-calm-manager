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
    <Card className="border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-medium">Wochenansicht</h3>
            <p className="text-xs text-muted-foreground font-normal">
              {format(weekStart, 'dd.MM', { locale: de })} - {format(weekEnd, 'dd.MM.yyyy', { locale: de })}
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-8 gap-0">
          {/* Time column */}
          <div className="bg-muted/10 border-r border-border">
            <div className="h-12 flex items-center justify-center text-xs font-medium border-b border-border bg-muted/20">
              Zeit
            </div>
            {timeSlots.map((time, index) => {
              const isBusinessHour = index >= 2 && index <= 12; // 8:00 - 18:00
              return (
                <div key={time} className={`
                  h-16 flex items-center justify-center text-xs border-b border-border/30
                  ${isBusinessHour ? 'bg-card text-foreground' : 'bg-muted/10 text-muted-foreground'}
                `}>
                  {time}
                </div>
              );
            })}
          </div>

          {/* Day columns */}
          {weekDays.map((day, dayIndex) => {
            const dayAppointments = getAppointmentsForDay(day);
            const isTodayDate = isTodayInBerlin(day);
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;
            
            return (
              <div key={dayIndex} className={`
                border-r border-border last:border-r-0
                ${isWeekend ? 'bg-muted/10' : 'bg-card'}
              `}>
                {/* Day header */}
                <div className={`
                  h-12 flex flex-col items-center justify-center text-sm border-b border-border
                  ${isTodayDate 
                    ? 'bg-primary text-white' 
                    : isWeekend 
                      ? 'bg-muted/20' 
                      : 'bg-muted/10'
                  }
                `}>
                  <div className={`text-xs font-medium ${isTodayDate ? 'text-white' : isWeekend ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {format(day, 'EEE', { locale: de })}
                  </div>
                  <div className={`text-xs ${isTodayDate ? 'text-white/80' : 'text-muted-foreground'}`}>
                    {format(day, 'dd.MM')}
                  </div>
                  {dayAppointments.length > 0 && (
                    <div className="text-xs mt-0.5 px-1 bg-primary/10 text-primary rounded">
                      {dayAppointments.length}
                    </div>
                  )}
                </div>

                {/* Time slots with appointments */}
                <div className="relative">
                  {timeSlots.map((timeSlot, slotIndex) => {
                    const slotAppointments = dayAppointments.filter(apt => {
                      const aptHour = parseInt(apt.appointment_time.split(':')[0]);
                      const slotHour = parseInt(timeSlot.split(':')[0]);
                      return aptHour === slotHour;
                    });

                    const isBusinessHour = slotIndex >= 2 && slotIndex <= 12;

                    return (
                      <div key={slotIndex} className={`
                        h-16 relative border-b border-border/30
                        ${isBusinessHour && !isWeekend ? 'hover:bg-muted/10' : ''}
                        ${isWeekend ? 'bg-muted/5' : ''}
                      `}>
                        {slotAppointments.map((appointment, aptIndex) => {
                          const duration = appointment.duration_minutes || 30;
                          const height = Math.max(40, (duration / 60) * 64);
                          
                          return (
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
                                height: `${height}px`,
                                zIndex: 10 + aptIndex,
                                minHeight: '40px'
                              }}
                            />
                          );
                        })}
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