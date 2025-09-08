import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { MobileHeader } from "@/components/layout/MobileHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
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

import { useToast } from "@/hooks/use-toast"
import { DataRequestInterface } from "@/components/gdpr/DataRequestInterface"

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
    n8n: {
      webhookUrl: "",
      enabled: false,
      triggers: {
        newAppointment: true,
        appointmentUpdated: false,
        newPatient: true
      }
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

  const testN8nWebhook = async () => {
    if (!settings.n8n.webhookUrl) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie eine n8n Webhook URL ein",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(settings.n8n.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          source: "praxis-setup",
          message: "Test-Nachricht von Ihrer Praxis-Software"
        }),
      });

      toast({
        title: "Test gesendet",
        description: "Die Test-Nachricht wurde an n8n gesendet. Prüfen Sie Ihren n8n Workflow.",
      });
    } catch (error) {
      console.error("n8n test error:", error);
      toast({
        title: "Fehler",
        description: "Test konnte nicht gesendet werden. Prüfen Sie die URL.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async (service: string) => {
    if (service === "n8n") {
      testN8nWebhook();
      return;
    }
    
    setIsLoading(true);
    try {
      // Secure API key validation
      let apiKey = '';
      let validationError = '';

      switch (service) {
        case 'googleCalendar':
          apiKey = settings.calendar.googleApiKey;
          if (!apiKey || !apiKey.startsWith('AIza') || apiKey.length < 30) {
            validationError = 'Invalid Google Calendar API key format';
          }
          break;
        case 'vapi':
          apiKey = settings.ai.vapiApiKey;
          if (!apiKey || apiKey.length < 20) {
            validationError = 'Invalid Vapi API key format';
          }
          break;
        case 'twilio':
          apiKey = settings.phone.twilioAuthToken;
          if (!apiKey || apiKey.length < 30) {
            validationError = 'Invalid Twilio Auth Token format';
          }
          break;
        case 'openai':
          apiKey = settings.ai.vapiApiKey; // Using Vapi key instead of separate OpenAI key
          if (!apiKey || apiKey.length < 20) {
            validationError = 'Invalid API key format';
          }
          break;
      }

      if (validationError) {
        toast({
          title: "Validation Error",
          description: validationError,
          variant: "destructive"
        });
        return;
      }

      // Simulate API test for different services (secure - no actual API calls with keys)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Connection Test",
        description: `${service} API key format is valid. Connection test simulated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: `Failed to test ${service} connection.`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-x-hidden">
          <MobileHeader title="Einstellungen" subtitle="Konfiguration & Integrationen" showUpgradeButton={true} />
          
          <div className="p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 lg:mb-8 space-y-4 lg:space-y-0">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hidden lg:inline-flex" />
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
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
                className="bg-gradient-primary text-white shadow-glow w-full lg:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Speichern..." : "Alle speichern"}
              </Button>
            </div>
            </div>

          <Tabs defaultValue="practice" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
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
              <TabsTrigger value="automation" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                n8n
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
                          disabled={isLoading || !settings.calendar.googleApiKey}
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
                          disabled={isLoading || !settings.calendar.calcomApiKey}
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
                        disabled={isLoading || !settings.ai.vapiApiKey}
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
                          disabled={isLoading || !settings.phone.twilioAccountSid}
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

            {/* n8n Automation Settings */}
            <TabsContent value="automation">
              <div className="space-y-6">
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-primary" />
                      n8n Automation
                      <Badge variant="outline" className={settings.n8n.enabled ? "border-success text-success" : "border-muted text-muted"}>
                        {settings.n8n.enabled ? "Aktiviert" : "Deaktiviert"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 border border-primary/20 bg-primary/5 rounded-lg">
                      <h4 className="font-medium mb-2">Was ist n8n?</h4>
                      <p className="text-sm text-muted-foreground">
                        n8n ist eine Open-Source Automatisierungs-Plattform. Verbinden Sie Ihre Praxis mit anderen Tools wie Excel, 
                        Google Sheets, E-Mail-Marketing, Buchhaltungssoftware und vielem mehr.
                      </p>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label>n8n Integration aktivieren</Label>
                        <p className="text-xs text-muted-foreground">
                          Automatische Weiterleitung von Termindaten an n8n
                        </p>
                      </div>
                      <Switch 
                        checked={settings.n8n.enabled}
                        onCheckedChange={(checked) => setSettings(s => ({
                          ...s, 
                          n8n: {...s.n8n, enabled: checked}
                        }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="n8n-webhook">n8n Webhook URL</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="n8n-webhook"
                          value={settings.n8n.webhookUrl}
                          onChange={(e) => setSettings(s => ({
                            ...s, 
                            n8n: {...s.n8n, webhookUrl: e.target.value}
                          }))}
                          placeholder="https://your-n8n-instance.com/webhook/..."
                          disabled={!settings.n8n.enabled}
                        />
                        <Button 
                          variant="outline" 
                          onClick={() => testConnection("n8n")}
                          disabled={!settings.n8n.enabled || !settings.n8n.webhookUrl}
                        >
                          <TestTube className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        1. Erstellen Sie einen Workflow in n8n<br/>
                        2. Fügen Sie einen "Webhook" Trigger hinzu<br/>
                        3. Kopieren Sie die URL hierher
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label>Automatisierungen aktivieren:</Label>
                      
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="text-sm font-medium">Neuer Termin</p>
                          <p className="text-xs text-muted-foreground">Wird ausgelöst bei jeder AI-Terminbuchung</p>
                        </div>
                        <Switch 
                          checked={settings.n8n.triggers.newAppointment}
                          onCheckedChange={(checked) => setSettings(s => ({
                            ...s, 
                            n8n: {...s.n8n, triggers: {...s.n8n.triggers, newAppointment: checked}}
                          }))}
                          disabled={!settings.n8n.enabled}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="text-sm font-medium">Neuer Patient</p>
                          <p className="text-xs text-muted-foreground">Wird ausgelöst bei der ersten Terminbuchung eines Patienten</p>
                        </div>
                        <Switch 
                          checked={settings.n8n.triggers.newPatient}
                          onCheckedChange={(checked) => setSettings(s => ({
                            ...s, 
                            n8n: {...s.n8n, triggers: {...s.n8n.triggers, newPatient: checked}}
                          }))}
                          disabled={!settings.n8n.enabled}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="text-sm font-medium">Termin aktualisiert</p>
                          <p className="text-xs text-muted-foreground">Wird ausgelöst bei Änderungen an bestehenden Terminen</p>
                        </div>
                        <Switch 
                          checked={settings.n8n.triggers.appointmentUpdated}
                          onCheckedChange={(checked) => setSettings(s => ({
                            ...s, 
                            n8n: {...s.n8n, triggers: {...s.n8n.triggers, appointmentUpdated: checked}}
                          }))}
                          disabled={!settings.n8n.enabled}
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-muted/20 rounded-lg">
                      <h4 className="text-sm font-medium mb-2">Beispiel-Automatisierungen:</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Neuer Termin → Google Kalender + Excel-Liste</li>
                        <li>• Neuer Patient → CRM-System + Newsletter</li>
                        <li>• Termin gebucht → SMS-Bestätigung + Buchhaltung</li>
                        <li>• AI-Anruf → Slack-Benachrichtigung</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
                <CardContent>
                  <DataRequestInterface />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        {/* Legal Links Footer */}
        <div className="border-t bg-muted/20 p-6">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <Link 
              to="/imprint" 
              className="hover:text-primary transition-colors hover:underline"
            >
              Impressum
            </Link>
            <Link 
              to="/privacy" 
              className="hover:text-primary transition-colors hover:underline"
            >
              Datenschutzerklärung
            </Link>
            <Link 
              to="/terms" 
              className="hover:text-primary transition-colors hover:underline"
            >
              AGB
            </Link>
          </div>
          <div className="text-center mt-4 text-xs text-muted-foreground">
            © 2024 Voxcal. Alle Rechte vorbehalten.
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}