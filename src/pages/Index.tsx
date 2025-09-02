import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { RecentAppointments } from "@/components/dashboard/RecentAppointments"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Phone, Users, Bot, TrendingUp, PhoneCall, CheckCircle } from "lucide-react"

const Index = () => {
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
                  Überblick über Ihre KI-gestützte Terminbuchung
                </p>
              </div>
            </div>
            <Button className="bg-gradient-primary text-white shadow-glow">
              <Bot className="w-4 h-4 mr-2" />
              KI-Agent aktivieren
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Termine heute"
              value="12"
              change="+2 seit gestern"
              changeType="positive"
              icon={Calendar}
              description="8 bestätigt, 4 wartend"
            />
            <StatsCard
              title="KI-Anrufe"
              value="28"
              change="+15% diese Woche"
              changeType="positive"
              icon={PhoneCall}
              description="Automatische Buchungen"
            />
            <StatsCard
              title="Neue Patienten"
              value="5"
              change="Diese Woche"
              changeType="neutral"
              icon={Users}
              description="Über KI-Agent gefunden"
            />
            <StatsCard
              title="Erfolgsrate"
              value="94%"
              change="+3% vs. letzter Monat"
              changeType="positive"
              icon={CheckCircle}
              description="KI-Buchungen erfolgreich"
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
                        <span className="text-sm font-medium text-success">Aktiv</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Letzte Aktivität</span>
                      <span className="text-sm">vor 2 Min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Heute bearbeitet</span>
                      <span className="text-sm font-medium">28 Anrufe</span>
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      <Phone className="w-4 h-4 mr-2" />
                      Telefonnummer konfigurieren
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
};

export default Index;
