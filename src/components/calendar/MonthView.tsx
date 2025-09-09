import { Card, CardContent } from "@/components/ui/card";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, isSameMonth } from "date-fns";
import { AppointmentWithPatient } from "@/hooks/useAppointments";
import { AppointmentCard } from "./AppointmentCard";
import { toBerlinTime, isTodayInBerlin } from "@/lib/dateUtils";
import { CalendarPlus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

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
    <div className="bg-white rounded-lg border shadow-soft">
      {/* Calendar Header */}
      <div className="border-b border-border p-4">
        <div className="grid grid-cols-7 gap-1">
          {['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'].map((day, index) => (
            <div key={day} className="text-center py-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {day.slice(0, 2)}
              </div>
              <div className="text-sm font-medium text-foreground lg:hidden">
                {day.slice(0, 3)}
              </div>
              <div className="text-sm font-medium text-foreground hidden lg:block">
                {day}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 divide-x divide-border">
        {calendarDays.map((date, index) => {
          const dayAppointments = getAppointmentsForDay(date);
          const isToday = isTodayInBerlin(date);
          const isCurrentMonth = isSameMonth(date, currentDate);
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const dayKey = format(date, 'yyyy-MM-dd');
          
          return (
            <div
              key={index}
              className={cn(
                "min-h-[100px] lg:min-h-[140px] border-b border-border transition-colors",
                "hover:bg-gray-50/50 cursor-pointer group",
                !isCurrentMonth && "bg-gray-50/30",
                isWeekend && !isCurrentMonth && "bg-gray-50/50",
                isWeekend && isCurrentMonth && "bg-gray-50/20"
              )}
              onClick={() => onDayClick?.(date)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, date)}
              data-date={dayKey}
            >
              {/* Day Header */}
              <div className="p-2 lg:p-3">
                <div className={cn(
                  "flex items-center justify-between",
                  "text-sm lg:text-base font-medium",
                  isToday 
                    ? "text-white" 
                    : isCurrentMonth 
                      ? "text-foreground" 
                      : "text-muted-foreground"
                )}>
                  <div className={cn(
                    "flex items-center justify-center w-6 h-6 lg:w-7 lg:h-7 rounded-full transition-colors",
                    isToday 
                      ? "bg-primary text-primary-foreground font-semibold" 
                      : "hover:bg-accent"
                  )}>
                    {format(date, 'd')}
                  </div>
                  
                  {dayAppointments.length > 0 && (
                    <div className="text-xs text-muted-foreground bg-gray-100 px-1.5 py-0.5 rounded-full">
                      {dayAppointments.length}
                    </div>
                  )}
                </div>
                
                {/* Appointments */}
                <div className="mt-2 space-y-1">
                  {dayAppointments.slice(0, 3).map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onEdit={onEditAppointment}
                      onDelete={onDeleteAppointment}
                      compact={true}
                      draggable={true}
                      onDragStart={handleDragStart}
                    />
                  ))}
                  
                  {/* Show remaining count */}
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center py-1 hover:text-foreground cursor-pointer">
                      +{dayAppointments.length - 3} weitere Termine
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}