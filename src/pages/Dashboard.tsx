import { PageLayout } from "@/components/layout/PageLayout";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { EnhancedAnalytics } from "@/components/dashboard/EnhancedAnalytics";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentAppointments } from "@/components/dashboard/RecentAppointments";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppointments } from "@/hooks/useAppointments";
import { usePatientCount } from "@/hooks/usePatientCount";
import { Calendar, Users, Clock, TrendingUp, Plus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function Dashboard() {
  const { appointments, isLoading: appointmentsLoading } = useAppointments();
  const { totalPatients, newThisMonth, isLoading: patientsLoading } = usePatientCount();

  // Calculate quick stats
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayAppointments = appointments.filter(app => app.appointment_date === today);
  const upcomingAppointments = appointments.filter(app => 
    app.appointment_date >= today && app.status !== 'cancelled'
  );

  const pendingAppointments = appointments.filter(app => app.status === 'pending').length;

  return (
    <PageLayout>
      <div className="space-y-6">
        <Breadcrumb />
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Willkommen zurück! Hier ist ein Überblick über Ihre Praxis.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Link to="/appointments">
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Alle Termine
              </Button>
            </Link>
            <Link to="/patients">
              <Button className="button-gradient">
                <Plus className="w-4 h-4 mr-2" />
                Neuer Patient
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Heute"
            value={todayAppointments.length.toString()}
            description="Termine heute"
            icon={Calendar}
            changeType={todayAppointments.length > 0 ? "positive" : "neutral"}
          />
          
          <StatsCard
            title="Kommende Termine"
            value={upcomingAppointments.length.toString()}
            description="Diese Woche"
            icon={Clock}
            changeType="positive"
          />
          
          <StatsCard
            title="Patienten gesamt"
            value={totalPatients.toString()}
            description={`+${newThisMonth} diesen Monat`}
            icon={Users}
            changeType={newThisMonth > 0 ? "positive" : "neutral"}
          />
          
          <StatsCard
            title="Wartend"
            value={pendingAppointments.toString()}
            description="Bestätigung erforderlich"
            icon={TrendingUp}
            changeType={pendingAppointments > 0 ? "neutral" : "positive"}
          />
        </div>

        {/* Today's Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Heute im Überblick</CardTitle>
                <CardDescription>
                  {format(new Date(), "EEEE, dd. MMMM yyyy", { locale: de })}
                </CardDescription>
              </div>
              <Badge variant={todayAppointments.length > 0 ? "default" : "secondary"}>
                {todayAppointments.length} {todayAppointments.length === 1 ? "Termin" : "Termine"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {todayAppointments.length > 0 ? (
              <div className="space-y-4">
                {todayAppointments.slice(0, 3).map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div>
                        <p className="font-medium">
                          {appointment.patient.first_name} {appointment.patient.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.appointment_time} - {appointment.service}
                        </p>
                      </div>
                    </div>
                    <Badge variant={
                      appointment.status === 'confirmed' ? 'default' :
                      appointment.status === 'pending' ? 'secondary' :
                      'destructive'
                    }>
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
                
                {todayAppointments.length > 3 && (
                  <Link to="/calendar">
                    <Button variant="ghost" className="w-full">
                      {todayAppointments.length - 3} weitere Termine anzeigen
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Keine Termine für heute geplant</p>
                <Link to="/appointments">
                  <Button variant="outline" className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Termin hinzufügen
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Praxis Analytics</CardTitle>
            <CardDescription>
              Detaillierte Einblicke in Ihre Praxisleistung
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EnhancedAnalytics />
          </CardContent>
        </Card>

        {/* Recent Appointments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Kürzliche Termine</CardTitle>
                <CardDescription>Die letzten Aktivitäten in Ihrer Praxis</CardDescription>
              </div>
              <Link to="/appointments">
                <Button variant="outline" size="sm">
                  Alle anzeigen
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <RecentAppointments />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}