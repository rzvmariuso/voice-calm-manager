import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Bot, 
  Play, 
  Pause, 
  Settings, 
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
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

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
  const [aiPrompt, setAiPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Load AI configuration on component mount
  useEffect(() => {
    loadAIConfig()
  }, [])

  const loadAIConfig = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.functions.invoke('get-ai-config')
      
      if (error) throw error
      
      if (data.success) {
        setAiPrompt(data.prompt)
      }
    } catch (error) {
      console.error('Error loading AI config:', error)
      // Set default prompt if loading fails
      setAiPrompt(`Du bist Lisa, die herzliche Sprechstundenhilfe einer Physiotherapie-Praxis.

🎯 PERSÖNLICHKEIT:
- Warm, authentisch und hilfsbereit - wie eine echte Kollegin
- Verwende natürliche Ausdrücke: "ach so", "genau", "prima"
- Reagiere spontan und menschlich auf Situationen
- Keine roboterhaften Antworten oder Kunstpausen

💬 GESPRÄCHSFÜHRUNG:
- Begrüße natürlich: "Praxis Schmidt, Lisa hier! Was kann ich für Sie tun?"
- Stelle nur EINE Frage pro Antwort
- Lass Patienten aussprechen, unterbreche nicht
- Bestätige aktiv: "Mhm", "Verstehe", "Ach ja"
- Führe Gespräche fließend ohne längere Pausen

📅 TERMINBUCHUNG:
→ Wunschtermin: "Wann würde es Ihnen gut passen?"
→ Name: "Und mit wem spreche ich?"
→ Behandlung: "Worum geht's denn heute?"
→ Telefon: "Ihre Nummer hätte ich gern für Rückfragen"
→ Bestätigung: "Super! [Tag] um [Zeit] für [Name] - passt das so?"

⏰ VERFÜGBAR: Mo-Fr 8-18 Uhr, Sa 9-14 Uhr

💰 PREISE: Physiotherapie €65, Massage €85, Hot Stone €95, Wellness €120

WICHTIG: Sprich natürlich und menschlich - als wärst du wirklich am Telefon!`)
    } finally {
      setIsLoading(false)
    }
  }

  const saveAIConfig = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen AI-Prompt ein",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSaving(true)
      const { data, error } = await supabase.functions.invoke('update-ai-config', {
        body: { 
          prompt: aiPrompt,
          voiceSettings: {} 
        }
      })
      
      if (error) throw error
      
      if (data.success) {
        toast({
          title: "Gespeichert",
          description: "KI-Konfiguration wurde erfolgreich aktualisiert",
        })
      } else {
        throw new Error(data.error || 'Unbekannter Fehler')
      }
    } catch (error) {
      console.error('Error saving AI config:', error)
      toast({
        title: "Fehler",
        description: "Konfiguration konnte nicht gespeichert werden",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

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
            <div className="lg:col-span-2">
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
                      disabled={isLoading}
                      placeholder={isLoading ? "Konfiguration wird geladen..." : ""}
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
                    <Button 
                      onClick={saveAIConfig}
                      disabled={isSaving || isLoading}
                      className="bg-gradient-primary text-white shadow-glow flex-1"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      {isSaving ? "Speichern..." : "Speichern"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

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
        </main>
      </div>
    </SidebarProvider>
  )
}