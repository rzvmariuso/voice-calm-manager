import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { LoadingPage } from "@/components/common/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Clock, User, Calendar as CalendarIcon, Bot } from "lucide-react";
import { useAppointments } from "@/hooks/useAppointments";
import { AppointmentDialog } from "@/components/appointments/AppointmentDialog";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { MonthView } from "@/components/calendar/MonthView";
import { WeekView } from "@/components/calendar/WeekView";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, startOfWeek, endOfWeek } from "date-fns";
import { de } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAppointmentWebhook } from "@/hooks/useAppointmentWebhook";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const { appointments, isLoading, refetch } = useAppointments();
  const { toast } = useToast();
  const { triggerWebhook } = useAppointmentWebhook();
  
  // Dialog states
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<any>(null);

  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    service: 'all',
    aiOnly: false,
    searchTerm: ''
  });

  // Filter appointments based on current filters
  const filteredAppointments = appointments.filter(appointment => {
    // Status filter
    if (filters.status !== 'all' && appointment.status !== filters.status) {
      return false;
    }

    // Service filter
    if (filters.service !== 'all' && appointment.service !== filters.service) {
      return false;
    }

    // AI only filter
    if (filters.aiOnly && !appointment.ai_booked) {
      return false;
    }

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const patientName = `${appointment.patient.first_name} ${appointment.patient.last_name}`.toLowerCase();
      const service = appointment.service.toLowerCase();
      const notes = (appointment.notes || '').toLowerCase();
      
      if (!patientName.includes(searchLower) && 
          !service.includes(searchLower) && 
          !notes.includes(searchLower)) {
        return false;
      }
    }

    return true;
  });

  // Calculate stats for display
  const appointmentStats = {
    total: filteredAppointments.length,
    aiBookings: filteredAppointments.filter(a => a.ai_booked).length,
    thisWeek: (() => {
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
      return filteredAppointments.filter(appointment => {
        const appointmentDate = new Date(`${appointment.appointment_date}T00:00:00`);
        return appointmentDate >= weekStart && appointmentDate <= weekEnd;
      }).length;
    })()
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleEditAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsEditing(true);
    setShowAppointmentDialog(true);
  };

  const handleDeleteAppointment = (appointment: any) => {
    setAppointmentToDelete(appointment);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!appointmentToDelete) return;
    
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentToDelete.id);

      if (error) throw error;

      // Trigger webhook for cancellation
      await triggerWebhook('cancelled', appointmentToDelete.id, appointmentToDelete, appointmentToDelete.patient);

      toast({
        title: "Termin gelöscht",
        description: "Der Termin wurde erfolgreich gelöscht.",
      });

      refetch();
    } catch (error: any) {
      console.error('Error deleting appointment:', error);
      toast({
        title: "Fehler",
        description: "Termin konnte nicht gelöscht werden",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setAppointmentToDelete(null);
    }
  };

  const handleNewAppointment = (selectedDate?: Date) => {
    setSelectedAppointment(selectedDate ? { appointment_date: format(selectedDate, 'yyyy-MM-dd') } : null);
    setIsEditing(false);
    setShowAppointmentDialog(true);
  };

  const handleAppointmentSuccess = () => {
    setShowAppointmentDialog(false);
    setSelectedAppointment(null);
    setIsEditing(false);
    refetch();
  };

const handleDayClick = (date: Date) => {
  // Blockiere Wochenenden (Samstag = 6, Sonntag = 0)
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    toast({
      title: "Wochenende",
      description: "An Wochenenden können keine Termine gebucht werden.",
      variant: "destructive",
    });
    return;
  }
  
  if (isSameDay(date, currentDate)) {
    handleNewAppointment(date);
  } else {
    setCurrentDate(date);
  }
};

