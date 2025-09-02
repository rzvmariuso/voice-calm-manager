import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Phone as PhoneIcon, 
  PhoneCall, 
  PhoneIncoming, 
  PhoneOutgoing, 
  PhoneMissed,
  Play,
  Pause,
  Download,
  Settings,
  Volume2,
  Clock,
  Calendar,
  User,
  Bot,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Activity
} from "lucide-react"
import { useState } from "react"

const callLogs = [
  {
    id: "1",
    caller: "Anna Müller",
    phone: "+49 123 456789",
    type: "incoming",
    status: "answered",
    duration: "2:34",
    timestamp: "2024-01-15 14:23",
    outcome: "appointment_booked",
    recording: true,
    aiHandled: true
  },
  {
    id: "2",
    caller: "Michael Schmidt", 
    phone: "+49 987 654321",
    type: "incoming",
    status: "answered",
    duration: "1:45",
    timestamp: "2024-01-15 13:45",
    outcome: "information_given",
    recording: true,
    aiHandled: true
  },
  {
    id: "3",
    caller: "Sarah Wagner",
    phone: "+49 555 123456", 
    type: "incoming",
    status: "missed",
    duration: "0:00",
    timestamp: "2024-01-15 12:30",
    outcome: "callback_needed",
    recording: false,
    aiHandled: false
  },
  {
    id: "4",
    caller: "Thomas Bauer",
    phone: "+49 444 987654",
    type: "incoming", 
    status: "answered",
    duration: "3:12",
    timestamp: "2024-01-15 11:15",
    outcome: "appointment_booked",
    recording: true,
    aiHandled: true
  },
  {
    id: "5",
    caller: "Lisa Hoffman",
    phone: "+49 111 222333",
    type: "outgoing",
    status: "answered", 
    duration: "1:28",
    timestamp: "2024-01-15 10:45",
    outcome: "appointment_confirmed",
    recording: true,
    aiHandled: false
  }
]

