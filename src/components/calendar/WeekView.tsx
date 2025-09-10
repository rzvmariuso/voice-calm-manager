import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Bot, Clock, Edit, Trash2 } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday } from "date-fns";
import { de } from "date-fns/locale";
import { AppointmentWithPatient } from "@/hooks/useAppointments";
import { AppointmentCard } from "./AppointmentCard";
import { toBerlinTime, isTodayInBerlin, formatAppointmentTime } from "@/lib/dateUtils";

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
  // Persistent panel sizes for day columns
  const [panelSizes, setPanelSizes] = useState(() => {
    const saved = localStorage.getItem('calendar-week-panels');
    return saved ? JSON.parse(saved) : Array(8).fill(100 / 8); // 8 includes time column
  });

  useEffect(() => {
    localStorage.setItem('calendar-week-panels', JSON.stringify(panelSizes));
  }, [panelSizes]);

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
            <div className="text-lg font-medium">Wochenansicht</div>
            <p className="text-xs text-muted-foreground font-normal">
              {format(weekStart, 'dd.MM', { locale: de })} - {format(weekEnd, 'dd.MM.yyyy', { locale: de })}
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ResizablePanelGroup direction="horizontal" onLayout={setPanelSizes}>
          {/* Time column */}
          <ResizablePanel defaultSize={panelSizes[0]} minSize={8} maxSize={20}>
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
          </ResizablePanel>

          <ResizableHandle withHandle />

          {weekDays.map((day, dayIndex) => {
            const dayAppointments = getAppointmentsForDay(day);
            const isTodayDate = isTodayInBerlin(day);
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;
            
            return (
              <React.Fragment key={dayIndex}>
                <ResizablePanel defaultSize={panelSizes[dayIndex + 1]} minSize={10} maxSize={25}>
                  <div className={`
                    border-r border-border last:border-r-0
                    ${isWeekend ? 'bg-muted/10' : 'bg-card'}
                  `}>
                    {/* Day header */}
                    <div className={`
                      h-12 flex flex-col items-center justify-center text-sm border-b border-border
                      ${isTodayDate 
                        ? 'bg-primary text-primary-foreground' 
                        : isWeekend 
                          ? 'bg-muted/20' 
                          : 'bg-muted/10'
                      }
                    `}>
                      <div className={`text-sm font-medium ${isTodayDate ? 'text-primary-foreground' : isWeekend ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {format(day, 'EEEE', { locale: de })}
                      </div>
                      <div className={`text-xs ${isTodayDate ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
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
                        const height = Math.max(36, (duration / 60) * 64);
                        
                        return (
                          <AppointmentCard
                            key={appointment.id}
                            appointment={appointment}
                            onEdit={onEditAppointment}
                            onDelete={onDeleteAppointment}
                            compact
                            style={{ 
                              position: 'absolute',
                              top: `${aptIndex * 18}px`,
                              left: '1px',
                              right: '1px',
                              height: `${height}px`,
                              zIndex: 10 + aptIndex,
                              minHeight: '36px'
                            }}
                          />
                        );
                      })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </ResizablePanel>
                {dayIndex < 6 && <ResizableHandle withHandle />}
              </React.Fragment>
            );
          })}
        </ResizablePanelGroup>
      </CardContent>
    </Card>
  );
}