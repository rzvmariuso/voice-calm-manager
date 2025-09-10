import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingPage } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CalendarIcon, ChevronLeft, ChevronRight, Plus, Search, Bot, Calendar as CalIcon } from "lucide-react";
import { useAppointments } from "@/hooks/useAppointments";
import { AppointmentDialog } from "@/components/appointments/AppointmentDialog";
import { ModernMonthView } from "@/components/calendar/ModernMonthView";
import { ModernWeekView } from "@/components/calendar/ModernWeekView";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { format, isSameDay, startOfWeek, endOfWeek } from "date-fns";
import { de } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAppointmentWebhook } from "@/hooks/useAppointmentWebhook";
import { usePractice } from "@/hooks/usePractice";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export default function Calendar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const { appointments, isLoading, refetch } = useAppointments();
  const { toast } = useToast();
  const { triggerWebhook } = useAppointmentWebhook();
  
  const { practice, loading: practiceLoading } = usePractice();
  const { user, loading: authLoading } = useAuth();
  
  // Dialog states
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<any>(null);

  // Simple search filter
  const [searchTerm, setSearchTerm] = useState('');
  const [aiFilter, setAiFilter] = useState(false);

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    if (aiFilter && !appointment.ai_booked) return false;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const patientName = `${appointment.patient.first_name} ${appointment.patient.last_name}`.toLowerCase();
      const service = appointment.service.toLowerCase();
      if (!patientName.includes(searchLower) && !service.includes(searchLower)) {
        return false;
      }
    }
    
    return true;
  });

  // Stats
  const stats = {
    total: filteredAppointments.length,
    aiBookings: filteredAppointments.filter(a => a.ai_booked).length,
    today: filteredAppointments.filter(appointment => 
      isSameDay(new Date(`${appointment.appointment_date}T00:00:00`), new Date())
    ).length,
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

  const handleToday = () => setCurrentDate(new Date());

  const handleNewAppointment = (selectedDate?: Date) => {
    setSelectedAppointment(selectedDate ? { appointment_date: format(selectedDate, 'yyyy-MM-dd') } : null);
    setIsDialogOpen(true);
  };

  const handleEditAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsDialogOpen(true);
  };

  const handleDeleteAppointment = (appointment: any) => {
    setAppointmentToDelete(appointment);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!appointmentToDelete) return;
    
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentToDelete.id);

      if (error) throw error;

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
      setDeleteDialogOpen(false);
      setAppointmentToDelete(null);
    }
  };

  const handleAppointmentSuccess = () => {
    setIsDialogOpen(false);
    setSelectedAppointment(null);
    refetch();
  };

  const handleDayClick = (date: Date) => {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      toast({
        title: "Wochenende",
        description: "An Wochenenden können keine Termine gebucht werden.",
        variant: "destructive",
      });
      return;
    }
    handleNewAppointment(date);
  };

  const handlePatientClick = (patientId: string) => {
    navigate(`/patients/${patientId}`);
  };

  const handleAppointmentDrop = async (appointmentId: string, newDate: string) => {
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
        description: `Der Termin wurde erfolgreich verschoben.`,
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

  if (authLoading || practiceLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <LoadingPage 
          title="Lade Kalender..." 
          description="Termine werden geladen" 
        />
      </div>
    );
  }

  if (!user || !practice) {
    return (
      <div className="min-h-screen bg-background">
        <LoadingPage 
          title="Weiterleitung..." 
          description="Sie werden zur Anmeldung weitergeleitet" 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left: Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg overflow-hidden flex items-center justify-center">
                  <img 
                    src="/lovable-uploads/f8bf1ba1-4dee-42dd-9c1d-543ca3de4a53.png" 
                    alt="Voxcal Logo" 
                    className="w-6 h-6 object-contain" 
                  />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">
                    {format(currentDate, viewMode === 'month' ? 'MMMM yyyy' : 'PPP', { locale: de })}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{stats.today} heute</span>
                    <span>{stats.thisWeek} diese Woche</span>
                    {stats.aiBookings > 0 && <span>{stats.aiBookings} KI</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* Navigation */}
              <div className="hidden sm:flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigateDate('prev')}
                  className="h-9 w-9 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleToday}
                  className="h-9 px-3"
                >
                  Heute
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigateDate('next')}
                  className="h-9 w-9 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              {/* View Toggle */}
              <div className="hidden sm:flex bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === 'month' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('month')}
                  className="h-7 px-3 text-sm"
                >
                  Monat
                </Button>
                <Button
                  variant={viewMode === 'week' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('week')}
                  className="h-7 px-3 text-sm"
                >
                  Woche
                </Button>
              </div>

              <Button 
                onClick={() => handleNewAppointment()}
                className="h-9"
              >
                <Plus className="w-4 h-4 mr-2" />
                Neuer Termin
              </Button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-3 pb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Suche nach Patienten oder Services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9"
              />
            </div>

            <Button
              variant={aiFilter ? "default" : "outline"}
              size="sm"
              onClick={() => setAiFilter(!aiFilter)}
              className="h-9 gap-2"
            >
              <Bot className="w-4 h-4" />
              KI Filter
            </Button>

            {(searchTerm || aiFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setAiFilter(false);
                }}
                className="h-9 text-muted-foreground"
              >
                Filter zurücksetzen
              </Button>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="sm:hidden flex items-center justify-between pb-4">
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigateDate('prev')}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleToday}
                className="h-8 px-2 text-sm"
              >
                Heute
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigateDate('next')}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('month')}
                className="h-6 px-2 text-xs"
              >
                Monat
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('week')}
                className="h-6 px-2 text-xs"
              >
                Woche
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Calendar */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {viewMode === 'month' ? (
          <ModernMonthView
            currentDate={currentDate}
            appointments={filteredAppointments}
            onEditAppointment={handleEditAppointment}
            onDeleteAppointment={handleDeleteAppointment}
            onPatientClick={handlePatientClick}
            onDayClick={handleDayClick}
            onAppointmentDrop={handleAppointmentDrop}
          />
        ) : (
          <ModernWeekView
            currentDate={currentDate}
            appointments={filteredAppointments}
            onEditAppointment={handleEditAppointment}
            onDeleteAppointment={handleDeleteAppointment}
            onPatientClick={handlePatientClick}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation />

      {/* Dialogs */}
      <AppointmentDialog
        appointment={selectedAppointment}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleAppointmentSuccess}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Termin löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie diesen Termin löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}