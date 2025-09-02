import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Bot, Clock } from "lucide-react";
import { useAppointments } from "@/hooks/useAppointments";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth } from "date-fns";
import { de } from "date-fns/locale";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { appointments, isLoading } = useAppointments();
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Pad calendar to show full weeks
  const startDay = new Date(monthStart);
  startDay.setDate(startDay.getDate() - monthStart.getDay() + 1); // Start on Monday
  
  const endDay = new Date(monthEnd);
  endDay.setDate(endDay.getDate() + (7 - monthEnd.getDay()));
  
  const calendarDays = eachDayOfInterval({ start: startDay, end: endDay });
  
  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(appointment => 
      isSameDay(new Date(appointment.appointment_date), date)
    );
  };
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1 p-6 bg-background">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Lade Kalender...</p>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 p-6 bg-background">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                  Kalender
                </h1>
                <p className="text-muted-foreground">
                  Monatsübersicht aller Termine
                </p>
              </div>
            </div>
            <Button className="bg-gradient-primary text-white shadow-glow">
              <Plus className="w-4 h-4 mr-2" />
              Neuer Termin
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-3">
              <Card className="shadow-soft">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-primary" />
                      {format(currentDate, 'MMMM yyyy', { locale: de })}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigateMonth('prev')}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCurrentDate(new Date())}
                      >
                        Heute
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigateMonth('next')}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Week headers */}
                    {weekDays.map(day => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground border-b">
                        {day}
                      </div>
                    ))}
                    
                    {/* Calendar days */}
                    {calendarDays.map((day, index) => {
                      const dayAppointments = getAppointmentsForDay(day);
                      const isCurrentMonth = isSameMonth(day, currentDate);
                      const isTodayDate = isToday(day);
                      
                      return (
                        <div 
                          key={index} 
                          className={`
                            min-h-[120px] p-2 border border-border transition-colors hover:bg-accent/30
                            ${!isCurrentMonth ? 'opacity-40 bg-muted/20' : ''}
                            ${isTodayDate ? 'bg-primary/5 border-primary/30' : ''}
                          `}
                        >
                          <div className={`
                            text-sm font-medium mb-2 
                            ${isTodayDate ? 'text-primary' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                          `}>
                            {format(day, 'd')}
                          </div>
                          
                          <div className="space-y-1">
                            {dayAppointments.slice(0, 3).map((appointment, i) => (
                              <div 
                                key={i}
                                className={`
                                  text-xs p-1 rounded text-white cursor-pointer truncate
                                  ${appointment.ai_booked 
                                    ? 'bg-gradient-primary shadow-sm' 
                                    : appointment.status === 'confirmed' 
                                      ? 'bg-success' 
                                      : 'bg-warning'
                                  }
                                `}
                                title={`${appointment.appointment_time} - ${appointment.patient.first_name} ${appointment.patient.last_name} (${appointment.service})`}
                              >
                                <div className="flex items-center gap-1">
                                  {appointment.ai_booked && <Bot className="w-2 h-2" />}
                                  <Clock className="w-2 h-2" />
                                  <span>{appointment.appointment_time}</span>
                                </div>
                                <div className="truncate">
                                  {appointment.patient.first_name} {appointment.patient.last_name}
                                </div>
                              </div>
                            ))}
                            
                            {dayAppointments.length > 3 && (
                              <div className="text-xs text-muted-foreground text-center py-1">
                                +{dayAppointments.length - 3} weitere
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Today's Appointments */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-lg">Heute</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const todayAppointments = getAppointmentsForDay(new Date());
                    if (todayAppointments.length === 0) {
                      return (
                        <p className="text-sm text-muted-foreground">
                          Keine Termine heute
                        </p>
                      );
                    }
                    
                    return (
                      <div className="space-y-3">
                        {todayAppointments.map((appointment) => (
                          <div key={appointment.id} className="p-3 bg-accent/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="w-3 h-3 text-primary" />
                              <span className="font-medium text-sm">
                                {appointment.appointment_time}
                              </span>
                              {appointment.ai_booked && (
                                <Badge variant="outline" className="border-primary text-primary text-xs">
                                  <Bot className="w-2 h-2 mr-1" />
                                  KI
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm font-medium">
                              {appointment.patient.first_name} {appointment.patient.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {appointment.service}
                            </p>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Calendar Stats */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-lg">Monatsstatistik</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Gesamt Termine</span>
                      <span className="font-medium">
                        {monthDays.reduce((count, day) => 
                          count + getAppointmentsForDay(day).length, 0
                        )}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">KI-Buchungen</span>
                      <span className="font-medium text-primary">
                        {monthDays.reduce((count, day) => 
                          count + getAppointmentsForDay(day).filter(a => a.ai_booked).length, 0
                        )}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Termine diese Woche</span>
                      <span className="font-medium">
                        {(() => {
                          const weekStart = new Date();
                          weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
                          const weekEnd = new Date(weekStart);
                          weekEnd.setDate(weekStart.getDate() + 6);
                          
                          return eachDayOfInterval({ start: weekStart, end: weekEnd })
                            .reduce((count, day) => count + getAppointmentsForDay(day).length, 0);
                        })()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Legend */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-lg">Legende</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-primary rounded"></div>
                      <span className="text-sm">KI-Buchung</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-success rounded"></div>
                      <span className="text-sm">Bestätigt</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-warning rounded"></div>
                      <span className="text-sm">Wartend</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}