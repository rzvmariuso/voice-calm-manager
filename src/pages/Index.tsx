import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { MobileNavigation } from "@/components/layout/MobileNavigation"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { RecentAppointments } from "@/components/dashboard/RecentAppointments"
import { AppointmentDialog } from "@/components/appointments/AppointmentDialog"
import { PatientDialog } from "@/components/patients/PatientDialog"
import { Calendar, Users, Bot, TrendingUp, Phone, Clock, LogOut, Crown, Zap } from "lucide-react"
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { usePractice } from "@/hooks/usePractice";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

export default function Index() {
  const { user, signOut } = useAuth();
  const { practice, loading } = usePractice();
  const { subscription, isSubscribed, currentPlan, canAccessAI } = useSubscription();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    aiBookings: 0,
    totalPatients: 0
  });
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [showPatientDialog, setShowPatientDialog] = useState(false);

  useEffect(() => {
    if (!practice) return;

    const fetchStats = async () => {
      try {
        // Fetch appointments stats
        const { data: appointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select('id, ai_booked, appointment_date')
          .eq('practice_id', practice.id);

        if (appointmentsError) {
          console.error('Error fetching appointments:', appointmentsError);
          return;
        }

        // Fetch patients count
        const { data: patients, error: patientsError } = await supabase
          .from('patients')
          .select('id')
          .eq('practice_id', practice.id);

        if (patientsError) {
          console.error('Error fetching patients:', patientsError);
          return;
        }

        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = appointments?.filter(apt => apt.appointment_date === today).length || 0;
        const aiBookings = appointments?.filter(apt => apt.ai_booked).length || 0;

        setStats({
          totalAppointments: appointments?.length || 0,
          todayAppointments,
          aiBookings,
          totalPatients: patients?.length || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [practice]);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Erfolgreich abgemeldet",
      description: "Auf Wiedersehen!",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-x-hidden">
          {/* Mobile Header */}
          <div className="lg:hidden bg-background border-b border-border p-4 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MobileNavigation />
                <div className="w-8 h-8 bg-gradient-primary rounded-lg overflow-hidden flex items-center justify-center">
                  <img src="/lovable-uploads/f8bf1ba1-4dee-42dd-9c1d-543ca3de4a53.png" alt="Voxcal Logo" className="w-6 h-6 object-contain" />
                </div>
                <span className="font-bold text-lg">Voxcal</span>
              </div>
              {!isSubscribed && (
                <Link to="/billing">
                  <Button size="sm" className="button-gradient">
                    <Crown className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Desktop and Mobile Content */}
          <div className="p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 lg:mb-8 space-y-4 lg:space-y-0">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hidden lg:inline-flex" />
                <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-muted-foreground text-sm lg:text-base">
                  Willkommen {practice?.name}
                </p>
                <p className="text-muted-foreground text-xs lg:text-sm lg:hidden">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-4 w-full lg:w-auto">
              {!isSubscribed ? (
                <Link to="/billing" className="flex-1 lg:flex-none">
                  <Button className="button-gradient hover:scale-105 transition-all duration-300 w-full lg:w-auto text-sm">
                    <Crown className="w-4 h-4 mr-1 lg:mr-2" />
                    <span className="hidden sm:inline">Jetzt upgraden</span>
                    <span className="sm:hidden">Upgrade</span>
                  </Button>
                </Link>
              ) : canAccessAI ? (
                <Button className="button-gradient hover:scale-105 transition-all duration-300 animate-glow-pulse flex-1 lg:flex-none text-sm">
                  <Bot className="w-4 h-4 mr-1 lg:mr-2" />
                  <span className="hidden sm:inline">KI-Agent aktivieren</span>
                  <span className="sm:hidden">KI aktiv</span>
                </Button>
              ) : (
                <Link to="/billing" className="flex-1 lg:flex-none">
                  <Button variant="outline" className="hover:scale-105 transition-all duration-300 w-full lg:w-auto text-sm">
                    <Zap className="w-4 h-4 mr-1 lg:mr-2" />
                    <span className="hidden sm:inline">KI-Features freischalten</span>
                    <span className="sm:hidden">KI unlock</span>
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="hover:scale-105 transition-transform duration-200 lg:inline-flex hidden">
                <LogOut className="mr-2 h-4 w-4" />
                Abmelden
              </Button>
            </div>
          </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8 animate-fade-in">
            <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <Link to="/calendar">
                <div className="cursor-pointer hover:scale-105 transition-transform duration-200">
                  <StatsCard
                    title="Termine heute"
                    value={stats.todayAppointments}
                    change={stats.todayAppointments > 0 ? "Heute geplant" : "Keine Termine heute"}
                    changeType={stats.todayAppointments > 0 ? "positive" : "neutral"}
                    icon={Calendar}
                    description={stats.todayAppointments > 0 ? "Anstehende Termine" : ""}
                  />
                </div>
              </Link>
            </div>
            <div className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <Link to="/calendar">
                <div className="cursor-pointer hover:scale-105 transition-transform duration-200">
                  <StatsCard
                    title="Gesamte Termine"
                    value={stats.totalAppointments}
                    change="Alle Termine"
                    changeType="neutral"
                    icon={TrendingUp}
                    description="Buchungen insgesamt"
                  />
                </div>
              </Link>
            </div>
            <div className="animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <Link to="/calendar">
                <div className="cursor-pointer hover:scale-105 transition-transform duration-200">
                  <StatsCard
                    title="AI-gebuchte Termine"
                    value={stats.aiBookings}
                    change={`${stats.totalAppointments > 0 ? Math.round((stats.aiBookings / stats.totalAppointments) * 100) : 0}% aller Termine`}
                    changeType="positive"
                    icon={Bot}
                    description="Automatische Buchungen"
                  />
                </div>
              </Link>
            </div>
            <div className="animate-scale-in" style={{ animationDelay: '0.4s' }}>
              <StatsCard
                title="Aktive Patienten"
                value={stats.totalPatients}
                change="Registrierte Patienten"
                changeType="positive"
                icon={Users}
                description="In der Datenbank"
              />
            </div>
          </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <div className="lg:col-span-2">
                <RecentAppointments />
              </div>
            
            <div className="space-y-6">
              {/* Subscription Status Card */}
              {isSubscribed && currentPlan ? (
                <Card className="shadow-soft card-interactive border-2 border-success/20 bg-gradient-to-r from-success/5 to-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-success animate-bounce-gentle" />
                      {currentPlan.name} Plan Aktiv
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-success">Aktiv</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Max. Patienten</span>
                        <span className="text-sm font-bold text-primary">
                          {currentPlan.max_patients === -1 ? "Unbegrenzt" : currentPlan.max_patients}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">KI-Features</span>
                        <span className="text-sm font-medium text-success">
                          {canAccessAI ? "Verfügbar" : "Nicht verfügbar"}
                        </span>
                      </div>
                      <Link to="/billing">
                        <Button variant="outline" className="w-full mt-4 hover:scale-105 transition-transform duration-200">
                          <Crown className="w-4 h-4 mr-2" />
                          Abonnement verwalten
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-soft card-interactive border-2 border-warning/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-warning animate-bounce-gentle" />
                      Upgrade verfügbar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Schalten Sie Premium-Features frei:
                      </p>
                      <ul className="text-sm space-y-1">
                        <li className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-primary rounded-full"></div>
                          KI-Terminbuchung
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-primary rounded-full"></div>
                          Erweiterte Analytics
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-primary rounded-full"></div>
                          Prioritäts-Support
                        </li>
                      </ul>
                      <Link to="/billing">
                        <Button className="w-full mt-4 button-gradient hover:scale-105 transition-transform duration-200">
                          <Crown className="w-4 h-4 mr-2" />
                          Jetzt upgraden
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Status Card */}
              <Card className="shadow-soft card-interactive">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary animate-bounce-gentle" />
                    KI-Agent Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <div className="flex items-center gap-2">
                        {canAccessAI ? (
                          <>
                            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-success">Bereit</span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 bg-muted rounded-full"></div>
                            <span className="text-sm font-medium text-muted-foreground">Upgrade erforderlich</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">AI-Buchungen</span>
                      <span className="text-sm font-bold text-primary">{stats.aiBookings}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Erfolgsrate</span>
                      <span className="text-sm font-medium text-success">94%</span>
                    </div>
                    {canAccessAI ? (
                      <Button variant="outline" className="w-full mt-4 button-gradient hover:scale-105 transition-transform duration-200">
                        <Phone className="w-4 h-4 mr-2" />
                        Telefonie einrichten
                      </Button>
                    ) : (
                      <Link to="/billing">
                        <Button variant="outline" className="w-full mt-4 hover:scale-105 transition-transform duration-200">
                          <Zap className="w-4 h-4 mr-2" />
                          KI-Features freischalten
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="shadow-soft card-interactive">
                <CardHeader>
                  <CardTitle>Schnellaktionen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start hover:bg-gradient-accent hover:border-primary/30 hover:scale-105 transition-all duration-200"
                      onClick={() => setShowAppointmentDialog(true)}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Neuer Termin
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start hover:bg-gradient-accent hover:border-primary/30 hover:scale-105 transition-all duration-200"
                      onClick={() => setShowPatientDialog(true)}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Patient hinzufügen
                    </Button>
                    <Link to="/analytics">
                      <Button variant="outline" className="w-full justify-start hover:bg-gradient-accent hover:border-primary/30 hover:scale-105 transition-all duration-200">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Berichte anzeigen
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
              </div>
            </div>
          </div>
        </main>
        
        {/* Dialogs */}
        <AppointmentDialog
          open={showAppointmentDialog}
          onOpenChange={setShowAppointmentDialog}
          onSuccess={() => {
            // Trigger page refresh to update appointment list
            window.location.reload();
          }}
        />
        
        <PatientDialog
          open={showPatientDialog}
          onOpenChange={setShowPatientDialog}
          onSuccess={() => {
            // Trigger page refresh to update patient list
            window.location.reload();
          }}
        />
      </div>
    </SidebarProvider>
  );
}