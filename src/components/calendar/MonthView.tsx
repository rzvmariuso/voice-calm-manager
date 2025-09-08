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
    <Card className="border">
      <CardContent className="p-0">
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0 border border-border rounded-lg overflow-hidden bg-card">
          {/* Week headers */}
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-xs font-medium text-muted-foreground border-b border-border bg-muted/20">
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
                  group relative min-h-[100px] p-2 border-r border-b border-border/30 
                  transition-colors duration-200
                  ${!isCurrentMonth ? 'opacity-40 bg-muted/10' : 'bg-card'}
                  ${isTodayDate ? 'bg-primary/5 border-primary/20' : ''}
                  ${isWeekend ? 'bg-muted/20 cursor-not-allowed' : 'cursor-pointer hover:bg-muted/10'}
                `}
                onClick={() => !isWeekend && onDayClick?.(day)}
                onDragOver={!isWeekend ? handleDragOver : undefined}
                onDrop={!isWeekend ? (e) => handleDrop(e, day) : undefined}
              >
                {/* Day header */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`
                    text-sm font-medium
                    ${isTodayDate 
                      ? 'text-white bg-primary w-6 h-6 rounded-full flex items-center justify-center text-xs' 
                      : isCurrentMonth 
                        ? 'text-foreground' 
                        : 'text-muted-foreground'
                    }
                    ${isWeekend ? 'text-muted-foreground' : ''}
                  `}>
                    {format(day, 'd')}
                  </span>
                  
                  {dayAppointments.length > 0 && (
                    <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium">
                      {dayAppointments.length}
                    </span>
                  )}
                </div>
                
                {/* Appointments */}
                <div className="space-y-1">
                  {dayAppointments.slice(0, 2).map((appointment) => (
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
                  
                  {dayAppointments.length > 2 && (
                    <div className="text-xs text-center py-1 text-muted-foreground">
                      +{dayAppointments.length - 2} weitere
                    </div>
                  )}

                  {/* Empty state */}
                  {dayAppointments.length === 0 && isCurrentMonth && !isWeekend && (
                    <div className="opacity-0 group-hover:opacity-50 transition-opacity text-center py-4">
                      <CalendarPlus className="w-4 h-4 mx-auto text-muted-foreground" />
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