export default function Phone() {
  const [selectedCall, setSelectedCall] = useState<string | null>(null)

  const getCallIcon = (type: string, status: string) => {
    if (status === "missed") return <PhoneMissed className="w-4 h-4 text-destructive" />
    if (type === "incoming") return <PhoneIncoming className="w-4 h-4 text-success" />
    if (type === "outgoing") return <PhoneOutgoing className="w-4 h-4 text-primary" />
    return <PhoneIcon className="w-4 h-4" />
  }

  const getStatusBadge = (status: string, outcome: string, aiHandled: boolean) => {
    const badges = []
    
    if (aiHandled) {
      badges.push(
        <Badge key="ai" variant="outline" className="border-primary text-primary text-xs">
          <Bot className="w-3 h-3 mr-1" />
          KI
        </Badge>
      )
    }

    switch (outcome) {
      case "appointment_booked":
        badges.push(
          <Badge key="outcome" variant="default" className="bg-success text-success-foreground text-xs">
            <CheckCircle className="w-3 h-3 mr-1" />
            Termin
          </Badge>
        )
        break
      case "information_given":
        badges.push(
          <Badge key="outcome" variant="secondary" className="text-xs">
            Info gegeben
          </Badge>
        )
        break
      case "callback_needed":
        badges.push(
          <Badge key="outcome" variant="outline" className="border-warning text-warning text-xs">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Rückruf
          </Badge>
        )
        break
      case "appointment_confirmed":
        badges.push(
          <Badge key="outcome" variant="outline" className="border-success text-success text-xs">
            Bestätigt
          </Badge>
        )
        break
    }

    return <div className="flex gap-1">{badges}</div>
  }

  const stats = {
    totalCalls: callLogs.length,
    answeredCalls: callLogs.filter(c => c.status === "answered").length,
    missedCalls: callLogs.filter(c => c.status === "missed").length,
    aiHandledCalls: callLogs.filter(c => c.aiHandled).length,
    avgDuration: "2:18",
    successRate: 85
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
                  Telefonie
                </h1>
                <p className="text-muted-foreground">
                  Anruf-Management und KI-Telefonie Übersicht
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Einstellungen
              </Button>
              <Button className="bg-gradient-primary text-white shadow-glow">
                <PhoneCall className="w-4 h-4 mr-2" />
                Test-Anruf
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Anrufe gesamt</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalCalls}</p>
                  </div>
                  <PhoneIcon className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Beantwortet</p>
                    <p className="text-2xl font-bold text-success">{stats.answeredCalls}</p>
                  </div>
                  <PhoneIncoming className="w-8 h-8 text-success" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Verpasst</p>
                    <p className="text-2xl font-bold text-destructive">{stats.missedCalls}</p>
                  </div>
                  <PhoneMissed className="w-8 h-8 text-destructive" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">KI-behandelt</p>
                    <p className="text-2xl font-bold text-primary">{stats.aiHandledCalls}</p>
                  </div>
                  <Bot className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ø Dauer</p>
                    <p className="text-2xl font-bold text-foreground">{stats.avgDuration}</p>
                  </div>
                  <Clock className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Erfolgsrate</p>
                    <p className="text-2xl font-bold text-secondary">{stats.successRate}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-secondary" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Call Log */}
            <div className="lg:col-span-2">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Anruf-Protokoll
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {callLogs.map((call) => (
                      <div 
                        key={call.id} 
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedCall === call.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:bg-accent/50'
                        }`}
                        onClick={() => setSelectedCall(selectedCall === call.id ? null : call.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {getCallIcon(call.type, call.status)}
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-gradient-primary text-white text-xs">
                                {call.caller.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{call.caller}</p>
                              <p className="text-xs text-muted-foreground">{call.phone}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              {new Date(call.timestamp).toLocaleString('de-DE')}
                            </p>
                            <p className="text-xs font-medium">{call.duration}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          {getStatusBadge(call.status, call.outcome, call.aiHandled)}
                          <div className="flex gap-1">
                            {call.recording && (
                              <Button size="sm" variant="outline" className="h-6 px-2">
                                <Play className="w-3 h-3 mr-1" />
                                Anhören
                              </Button>
                            )}
                            {call.recording && (
                              <Button size="sm" variant="outline" className="h-6 px-2">
                                <Download className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {selectedCall === call.id && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <div className="text-xs text-muted-foreground space-y-1">
                              <p><strong>Typ:</strong> {call.type === 'incoming' ? 'Eingehend' : 'Ausgehend'}</p>
                              <p><strong>Status:</strong> {call.status === 'answered' ? 'Beantwortet' : 'Verpasst'}</p>
                              <p><strong>Ergebnis:</strong> {call.outcome}</p>
                              <p><strong>KI-behandelt:</strong> {call.aiHandled ? 'Ja' : 'Nein'}</p>
                              {call.recording && (
                                <p><strong>Aufzeichnung:</strong> Verfügbar (DSGVO-konform gespeichert)</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Phone System Status */}
            <div className="space-y-6">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PhoneIcon className="w-5 h-5 text-primary" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Telefon-System</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-success">Online</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">KI-Agent</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-success">Aktiv</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Hauptnummer</span>
                      <span className="text-sm font-medium">+49 1234 567890</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Provider</span>
                      <span className="text-sm">Twilio</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Aufzeichnung</span>
                      <Badge variant="outline" className="border-success text-success text-xs">
                        DSGVO-konform
                      </Badge>
                    </div>
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
                      <PhoneCall className="w-4 h-4 mr-2" />
                      Ausgehender Anruf
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Volume2 className="w-4 h-4 mr-2" />
                      Rufumleitung
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      Anrufregeln
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Aufzeichnungen
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Today's Performance */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Heute's Leistung</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Anrufannahme</span>
                      <span className="font-medium">{Math.round((stats.answeredCalls/stats.totalCalls)*100)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-success h-2 rounded-full" 
                        style={{width: `${(stats.answeredCalls/stats.totalCalls)*100}%`}}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>KI-Automatisierung</span>
                      <span className="font-medium">{Math.round((stats.aiHandledCalls/stats.answeredCalls)*100)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{width: `${(stats.aiHandledCalls/stats.answeredCalls)*100}%`}}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Erfolgsrate</span>
                      <span className="font-medium">{stats.successRate}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-secondary h-2 rounded-full" style={{width: `${stats.successRate}%`}}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}