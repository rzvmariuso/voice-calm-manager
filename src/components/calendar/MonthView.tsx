import { Card, CardContent } from "@/components/ui/card";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, isSameMonth } from "date-fns";
import { AppointmentWithPatient } from "@/hooks/useAppointments";
import { AppointmentCard } from "./AppointmentCard";

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
      isSameDay(new Date(`${appointment.appointment_date}T00:00:00`), date)
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
    <Card className="shadow-soft">
      <CardContent className="p-0">
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0 border border-border rounded-lg overflow-hidden">
          {/* Week headers */}
          {weekDays.map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground border-b bg-muted/30">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((day, index) => {
            const dayAppointments = getAppointmentsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDate = isToday(day);
            const isWeekend = day.getDay() === 0 || day.getDay() === 6; // Sonntag oder Samstag
            
            return (
              <div 
                key={index} 
                className={`
                  min-h-[140px] p-2 border-r border-b border-border/30 transition-all duration-200
                  ${!isCurrentMonth ? 'opacity-40 bg-muted/10' : ''}
                  ${isTodayDate ? 'bg-primary/5 border-primary/30' : ''}
                  ${isWeekend ? 'bg-muted border-muted-foreground/20 cursor-not-allowed' : 'cursor-pointer hover:bg-accent/30'}
                  ${dayAppointments.length === 0 && !isWeekend ? 'hover:bg-accent/20' : ''}
                `}
                onClick={() => !isWeekend && onDayClick?.(day)}
                onDragOver={!isWeekend ? handleDragOver : undefined}
                onDrop={!isWeekend ? (e) => handleDrop(e, day) : undefined}
              >
                <div className={`
                  text-sm font-medium mb-2 flex items-center justify-between
                  ${isTodayDate ? 'text-primary' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                  ${isWeekend ? 'text-muted-foreground font-semibold' : ''}
                `}>
                  <span>{format(day, 'd')}</span>
                  {isWeekend && (
                    <span className="text-xs bg-muted-foreground/20 text-muted-foreground px-2 py-0.5 rounded-full font-medium">WE</span>
                  )}
                  {dayAppointments.length > 0 && (
                    <span className="text-xs bg-primary/20 text-primary px-1 rounded">
                      {dayAppointments.length}
                    </span>
                  )}
                </div>
                
                <div className="space-y-1">
                  {dayAppointments.slice(0, 4).map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onEdit={onEditAppointment}
                      onDelete={onDeleteAppointment}
                      draggable={true}
                      onDragStart={handleDragStart}
                    />
                  ))}
                  
                  {dayAppointments.length > 4 && (
                    <div className="text-xs text-muted-foreground text-center py-1 bg-muted/50 rounded">
                      +{dayAppointments.length - 4} weitere
                    </div>
                  )}

                  {/* Drop zone indicator */}
                  {dayAppointments.length === 0 && isCurrentMonth && !isWeekend && (
                    <div className="text-xs text-muted-foreground/50 text-center py-4 border-2 border-dashed border-border/30 rounded">
                      Termin hier ablegen
                    </div>
                  )}
                  {isWeekend && isCurrentMonth && (
                    <div className="text-xs text-muted-foreground text-center py-4 bg-muted/30 rounded border-2 border-dashed border-muted-foreground/30">
                      Wochenende
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}