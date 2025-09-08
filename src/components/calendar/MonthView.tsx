import { Card, CardContent } from "@/components/ui/card";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, isSameMonth } from "date-fns";
import { AppointmentWithPatient } from "@/hooks/useAppointments";
import { AppointmentCard } from "./AppointmentCard";
import { toBerlinTime, isTodayInBerlin } from "@/lib/dateUtils";
import { CalendarPlus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

interface MonthViewProps {
  currentDate: Date;
  appointments: AppointmentWithPatient[];
  onEditAppointment: (appointment: AppointmentWithPatient) => void;
  onDeleteAppointment: (appointment: AppointmentWithPatient) => void;
  onDayClick?: (date: Date) => void;
  onAppointmentDrop?: (appointmentId: string, newDate: string) => void;
}

export function MonthView({ 
  currentDate, 
  appointments, 
  onEditAppointment, 
  onDeleteAppointment,
  onDayClick,
  onAppointmentDrop
}: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // Pad calendar to show full weeks (Monday start)
  const startDay = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDay = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: startDay, end: endDay });

  const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(appointment => 
      isSameDay(toBerlinTime(`${appointment.appointment_date}T00:00:00`), date)
    ).sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    if (onAppointmentDrop) {
      const appointmentId = e.dataTransfer.getData('appointmentId');
      if (appointmentId) {
        onAppointmentDrop(appointmentId, format(date, 'yyyy-MM-dd'));
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, appointment: AppointmentWithPatient) => {
    e.dataTransfer.setData('appointmentId', appointment.id);
  };

  return (
    <Card className="shadow-elegant hover-glow">
      <CardContent className="p-0">
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0 border border-border/60 rounded-lg overflow-hidden bg-card">
          {/* Week headers */}
          {weekDays.map(day => (
            <div key={day} className="p-4 text-center text-sm font-semibold text-foreground border-b-2 border-border/40 bg-gradient-subtle">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((day, index) => {
            const dayAppointments = getAppointmentsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDate = isTodayInBerlin(day);
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;
            
            return (
              <div 
                key={index} 
                className={`
                  group relative min-h-[150px] p-3 border-r border-b border-border/40 
                  transition-all duration-300 ease-out
                  ${!isCurrentMonth ? 'opacity-50 bg-muted/20' : 'bg-card'}
                  ${isTodayDate ? 'bg-gradient-primary/5 border-primary/40 shadow-soft' : ''}
                  ${isWeekend ? 'bg-muted/40 border-muted-foreground/30 cursor-not-allowed' : 'cursor-pointer hover:bg-accent/20 hover:shadow-soft hover:scale-[1.02]'}
                  ${dayAppointments.length === 0 && !isWeekend && isCurrentMonth ? 'hover:bg-primary/5' : ''}
                `}
                onClick={() => !isWeekend && onDayClick?.(day)}
                onDragOver={!isWeekend ? handleDragOver : undefined}
                onDrop={!isWeekend ? (e) => handleDrop(e, day) : undefined}
              >
                {/* Day header */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`
                    text-lg font-bold
                    ${isTodayDate 
                      ? 'text-primary bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center' 
                      : isCurrentMonth 
                        ? 'text-foreground' 
                        : 'text-muted-foreground'
                    }
                    ${isWeekend ? 'text-muted-foreground' : ''}
                  `}>
                    {format(day, 'd')}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {isWeekend && (
                      <span className="text-xs bg-muted px-2 py-1 rounded-full font-medium text-muted-foreground">
                        WE
                      </span>
                    )}
                    {dayAppointments.length > 0 && (
                      <span className={`
                        text-xs px-2 py-1 rounded-full font-semibold
                        ${dayAppointments.some(a => a.ai_booked) 
                          ? 'bg-gradient-primary text-white shadow-glow' 
                          : 'bg-accent text-accent-foreground'
                        }
                      `}>
                        {dayAppointments.length}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Appointments */}
                <div className="space-y-2">
                  {dayAppointments.slice(0, 3).map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onEdit={onEditAppointment}
                      onDelete={onDeleteAppointment}
                      draggable={true}
                      onDragStart={handleDragStart}
                      compact
                    />
                  ))}
                  
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-center py-2 bg-gradient-accent rounded-lg font-medium text-accent-foreground animate-fade-in">
                      +{dayAppointments.length - 3} weitere Termine
                    </div>
                  )}

                  {/* Enhanced empty states */}
                  {dayAppointments.length === 0 && isCurrentMonth && !isWeekend && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center py-6">
                      <CalendarPlus className="w-6 h-6 mx-auto mb-2 text-primary/60" />
                      <p className="text-xs text-primary/60 font-medium">
                        Termin hinzufügen
                      </p>
                    </div>
                  )}
                  
                  {isWeekend && isCurrentMonth && dayAppointments.length === 0 && (
                    <div className="text-center py-6">
                      <div className="w-8 h-8 mx-auto mb-2 bg-muted rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-muted-foreground">WE</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Wochenende
                      </p>
                    </div>
                  )}
                </div>

                {/* Drag indicator */}
                {!isWeekend && (
                  <div className="absolute inset-0 border-2 border-dashed border-primary/50 rounded-lg opacity-0 group-hover:opacity-30 transition-opacity duration-200 pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}