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
    <Card className="shadow-elegant hover-glow">
      <CardHeader className="bg-gradient-subtle rounded-t-lg">
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gradient">Wochenansicht</h3>
            <p className="text-sm text-muted-foreground">
              {format(weekStart, 'dd.MM', { locale: de })} - {format(weekEnd, 'dd.MM.yyyy', { locale: de })}
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-8 gap-0 border-t border-border/40">
          {/* Time column */}
          <div className="bg-gradient-subtle border-r border-border/40">
            <div className="h-16 flex items-center justify-center text-sm font-bold border-b border-border/40 bg-muted/30">
              <Clock className="w-4 h-4 mr-2 text-primary" />
              Zeit
            </div>
            {timeSlots.map((time, index) => {
              const isBusinessHour = index >= 2 && index <= 12; // 8:00 - 18:00
              return (
                <div key={time} className={`
                  h-20 flex items-center justify-center text-sm font-medium border-b border-border/30
                  ${isBusinessHour ? 'bg-accent/20 text-foreground' : 'bg-muted/20 text-muted-foreground'}
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
                border-r border-border/40 last:border-r-0
                ${isWeekend ? 'bg-muted/20' : 'bg-card'}
              `}>
                {/* Day header */}
                <div className={`
                  h-16 flex flex-col items-center justify-center text-sm border-b border-border/40
                  transition-all duration-300
                  ${isTodayDate 
                    ? 'bg-gradient-primary text-white shadow-glow' 
                    : isWeekend 
                      ? 'bg-muted/40' 
                      : 'bg-gradient-subtle hover:bg-accent/20'
                  }
                `}>
                  <div className={`font-bold ${isTodayDate ? 'text-white' : isWeekend ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {format(day, 'EEE', { locale: de })}
                  </div>
                  <div className={`text-xs ${isTodayDate ? 'text-white/80' : isWeekend ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                    {format(day, 'dd.MM')}
                  </div>
                  {dayAppointments.length > 0 && (
                    <div className={`
                      text-xs mt-1 px-2 py-0.5 rounded-full font-semibold
                      ${isTodayDate 
                        ? 'bg-white/20 text-white' 
                        : dayAppointments.some(a => a.ai_booked)
                          ? 'bg-gradient-primary text-white'
                          : 'bg-accent text-accent-foreground'
                      }
                    `}>
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
                        h-20 relative border-b border-border/30 transition-colors duration-200
                        ${isBusinessHour && !isWeekend ? 'hover:bg-accent/10' : ''}
                        ${isWeekend ? 'bg-muted/10' : ''}
                      `}>
                        {slotAppointments.map((appointment, aptIndex) => {
                          const duration = appointment.duration_minutes || 30;
                          const height = Math.max(50, (duration / 60) * 80);
                          
                          return (
                            <AppointmentCard
                              key={appointment.id}
                              appointment={appointment}
                              onEdit={onEditAppointment}
                              onDelete={onDeleteAppointment}
                              compact
                              style={{ 
                                position: 'absolute',
                                top: `${aptIndex * 25}px`,
                                left: '4px',
                                right: '4px',
                                height: `${height}px`,
                                zIndex: 10 + aptIndex,
                                minHeight: '50px'
                              }}
                            />
                          );
                        })}
                        
                        {/* Empty slot indicator */}
                        {slotAppointments.length === 0 && isBusinessHour && !isWeekend && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-20 transition-opacity duration-200 pointer-events-none">
                            <div className="w-8 h-8 border-2 border-dashed border-primary/30 rounded-full flex items-center justify-center">
                              <Clock className="w-3 h-3 text-primary/30" />
                            </div>
                          </div>
                        )}
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