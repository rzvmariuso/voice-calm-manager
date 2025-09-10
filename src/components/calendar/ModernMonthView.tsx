import { useMemo, useState } from "react";
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, isToday, isSameDay, startOfWeek, endOfWeek } from "date-fns";
import { de } from "date-fns/locale";
import { AppointmentWithPatient } from "@/hooks/useAppointments";
import { ModernAppointmentCard } from "./ModernAppointmentCard";
import { DayAppointmentsDialog } from "./DayAppointmentsDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModernMonthViewProps {
  currentDate: Date;
  appointments: AppointmentWithPatient[];
  onEditAppointment: (appointment: AppointmentWithPatient) => void;
  onDeleteAppointment: (appointment: AppointmentWithPatient) => void;
  onPatientClick: (patientId: string) => void;
  onDayClick: (date: Date) => void;
  onAppointmentDrop: (appointmentId: string, newDate: string) => void;
}

export function ModernMonthView({
  currentDate,
  appointments,
  onEditAppointment,
  onDeleteAppointment,
  onPatientClick,
  onDayClick,
  onAppointmentDrop
}: ModernMonthViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDayDialog, setShowDayDialog] = useState(false);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  const getAppointmentsForDay = (date: Date) => {
    return appointments
      .filter(appointment => 
        isSameDay(new Date(`${appointment.appointment_date}T00:00:00`), date)
      )
      .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    const appointmentId = e.dataTransfer.getData('appointmentId');
    if (appointmentId) {
      onAppointmentDrop(appointmentId, format(date, 'yyyy-MM-dd'));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const weeks = [];
  
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b bg-muted/30">
        {weekdays.map((day) => (
          <div key={day} className="p-4 text-center font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-border">
        {calendarDays.map((date) => {
          const dayAppointments = getAppointmentsForDay(date);
          const isCurrentMonth = isSameMonth(date, currentDate);
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const dayNumber = format(date, 'd');

          return (
            <div
              key={date.toISOString()}
              className={cn(
                "min-h-[120px] p-2 relative group transition-colors",
                isCurrentMonth ? "bg-background hover:bg-muted/20" : "bg-muted/10 text-muted-foreground",
                isWeekend && "bg-muted/20",
                isToday(date) && "bg-primary/5 border-primary/20"
              )}
              onDrop={(e) => handleDrop(e, date)}
              onDragOver={handleDragOver}
              onClick={() => !isWeekend && onDayClick(date)}
            >
              {/* Day Number */}
              <div className="flex items-center justify-between mb-2">
                <span className={cn(
                  "text-sm font-medium",
                  isToday(date) && "w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs"
                )}>
                  {dayNumber}
                </span>
                
                {/* Add Button - visible on hover */}
                {isCurrentMonth && !isWeekend && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDayClick(date);
                    }}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                )}
              </div>

              {/* Appointments */}
              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map((appointment) => (
                  <ModernAppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onEdit={onEditAppointment}
                    onDelete={onDeleteAppointment}
                    onPatientClick={onPatientClick}
                    variant="compact"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('appointmentId', appointment.id);
                    }}
                  />
                ))}
                
                {/* Show more indicator */}
                {dayAppointments.length > 3 && (
                  <button
                    className="text-xs text-muted-foreground px-2 py-1 bg-muted/50 rounded text-center hover:bg-muted transition-colors w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDate(date);
                      setShowDayDialog(true);
                    }}
                  >
                    +{dayAppointments.length - 3} weitere
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Day Appointments Dialog */}
      {selectedDate && (
        <DayAppointmentsDialog
          date={selectedDate}
          appointments={getAppointmentsForDay(selectedDate)}
          open={showDayDialog}
          onOpenChange={setShowDayDialog}
          onEditAppointment={onEditAppointment}
          onDeleteAppointment={onDeleteAppointment}
          onPatientClick={onPatientClick}
        />
      )}
    </div>
  );
}