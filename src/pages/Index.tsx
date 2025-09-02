import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { RecentAppointments } from "@/components/dashboard/RecentAppointments"
import { Calendar, Users, Bot, TrendingUp, Phone, Clock, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/useAuth";
import { usePractice } from "@/hooks/usePractice";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Index() {
  const { user, signOut } = useAuth();
  const { practice, loading } = usePractice();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    aiBookings: 0,
    totalPatients: 0
  });

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
        <main className="flex-1 p-6 bg-background">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Willkommen {practice?.name} - {user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="bg-gradient-primary text-white shadow-glow">
                <Bot className="w-4 h-4 mr-2" />
                KI-Agent aktivieren
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Abmelden
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Termine heute"
              value={stats.todayAppointments}
              change={stats.todayAppointments > 0 ? "Heute geplant" : "Keine Termine heute"}
              changeType={stats.todayAppointments > 0 ? "positive" : "neutral"}
              icon={Calendar}
              description={stats.todayAppointments > 0 ? "Anstehende Termine" : ""}
            />
            <StatsCard
              title="Gesamte Termine"
              value={stats.totalAppointments}
              change="Alle Termine"
              changeType="neutral"
              icon={TrendingUp}
              description="Buchungen insgesamt"
            />
            <StatsCard
              title="AI-gebuchte Termine"
              value={stats.aiBookings}
              change={`${stats.totalAppointments > 0 ? Math.round((stats.aiBookings / stats.totalAppointments) * 100) : 0}% aller Termine`}
              changeType="positive"
              icon={Bot}
              description="Automatische Buchungen"
            />
            <StatsCard
              title="Aktive Patienten"
              value={stats.totalPatients}
              change="Registrierte Patienten"
              changeType="positive"
              icon={Users}
              description="In der Datenbank"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RecentAppointments />
            </div>
            
            <div className="space-y-6">
              {/* AI Status Card */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    KI-Agent Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-success">Bereit</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">AI-Buchungen</span>
                      <span className="text-sm">{stats.aiBookings}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Erfolgsrate</span>
                      <span className="text-sm font-medium">94%</span>
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      <Phone className="w-4 h-4 mr-2" />
                      Telefonie einrichten
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Schnellaktionen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      Neuer Termin
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      Patient hinzufügen
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Berichte anzeigen
                    </Button>
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