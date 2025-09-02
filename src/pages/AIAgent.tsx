import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Bot, 
  Play, 
  Pause, 
  Settings, 
  Phone, 
  Activity, 
  MessageSquare, 
  TrendingUp,
  Volume2,
  Mic,
  PhoneCall,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users
} from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

const recentCalls = [
  {
    id: "1",
    caller: "Anna Müller",
    phone: "+49 123 456789",
    time: "vor 5 Min",
    duration: "2:34",
    outcome: "appointment_booked",
    service: "Massage",
    appointmentDate: "2024-01-16, 14:00"
  },
  {
    id: "2", 
    caller: "Michael Schmidt",
    phone: "+49 987 654321",
    time: "vor 12 Min",
    duration: "1:45",
    outcome: "information_request",
    service: "Physiotherapie",
    appointmentDate: null
  },
  {
    id: "3",
    caller: "Sarah Wagner", 
    phone: "+49 555 123456",
    time: "vor 25 Min",
    duration: "3:12",
    outcome: "appointment_booked",
    service: "Zahnreinigung",
    appointmentDate: "2024-01-17, 09:30"
  },
  {
    id: "4",
    caller: "Unbekannt",
    phone: "+49 444 987654",
    time: "vor 1 Std",
    duration: "0:23",
    outcome: "missed_call",
    service: null,
    appointmentDate: null
  }
]

export default function AIAgent() {
  const [isActive, setIsActive] = useState(true)
  const [aiPrompt, setAiPrompt] = useState(`Du bist die freundliche Rezeptionistin einer Physiotherapie-Praxis. 

Deine Aufgaben:
- Termine für Physiotherapie, Massage und Wellness buchen
- Preise und Services erklären  
- Öffnungszeiten mitteilen (Mo-Fr 8-18 Uhr, Sa 9-14 Uhr)
- Bei Notfällen an den Arzt verweisen

Services & Preise:
- Physiotherapie: €65 (45 Min)
- Ganzkörper-Massage: €85 (60 Min) 
- Hot Stone Massage: €95 (60 Min)
- Wellness Paket: €120 (90 Min)

Sei immer höflich, professionell und hilfsbereit. Sprich Deutsch.`)

  const { toast } = useToast()

  const toggleAgent = () => {
    setIsActive(!isActive)
    toast({
      title: isActive ? "KI-Agent deaktiviert" : "KI-Agent aktiviert",
      description: isActive ? "Automatische Anrufannahme gestoppt" : "KI-Agent ist jetzt bereit für Anrufe",
      variant: isActive ? "destructive" : "default"
    })
  }

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case "appointment_booked":
        return (
          <Badge variant="default" className="bg-success text-success-foreground">
            <CheckCircle className="w-3 h-3 mr-1" />
            Termin gebucht
          </Badge>
        )
      case "information_request":
        return (
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            <MessageSquare className="w-3 h-3 mr-1" />
            Information
          </Badge>
        )
      case "missed_call":
        return (
          <Badge variant="outline" className="border-warning text-warning">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Verpasst
          </Badge>
        )
      default:
        return <Badge variant="outline">Unbekannt</Badge>
    }
  }

  const stats = {
    totalCalls: 47,
    successfulBookings: 32,
    successRate: 68,
    avgCallDuration: "2:45"
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
                  KI-Agent
                </h1>
                <p className="text-muted-foreground">
                  Automatische Terminbuchung per Telefon
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-success animate-pulse' : 'bg-muted'}`}></div>
                <span className="text-sm text-muted-foreground">
                  {isActive ? "Aktiv" : "Inaktiv"}
                </span>
              </div>
              <Button 
                onClick={toggleAgent}
                variant={isActive ? "destructive" : "default"}
                className={isActive ? "" : "bg-gradient-primary text-white shadow-glow"}
              >
                {isActive ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Stoppen
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Starten
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Anrufe heute</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalCalls}</p>
                  </div>
                  <PhoneCall className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Termine gebucht</p>
                    <p className="text-2xl font-bold text-success">{stats.successfulBookings}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Erfolgsrate</p>
                    <p className="text-2xl font-bold text-primary">{stats.successRate}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ø Gesprächsdauer</p>
                    <p className="text-2xl font-bold text-foreground">{stats.avgCallDuration}</p>
                  </div>
                  <Clock className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AI Configuration */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    KI-Prompt Konfiguration
                    <Badge variant="outline" className="border-primary text-primary">
                      Vapi
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="ai-prompt">Systemprompt</Label>
                    <Textarea 
                      id="ai-prompt"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      rows={12}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Definiert das Verhalten und die Antworten des KI-Agenten
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Volume2 className="w-4 h-4 mr-2" />
                      Stimme testen
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Mic className="w-4 h-4 mr-2" />
                      Test-Anruf
                    </Button>
                    <Button className="bg-gradient-primary text-white shadow-glow flex-1">
                      <Settings className="w-4 h-4 mr-2" />
                      Speichern
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Calls */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Letzte Anrufe
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentCalls.map((call) => (
                      <div key={call.id} className="p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-gradient-primary text-white text-xs">
                                {call.caller !== "Unbekannt" ? call.caller.split(' ').map(n => n[0]).join('') : "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{call.caller}</p>
                              <p className="text-xs text-muted-foreground">{call.phone}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">{call.time}</p>
                            <p className="text-xs font-medium">{call.duration}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getOutcomeBadge(call.outcome)}
                            {call.service && (
                              <span className="text-xs text-muted-foreground">{call.service}</span>
                            )}
                          </div>
                          {call.appointmentDate && (
                            <span className="text-xs text-success font-medium">
                              {call.appointmentDate}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Live Status */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Live Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Agent Status</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-success animate-pulse' : 'bg-muted'}`}></div>
                        <span className="text-sm font-medium">{isActive ? "Bereit" : "Pausiert"}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Telefonnummer</span>
                      <span className="text-sm font-medium">+49 1234 567890</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Letzte Aktivität</span>
                      <span className="text-sm">vor 5 Min</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Nächster Termin</span>
                      <span className="text-sm">14:00 - Anna M.</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Settings */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Schnelleinstellungen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Volume2 className="w-4 h-4 mr-2" />
                      Stimme ändern
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Antworten bearbeiten
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Phone className="w-4 h-4 mr-2" />
                      Rufumleitung
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Statistiken
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Today */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Performance heute</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Anrufe beantwortet</span>
                      <span className="font-medium">45/47</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-success h-2 rounded-full" style={{width: '96%'}}></div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Termine gebucht</span>
                      <span className="font-medium">32/45</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{width: '71%'}}></div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Kundenzufriedenheit</span>
                      <span className="font-medium">4.8/5</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-secondary h-2 rounded-full" style={{width: '96%'}}></div>
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