const handleAppointmentDrop = async (appointmentId: string, newDate: string) => {
  // Blockiere Wochenenden beim Verschieben
  const date = new Date(newDate);
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    toast({
      title: "Wochenende",
      description: "Termine können nicht auf Wochenenden verschoben werden.",
      variant: "destructive",
    });
    return;
  }

  try {
    const { error } = await supabase
      .from('appointments')
      .update({ appointment_date: newDate })
      .eq('id', appointmentId);

    if (error) throw error;

    toast({
      title: "Termin verschoben",
      description: `Der Termin wurde erfolgreich auf den ${format(new Date(newDate), 'dd.MM.yyyy', { locale: de })} verschoben.`,
    });

    refetch();
  } catch (error) {
    console.error('Error moving appointment:', error);
    toast({
      title: "Fehler",
      description: "Termin konnte nicht verschoben werden",
      variant: "destructive",
    });
  }
};

  const getTodaysAppointments = () => {
    return filteredAppointments.filter(appointment => 
      isSameDay(new Date(`${appointment.appointment_date}T00:00:00`), new Date())
    ).sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1 bg-background">
            <div className="flex items-center p-3 sm:p-6 lg:hidden">
              <MobileNavigation />
            </div>
            <LoadingPage 
              title="Lade Kalender..." 
              description="Termine und Daten werden geladen" 
            />
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 p-3 sm:p-6 bg-background">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4 hidden lg:flex" />
              <MobileNavigation />
            </div>
          </div>

          <div className="space-y-6">
            {/* Header with filters and navigation */}
            <CalendarHeader
              currentDate={currentDate}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onNavigate={navigateDate}
              onToday={handleToday}
              onNewAppointment={() => handleNewAppointment()}
              filters={filters}
              onFiltersChange={setFilters}
              appointmentStats={appointmentStats}
            />

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Main Calendar */}
              <div className="xl:col-span-3">
                {viewMode === 'month' ? (
                  <MonthView
                    currentDate={currentDate}
                    appointments={filteredAppointments}
                    onEditAppointment={handleEditAppointment}
                    onDeleteAppointment={handleDeleteAppointment}
                    onDayClick={handleDayClick}
                    onAppointmentDrop={handleAppointmentDrop}
                  />
                ) : (
                  <WeekView
                    currentDate={currentDate}
                    appointments={filteredAppointments}
                    onEditAppointment={handleEditAppointment}
                    onDeleteAppointment={handleDeleteAppointment}
                  />
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Today's Appointments */}
                <Card className="border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-primary" />
                      <div>
                        <h3 className="font-medium">Heute</h3>
                        <p className="text-xs text-muted-foreground font-normal">
                          {format(new Date(), 'EEE, dd.MM.yyyy', { locale: de })}
                        </p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    {(() => {
                      const todayAppointments = getTodaysAppointments();
                      if (todayAppointments.length === 0) {
                        return (
                          <div className="text-center py-6">
                            <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                            <p className="text-sm text-muted-foreground mb-3">Keine Termine heute</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 text-xs"
                              onClick={() => handleNewAppointment(new Date())}
                            >
                              <CalendarIcon className="w-3 h-3 mr-1" />
                              Hinzufügen
                            </Button>
                          </div>
                        );
                      }
                      
                      return (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground">
                              {todayAppointments.length} {todayAppointments.length === 1 ? 'Termin' : 'Termine'}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-xs p-1"
                              onClick={() => handleNewAppointment(new Date())}
                            >
                              + Hinzufügen
                            </Button>
                          </div>
                          
                          {todayAppointments.map((appointment) => (
                            <div 
                              key={appointment.id} 
                              className="group p-2 border rounded hover:bg-muted/20 transition-colors cursor-pointer"
                              onClick={() => handleEditAppointment(appointment)}
                            >
                              <div className="flex items-start justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <div className={`
                                    w-6 h-6 rounded flex items-center justify-center text-xs font-medium
                                    ${appointment.ai_booked ? 'bg-primary/10 text-primary' : 'bg-muted'}
                                  `}>
                                    {appointment.ai_booked ? (
                                      <Bot className="w-3 h-3" />
                                    ) : (
                                      <Clock className="w-3 h-3" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1 mb-0.5">
                                      <span className="text-sm font-medium">
                                        {appointment.appointment_time}
                                      </span>
                                      <Badge 
                                        variant="secondary"
                                        className="text-xs h-4 px-1"
                                      >
                                        {appointment.status === 'confirmed' ? 'OK' : 
                                         appointment.status === 'pending' ? 'Warten' :
                                         appointment.status === 'completed' ? 'Fertig' : 'Abgesagt'}
                                      </Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {appointment.patient.first_name} {appointment.patient.last_name}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-xs text-muted-foreground bg-muted/30 rounded px-2 py-1">
                                {appointment.service} • {appointment.duration_minutes || 30} Min
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Enhanced Statistics */}
                <Card className="border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <h3 className="font-medium">Statistiken</h3>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-center p-2 bg-muted/20 rounded">
                        <div className="text-lg font-medium">{appointmentStats.total}</div>
                        <div className="text-muted-foreground">Gesamt</div>
                      </div>
                      <div className="text-center p-2 bg-primary/10 rounded">
                        <div className="text-lg font-medium text-primary">{appointmentStats.aiBookings}</div>
                        <div className="text-muted-foreground">KI-Termine</div>
                      </div>
                      <div className="text-center p-2 bg-muted/20 rounded">
                        <div className="text-lg font-medium">{appointmentStats.thisWeek}</div>
                        <div className="text-muted-foreground">Diese Woche</div>
                      </div>
                      <div className="text-center p-2 bg-muted/20 rounded">
                        <div className="text-lg font-medium">
                          {appointmentStats.total > 0 ? Math.round((appointmentStats.aiBookings / appointmentStats.total) * 100) : 0}%
                        </div>
                        <div className="text-muted-foreground">KI-Anteil</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
            </div>

            {/* Appointment Dialog */}
            <AppointmentDialog
              open={showAppointmentDialog}
              onOpenChange={setShowAppointmentDialog}
              appointment={selectedAppointment}
              isEditing={isEditing}
              onSuccess={handleAppointmentSuccess}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Termin löschen</AlertDialogTitle>
                  <AlertDialogDescription>
                    Möchten Sie diesen Termin wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                    Löschen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
                        
                        <div className="bg-gradient-secondary/10 rounded-xl p-4 text-center border border-secondary/20">
                          <div className="text-2xl font-bold text-secondary mb-1">
                            {appointmentStats.aiBookings}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            KI-Buchungen
                          </div>
                        </div>
                      </div>
                      
                      {/* Additional Stats */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-accent/10 rounded-lg border border-accent/20">
                          <span className="text-sm font-medium text-foreground flex items-center gap-2">
                            📅 Diese Woche
                          </span>
                          <span className="font-bold text-accent-foreground">{appointmentStats.thisWeek}</span>
                        </div>

                        {filters.searchTerm && (
                          <div className="flex justify-between items-center pt-3 border-t border-border/40">
                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                              🔍 Suchergebnisse
                            </span>
                            <Badge variant="outline" className="bg-warning/10 border-warning text-warning">
                              {filteredAppointments.length}
                            </Badge>
                          </div>
                        )}
                        
                        {/* AI Booking Percentage */}
                        {appointmentStats.total > 0 && (
                          <div className="bg-gradient-accent rounded-lg p-3 border border-border/40">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">🤖 KI-Anteil</span>
                              <span className="font-bold text-accent-foreground">
                                {Math.round((appointmentStats.aiBookings / appointmentStats.total) * 100)}%
                              </span>
                            </div>
                            <div className="w-full bg-muted/50 rounded-full h-2">
                              <div 
                                className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(appointmentStats.aiBookings / appointmentStats.total) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Enhanced Legend */}
                <Card className="shadow-elegant hover-glow animate-fade-in">
                  <CardHeader className="bg-gradient-subtle rounded-t-lg">
                    <CardTitle className="text-xl flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-gradient">Legende</h3>
                        <p className="text-sm text-muted-foreground font-normal">Status-Übersicht</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-gradient-primary/10 rounded-lg border border-primary/20">
                        <div className="w-5 h-5 bg-gradient-primary rounded-lg shadow-glow"></div>
                        <div>
                          <span className="text-sm font-semibold text-foreground">🤖 KI-Buchung</span>
                          <p className="text-xs text-muted-foreground">Automatisch gebucht</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg border border-success/20">
                        <div className="w-5 h-5 bg-success rounded-lg"></div>
                        <div>
                          <span className="text-sm font-semibold text-foreground">✅ Bestätigt</span>
                          <p className="text-xs text-muted-foreground">Termin bestätigt</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-warning/10 rounded-lg border border-warning/20">
                        <div className="w-5 h-5 bg-warning rounded-lg"></div>
                        <div>
                          <span className="text-sm font-semibold text-foreground">⏳ Wartend</span>
                          <p className="text-xs text-muted-foreground">Noch nicht bestätigt</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg border border-accent/20">
                        <div className="w-5 h-5 bg-accent rounded-lg"></div>
                        <div>
                          <span className="text-sm font-semibold text-foreground">🏁 Abgeschlossen</span>
                          <p className="text-xs text-muted-foreground">Termin durchgeführt</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                        <div className="w-5 h-5 bg-destructive rounded-lg"></div>
                        <div>
                          <span className="text-sm font-semibold text-foreground">❌ Abgesagt</span>
                          <p className="text-xs text-muted-foreground">Termin storniert</p>
                        </div>
                      </div>

                      {/* Quick Tips */}
                      <div className="border-t border-border/40 pt-4 mt-6">
                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          💡 Schnell-Tipps
                        </h4>
                        <div className="space-y-2 text-xs text-muted-foreground">
                          <p>• Drag & Drop um Termine zu verschieben</p>
                          <p>• Klick auf leeren Tag für neuen Termin</p>
                          <p>• Hover über Termine für Details</p>
                          <p>• Wochenenden sind gesperrt</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
        
        {/* Appointment Dialog */}
        <AppointmentDialog
          open={showAppointmentDialog}
          onOpenChange={setShowAppointmentDialog}
          appointment={selectedAppointment}
          isEditing={isEditing}
          onSuccess={handleAppointmentSuccess}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent 
            className="animate-scale-in"
            aria-describedby="delete-appointment-description"
          >
            <AlertDialogHeader>
              <AlertDialogTitle>Termin löschen?</AlertDialogTitle>
              <AlertDialogDescription id="delete-appointment-description">
                Möchten Sie den folgenden Termin wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                {appointmentToDelete && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="font-medium">
                      {appointmentToDelete.patient?.first_name} {appointmentToDelete.patient?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(`${appointmentToDelete.appointment_date}T${appointmentToDelete.appointment_time}`), 'PPpp', { locale: de })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {appointmentToDelete.service}
                    </p>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="hover-scale">Abbrechen</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                className="bg-destructive hover:bg-destructive/90 hover-scale"
              >
                Löschen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SidebarProvider>
  );
}