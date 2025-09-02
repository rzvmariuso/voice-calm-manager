import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Clock, User, Calendar as CalendarIcon } from "lucide-react";
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
    if (isSameDay(date, currentDate)) {
      handleNewAppointment(date);
    } else {
      setCurrentDate(date);
    }
  };

  const handleAppointmentDrop = async (appointmentId: string, newDate: string) => {
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
          <main className="flex-1 p-6 bg-background">
            <div className="flex items-center justify-center h-64">
              <div className="text-center animate-fade-in">
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
        <main className="flex-1 p-3 sm:p-6 bg-background">
          <div className="flex items-center mb-6">
            <SidebarTrigger className="mr-4" />
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
              <div className="space-y-6">
                {/* Today's Appointments */}
                <Card className="shadow-soft animate-fade-in">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-primary" />
                      Heute
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const todayAppointments = getTodaysAppointments();
                      if (todayAppointments.length === 0) {
                        return (
                          <div className="text-center py-4">
                            <CalendarIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Keine Termine heute
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2 hover-scale"
                              onClick={() => handleNewAppointment(new Date())}
                            >
                              Termin hinzufügen
                            </Button>
                          </div>
                        );
                      }
                      
                      return (
                        <div className="space-y-3">
                          {todayAppointments.map((appointment) => (
                            <div 
                              key={appointment.id} 
                              className="p-3 bg-accent/30 rounded-lg hover:bg-accent/40 transition-colors cursor-pointer animate-fade-in hover-scale"
                              onClick={() => handleEditAppointment(appointment)}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-3 h-3 text-primary" />
                                <span className="font-medium text-sm">
                                  {appointment.appointment_time}
                                </span>
                                {appointment.ai_booked && (
                                  <Badge variant="outline" className="border-primary text-primary text-xs">
                                    KI
                                  </Badge>
                                )}
                                <Badge 
                                  variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {appointment.status === 'confirmed' ? 'Bestätigt' : 
                                   appointment.status === 'pending' ? 'Wartend' :
                                   appointment.status === 'completed' ? 'Fertig' : 'Abgesagt'}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="w-3 h-3 text-muted-foreground" />
                                <p className="text-sm font-medium">
                                  {appointment.patient.first_name} {appointment.patient.last_name}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {appointment.service} • {appointment.duration_minutes || 30}min
                              </p>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Calendar Stats */}
                <Card className="shadow-soft animate-fade-in">
                  <CardHeader>
                    <CardTitle className="text-lg">Statistiken</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {viewMode === 'month' ? 'Termine im Monat' : 'Termine in der Woche'}
                        </span>
                        <span className="font-medium">{appointmentStats.total}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">KI-Buchungen</span>
                        <span className="font-medium text-primary">{appointmentStats.aiBookings}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Diese Woche</span>
                        <span className="font-medium">{appointmentStats.thisWeek}</span>
                      </div>

                      {filters.searchTerm && (
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="text-sm text-muted-foreground">Suchergebnisse</span>
                          <span className="font-medium text-accent-foreground">{filteredAppointments.length}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Legend */}
                <Card className="shadow-soft animate-fade-in">
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
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-muted rounded"></div>
                        <span className="text-sm">Abgeschlossen</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-destructive rounded"></div>
                        <span className="text-sm">Abgesagt</span>
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
          <AlertDialogContent className="animate-scale-in">
            <AlertDialogHeader>
              <AlertDialogTitle>Termin löschen?</AlertDialogTitle>
              <AlertDialogDescription>
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