import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
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
  Users,
  Crown
} from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useSubscription } from "@/hooks/useSubscription"
import { useAuth } from "@/hooks/useAuth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Link } from "react-router-dom"

// Empty initial state - no mock data

export default function AIAgent() {
  const [isActive, setIsActive] = useState(true)
  const [aiPrompt, setAiPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isCreatingAssistant, setIsCreatingAssistant] = useState(false)
  const [testPhoneNumber, setTestPhoneNumber] = useState("")
  const [recentCalls, setRecentCalls] = useState([])
  const [isCleaningEnv, setIsCleaningEnv] = useState(false)
  const [stats, setStats] = useState({
    totalCalls: 0,
    successfulBookings: 0,
    successRate: 0,
    avgCallDuration: "0:00"
  })
  const { toast } = useToast()
  const { user } = useAuth()
  const { isSubscribed } = useSubscription()

  // Check if user has access to AI features (subscription or whitelisted email)
  const hasAIAccess = isSubscribed || user?.email === 'razvanmariusoancea@gmail.com'

  // Load AI configuration and call logs on component mount
  useEffect(() => {
    loadAIConfig()
    loadCallLogs()
  }, [])

  const loadCallLogs = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-call-logs')
      
      if (error) throw error
      
      if (data.success) {
        setRecentCalls(data.callLogs || [])
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading call logs:', error)
      // Keep empty state if loading fails
      setRecentCalls([])
    }
  }

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
          prompt: aiPrompt
          // Don't send empty voiceSettings to preserve existing voice settings
        }
      })
      
      if (error) throw error
      
      if (data.success) {
        toast({
          title: "Gespeichert",
          description: "KI-Konfiguration wurde erfolgreich aktualisiert",
        })
        // Reload call logs after successful save
        loadCallLogs()
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

  const createVapiAssistant = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte speichern Sie zuerst den AI-Prompt",
        variant: "destructive"
      })
      return
    }

    try {
      setIsCreatingAssistant(true)
      const { data, error } = await supabase.functions.invoke('create-vapi-assistant', {
        body: { prompt: aiPrompt }
      })
      
      if (error) throw error
      
      if (data.success) {
        toast({
          title: "Erfolg",
          description: "VAPI Assistant wurde erfolgreich erstellt",
        })
        // Reload call logs after creating assistant
        loadCallLogs()
      } else {
        throw new Error(data.error || 'Unbekannter Fehler')
      }
    } catch (error) {
      console.error('Error creating VAPI assistant:', error)
      toast({
        title: "Fehler",
        description: "Assistant konnte nicht erstellt werden: " + error.message,
        variant: "destructive"
      })
    } finally {
      setIsCreatingAssistant(false)
    }
  }

  const makeTestCall = async () => {
    if (!testPhoneNumber) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie eine Telefonnummer ein",
        variant: "destructive"
      })
      return
    }

    try {
      const { data, error } = await supabase.functions.invoke('test-vapi-call', {
        body: { phoneNumber: testPhoneNumber }
      })
      
      if (error) throw error
      
      if (data.success) {
        toast({
          title: "Test-Anruf gestartet",
          description: data.message,
        })
        setTestPhoneNumber("")
        // Reload call logs after test call
        loadCallLogs()
      } else {
        throw new Error(data.error || 'Unbekannter Fehler')
      }
    } catch (error) {
      console.error('Error making test call:', error)
      toast({
        title: "Fehler",
        description: "Test-Anruf konnte nicht gestartet werden: " + error.message,
        variant: "destructive"
      })
    }
  }

  const cleanAIEnvironment = async () => {
    if (!window.confirm('Möchten Sie die gesamte KI-Umgebung zurücksetzen?\n\nDies löscht:\n- Alle Anruf-Logs\n- VAPI Assistant\n- Voice-Einstellungen\n\nDieser Vorgang kann nicht rückgängig gemacht werden.')) {
      return
    }

    try {
      setIsCleaningEnv(true)
      
      const { data, error } = await supabase.functions.invoke('clean-ai-env', {
        body: { 
          purgeCallLogs: true,
          resetVoiceSettings: true,
          deleteVapiAssistant: true
        }
      })
      
      if (error) throw error
      
      if (data.success) {
        const { results } = data
        let message = 'Bereinigung abgeschlossen:\n'
        
        if (results.callLogsPurged) message += '✓ Anruf-Logs gelöscht\n'
        if (results.voiceSettingsReset) message += '✓ Voice-Einstellungen zurückgesetzt\n'
        if (results.vapiAssistantDeleted) message += '✓ VAPI Assistant gelöscht\n'
        
        if (results.errors.length > 0) {
          message += '\nFehler:\n' + results.errors.join('\n')
        }
        
        toast({
          title: "Umgebung bereinigt",
          description: message,
        })
        
        // Reload all data
        loadAIConfig()
        loadCallLogs()
      } else {
        throw new Error(data.error || 'Unbekannter Fehler')
      }
    } catch (error) {
      console.error('Error cleaning AI environment:', error)
      toast({
        title: "Fehler",
        description: "Bereinigung fehlgeschlagen: " + error.message,
        variant: "destructive"
      })
    } finally {
      setIsCleaningEnv(false)
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

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 p-6 bg-background">
          {!hasAIAccess && (
            <Alert className="mb-6 border-primary bg-primary/5">
              <Crown className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>
                  <strong>Pro-Feature:</strong> Der KI-Agent ist nur im Pro-Plan verfügbar.
                </span>
                <Link to="/billing">
                  <Button size="sm" className="ml-4">
                    Jetzt upgraden
                  </Button>
                </Link>
              </AlertDescription>
            </Alert>
          )}
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
                disabled={!hasAIAccess}
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
                      disabled={isLoading || !hasAIAccess}
                      placeholder={isLoading ? "Konfiguration wird geladen..." : !hasAIAccess ? "Pro-Plan erforderlich" : ""}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Definiert das Verhalten und die Antworten des KI-Agenten
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="test-phone">Test-Telefonnummer</Label>
                      <Input
                        id="test-phone"
                        type="tel"
                        value={testPhoneNumber}
                        onChange={(e) => setTestPhoneNumber(e.target.value)}
                        placeholder="+49 123 456789"
                        disabled={!hasAIAccess}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Nummer für Test-Anrufe
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1" 
                        disabled={!hasAIAccess || isCreatingAssistant}
                        onClick={createVapiAssistant}
                      >
                        <Volume2 className="w-4 h-4 mr-2" />
                        {isCreatingAssistant ? "Erstelle..." : "Assistant erstellen"}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1" 
                        disabled={!hasAIAccess}
                        onClick={makeTestCall}
                      >
                        <Mic className="w-4 h-4 mr-2" />
                        Test-Anruf
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={saveAIConfig}
                        disabled={isSaving || isLoading || !hasAIAccess}
                        className="bg-gradient-primary text-white shadow-glow flex-1"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        {isSaving ? "Speichern..." : "Speichern"}
                      </Button>
                      
                      <Button 
                        variant="destructive"
                        onClick={cleanAIEnvironment}
                        disabled={isCleaningEnv || !hasAIAccess}
                        className="flex-1"
                      >
                        {isCleaningEnv ? "Bereinige..." : "Neu starten (Clean)"}
                      </Button>
                    </div>
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
                {recentCalls.length > 0 ? (
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
                ) : (
                  <div className="text-center py-8">
                    <PhoneCall className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">Noch keine Anrufe vorhanden</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Anrufe werden hier angezeigt, sobald der KI-Agent aktiv ist
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}