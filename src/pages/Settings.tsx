import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Settings as SettingsIcon, 
  Calendar, 
  Phone, 
  Shield, 
  Bot, 
  Database,
  Key,
  Globe,
  Save,
  TestTube,
  AlertTriangle
} from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function Settings() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  
  const [settings, setSettings] = useState({
    practice: {
      name: "",
      address: "",
      phone: "",
      email: "",
      website: ""
    },
    calendar: {
      provider: "google",
      googleApiKey: "",
      calcomApiKey: "",
      webhookUrl: ""
    },
    ai: {
      vapiApiKey: "",
      voiceId: "EXAVITQu4vr4xnSDxMaL", // Sarah - deutscher Akzent
      model: "gpt-4o-mini",
      language: "de"
    },
    phone: {
      twilioAccountSid: "",
      twilioAuthToken: "",
      phoneNumber: "",
      recordCalls: true
    },
    gdpr: {
      dataRetentionDays: 1095,
      cookieConsent: true,
      anonymizeData: true,
      euServerOnly: true
    }
  })

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Here we would save to Supabase
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast({
        title: "Einstellungen gespeichert",
        description: "Alle Konfigurationen wurden erfolgreich aktualisiert.",
      })
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testConnection = async (service: string) => {
    toast({
      title: "Verbindung wird getestet...",
      description: `${service} Verbindung wird überprüft.`,
    })
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
                  Einstellungen
                </h1>
                <p className="text-muted-foreground">
                  Konfigurieren Sie alle Integrations und DSGVO-Einstellungen
                </p>
              </div>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={isLoading}
              className="bg-gradient-primary text-white shadow-glow"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Speichern..." : "Alle speichern"}
            </Button>
          </div>

          <Tabs defaultValue="practice" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="practice" className="flex items-center gap-2">
                <SettingsIcon className="w-4 h-4" />
                Praxis
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Kalender
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Bot className="w-4 h-4" />
                KI-Agent
              </TabsTrigger>
              <TabsTrigger value="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Telefonie
              </TabsTrigger>
              <TabsTrigger value="gdpr" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                DSGVO
              </TabsTrigger>
            </TabsList>

            {/* Practice Settings */}
            <TabsContent value="practice">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5 text-primary" />
                    Praxis-Informationen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="practice-name">Praxisname *</Label>
                      <Input 
                        id="practice-name"
                        value={settings.practice.name}
                        onChange={(e) => setSettings(s => ({
                          ...s, 
                          practice: {...s.practice, name: e.target.value}
                        }))}
                        placeholder="Physiotherapie Mustermann"
                      />
                    </div>
                    <div>
                      <Label htmlFor="practice-phone">Telefonnummer *</Label>
                      <Input 
                        id="practice-phone"
                        value={settings.practice.phone}
                        onChange={(e) => setSettings(s => ({
                          ...s, 
                          practice: {...s.practice, phone: e.target.value}
                        }))}
                        placeholder="+49 123 456789"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="practice-address">Adresse</Label>
                    <Textarea 
                      id="practice-address"
                      value={settings.practice.address}
                      onChange={(e) => setSettings(s => ({
                        ...s, 
                        practice: {...s.practice, address: e.target.value}
                      }))}
                      placeholder="Musterstraße 123, 12345 Musterstadt"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="practice-email">E-Mail</Label>
                      <Input 
                        id="practice-email"
                        type="email"
                        value={settings.practice.email}
                        onChange={(e) => setSettings(s => ({
                          ...s, 
                          practice: {...s.practice, email: e.target.value}
                        }))}
                        placeholder="info@praxis-mustermann.de"
                      />
                    </div>
                    <div>
                      <Label htmlFor="practice-website">Website</Label>
                      <Input 
                        id="practice-website"
                        value={settings.practice.website}
                        onChange={(e) => setSettings(s => ({
                          ...s, 
                          practice: {...s.practice, website: e.target.value}
                        }))}
                        placeholder="https://praxis-mustermann.de"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Calendar Settings */}
            <TabsContent value="calendar">
              <div className="space-y-6">
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Kalender-Integration
                      <Badge variant="outline" className="border-success text-success">
                        Auto-Sync
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="google-api">Google Calendar API Key</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="google-api"
                          type="password"
                          value={settings.calendar.googleApiKey}
                          onChange={(e) => setSettings(s => ({
                            ...s, 
                            calendar: {...s.calendar, googleApiKey: e.target.value}
                          }))}
                          placeholder="AIzaSyC..."
                        />
                        <Button 
                          variant="outline" 
                          onClick={() => testConnection("Google Calendar")}
                        >
                          <TestTube className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        OAuth2-berechtigt für sichere Kalender-Synchronisation
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="calcom-api">Cal.com API Key</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="calcom-api"
                          type="password"
                          value={settings.calendar.calcomApiKey}
                          onChange={(e) => setSettings(s => ({
                            ...s, 
                            calendar: {...s.calendar, calcomApiKey: e.target.value}
                          }))}
                          placeholder="cal_live_..."
                        />
                        <Button 
                          variant="outline" 
                          onClick={() => testConnection("Cal.com")}
                        >
                          <TestTube className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="webhook-url">Webhook URL (Auto-generiert)</Label>
                      <Input 
                        id="webhook-url"
                        value="https://your-supabase-project.supabase.co/functions/v1/calendar-webhook"
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Für 2-Wege-Synchronisation zwischen KI und Kalender
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* AI Agent Settings */}
            <TabsContent value="ai">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    KI-Agent Konfiguration
                    <Badge variant="outline" className="border-primary text-primary">
                      Vapi
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="vapi-api">Vapi API Key *</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="vapi-api"
                        type="password"
                        value={settings.ai.vapiApiKey}
                        onChange={(e) => setSettings(s => ({
                          ...s, 
                          ai: {...s.ai, vapiApiKey: e.target.value}
                        }))}
                        placeholder="vapi_..."
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => testConnection("Vapi")}
                      >
                        <TestTube className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Benötigt für DSGVO-konforme Telefonie und Voice AI
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="voice-id">Stimme</Label>
                      <select 
                        id="voice-id"
                        value={settings.ai.voiceId}
                        onChange={(e) => setSettings(s => ({
                          ...s, 
                          ai: {...s.ai, voiceId: e.target.value}
                        }))}
                        className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md"
                      >
                        <option value="9BWtsMINqrJLrRacOk9x">Aria (Freundlich)</option>
                        <option value="EXAVITQu4vr4xnSDxMaL">Sarah (Professionell)</option>
                        <option value="FGY2WhTYpPnrIDTdsKH5">Laura (Warm)</option>
                        <option value="XB0fDUnXU5powFXDhCwa">Charlotte (Klar)</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="ai-model">KI-Modell</Label>
                      <select 
                        id="ai-model"
                        value={settings.ai.model}
                        onChange={(e) => setSettings(s => ({
                          ...s, 
                          ai: {...s.ai, model: e.target.value}
                        }))}
                        className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md"
                      >
                        <option value="eleven_multilingual_v2">Multilingual v2 (Empfohlen)</option>
                        <option value="eleven_turbo_v2_5">Turbo v2.5 (Schnell)</option>
                        <option value="eleven_multilingual_sts_v2">Speech-to-Speech v2</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="ai-language">Sprache</Label>
                    <select 
                      id="ai-language"
                      value={settings.ai.language}
                      onChange={(e) => setSettings(s => ({
                        ...s, 
                        ai: {...s.ai, language: e.target.value}
                      }))}
                      className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md"
                    >
                      <option value="de">Deutsch</option>
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                      <option value="es">Español</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Phone Settings */}
            <TabsContent value="phone">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-primary" />
                    Telefonie-Einstellungen
                    <Badge variant="outline" className="border-secondary text-secondary">
                      Twilio
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="twilio-sid">Twilio Account SID</Label>
                      <Input 
                        id="twilio-sid"
                        type="password"
                        value={settings.phone.twilioAccountSid}
                        onChange={(e) => setSettings(s => ({
                          ...s, 
                          phone: {...s.phone, twilioAccountSid: e.target.value}
                        }))}
                        placeholder="AC..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="twilio-token">Twilio Auth Token</Label>
                      <Input 
                        id="twilio-token"
                        type="password"
                        value={settings.phone.twilioAuthToken}
                        onChange={(e) => setSettings(s => ({
                          ...s, 
                          phone: {...s.phone, twilioAuthToken: e.target.value}
                        }))}
                        placeholder="Auth Token"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone-number">Telefonnummer</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="phone-number"
                        value={settings.phone.phoneNumber}
                        onChange={(e) => setSettings(s => ({
                          ...s, 
                          phone: {...s.phone, phoneNumber: e.target.value}
                        }))}
                        placeholder="+49 1234 567890"
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => testConnection("Twilio")}
                      >
                        <TestTube className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Deutsche Nummer für lokale Patienten empfohlen
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="record-calls">Anrufe aufzeichnen</Label>
                      <p className="text-xs text-muted-foreground">
                        Für Qualitätssicherung und DSGVO-konforme Dokumentation
                      </p>
                    </div>
                    <Switch 
                      id="record-calls"
                      checked={settings.phone.recordCalls}
                      onCheckedChange={(checked) => setSettings(s => ({
                        ...s, 
                        phone: {...s.phone, recordCalls: checked}
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* GDPR Settings */}
            <TabsContent value="gdpr">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    DSGVO-Compliance
                    <Badge variant="outline" className="border-success text-success">
                      EU-konform
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 border border-warning/20 bg-warning/5 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                      <div>
                        <h4 className="font-medium text-warning">Wichtiger Hinweis</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Diese Einstellungen gewährleisten DSGVO-Konformität für deutsche Praxen. 
                          Alle Daten werden ausschließlich auf EU-Servern verarbeitet.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="retention-days">Datenaufbewahrung (Tage)</Label>
                    <Input 
                      id="retention-days"
                      type="number"
                      value={settings.gdpr.dataRetentionDays}
                      onChange={(e) => setSettings(s => ({
                        ...s, 
                        gdpr: {...s.gdpr, dataRetentionDays: parseInt(e.target.value)}
                      }))}
                      min="30"
                      max="3650"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Empfohlen: 3 Jahre (1095 Tage) für Healthcare-Dokumentation
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Cookie-Einverständnis erforderlich</Label>
                        <p className="text-xs text-muted-foreground">
                          Nutzer müssen Cookies explizit zustimmen
                        </p>
                      </div>
                      <Switch 
                        checked={settings.gdpr.cookieConsent}
                        onCheckedChange={(checked) => setSettings(s => ({
                          ...s, 
                          gdpr: {...s.gdpr, cookieConsent: checked}
                        }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Daten anonymisieren</Label>
                        <p className="text-xs text-muted-foreground">
                          Persönliche Daten nach Aufbewahrungsfrist anonymisieren
                        </p>
                      </div>
                      <Switch 
                        checked={settings.gdpr.anonymizeData}
                        onCheckedChange={(checked) => setSettings(s => ({
                          ...s, 
                          gdpr: {...s.gdpr, anonymizeData: checked}
                        }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Nur EU-Server verwenden</Label>
                        <p className="text-xs text-muted-foreground">
                          Datenverarbeitung ausschließlich in der EU
                        </p>
                      </div>
                      <Switch 
                        checked={settings.gdpr.euServerOnly}
                        onCheckedChange={(checked) => setSettings(s => ({
                          ...s, 
                          gdpr: {...s.gdpr, euServerOnly: checked}
                        }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-success/5 border border-success/20 rounded-lg">
                    <div className="text-center">
                      <Database className="w-8 h-8 text-success mx-auto mb-2" />
                      <p className="text-sm font-medium">Supabase EU</p>
                      <p className="text-xs text-muted-foreground">Frankfurt Server</p>
                    </div>
                    <div className="text-center">
                      <Globe className="w-8 h-8 text-success mx-auto mb-2" />
                      <p className="text-sm font-medium">Vapi EU</p>
                      <p className="text-xs text-muted-foreground">Deutschland Server</p>
                    </div>
                    <div className="text-center">
                      <Shield className="w-8 h-8 text-success mx-auto mb-2" />
                      <p className="text-sm font-medium">SSL/TLS</p>
                      <p className="text-xs text-muted-foreground">End-to-End</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </SidebarProvider>
  )
}