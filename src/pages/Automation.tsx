import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Webhook, 
  Zap,
  TestTube,
  Settings
} from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Switch } from "@/components/ui/switch"
import { useSubscription } from "@/hooks/useSubscription"
import { useAuth } from "@/hooks/useAuth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Link } from "react-router-dom"
import { Crown } from "lucide-react"

export default function Automation() {
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState("")
  const [n8nEnabled, setN8nEnabled] = useState(false)
  const [isTestingWebhook, setIsTestingWebhook] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const { isSubscribed } = useSubscription()

  // Check if user has access to automation features (subscription or whitelisted email)
  const hasAutomationAccess = isSubscribed || user?.email === 'razvanmariusoancea@gmail.com'

  useEffect(() => {
    loadN8nConfig()
  }, [])

  const loadN8nConfig = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-n8n-config')
      
      if (error) throw error
      
      if (data.success) {
        setN8nWebhookUrl(data.webhookUrl)
        setN8nEnabled(data.enabled)
      }
    } catch (error) {
      console.error('Error loading n8n config:', error)
    }
  }

  const saveN8nConfig = async () => {
    try {
      setIsSaving(true)
      const { data, error } = await supabase.functions.invoke('update-n8n-config', {
        body: { 
          webhookUrl: n8nWebhookUrl,
          enabled: n8nEnabled
        }
      })
      
      if (error) throw error
      
      if (data.success) {
        toast({
          title: "Gespeichert",
          description: "Automation Konfiguration wurde erfolgreich aktualisiert",
        })
      } else {
        throw new Error(data.error || 'Unbekannter Fehler')
      }
    } catch (error) {
      console.error('Error saving n8n config:', error)
      toast({
        title: "Fehler",
        description: "Automation Konfiguration konnte nicht gespeichert werden",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const testN8nWebhook = async () => {
    if (!n8nEnabled) {
      toast({
        title: "Fehler",
        description: "Bitte aktivieren Sie n8n Automation zuerst",
        variant: "destructive"
      })
      return
    }

    if (!n8nWebhookUrl?.trim()) {
      toast({
        title: "Fehler", 
        description: "Bitte geben Sie eine Webhook URL ein",
        variant: "destructive"
      })
      return
    }

    try {
      setIsTestingWebhook(true)
      const { data, error } = await supabase.functions.invoke('test-n8n-webhook')
      
      if (error) {
        console.error('Error testing n8n webhook:', error)
        toast({
          title: "Test fehlgeschlagen",
          description: error.message || "Webhook konnte nicht ausgelöst werden",
          variant: "destructive"
        })
      } else if (data?.error) {
        toast({
          title: "Test fehlgeschlagen", 
          description: data.error,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Test erfolgreich",
          description: "n8n Webhook wurde erfolgreich ausgelöst",
        })
      }
    } catch (error) {
      console.error('Error testing webhook:', error)
      toast({
        title: "Test fehlgeschlagen",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive"
      })
    } finally {
      setIsTestingWebhook(false)
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 p-6 bg-background">
          {!hasAutomationAccess && (
            <Alert className="mb-6 border-primary bg-primary/5">
              <Crown className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>
                  <strong>Pro-Feature:</strong> n8n Automation ist nur im Pro-Plan verfügbar.
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
                  Automation
                </h1>
                <p className="text-muted-foreground">
                  Automatische Workflows und Integrationen
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-3xl">
            {/* n8n Automation */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="w-5 h-5 text-primary" />
                  n8n Workflow Automation
                  <Badge variant="outline" className="border-secondary text-secondary">
                    Pro
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Automatische Aktionen nach jeder AI-Terminbuchung
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="n8n-enabled">n8n Automation aktivieren</Label>
                    <p className="text-xs text-muted-foreground">
                      Triggert Workflows bei neuen Terminen
                    </p>
                  </div>
                  <Switch
                    id="n8n-enabled"
                    checked={n8nEnabled}
                    onCheckedChange={hasAutomationAccess ? setN8nEnabled : undefined}
                    disabled={!hasAutomationAccess}
                  />
                </div>

                {n8nEnabled && (
                  <div>
                    <Label htmlFor="n8n-webhook">n8n Webhook URL</Label>
                    <Input
                      id="n8n-webhook"
                      value={n8nWebhookUrl}
                      onChange={(e) => setN8nWebhookUrl(e.target.value)}
                      placeholder={!hasAutomationAccess ? "Pro-Plan erforderlich" : "https://your-n8n-instance.com/webhook/..."}
                      className="font-mono text-sm"
                      disabled={!hasAutomationAccess}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Webhook URL aus deinem n8n Workflow
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={testN8nWebhook}
                    disabled={isTestingWebhook || !n8nEnabled || !hasAutomationAccess}
                    variant="outline" 
                    className="flex-1"
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    {isTestingWebhook ? "Teste..." : "Test Webhook"}
                  </Button>
                  <Button 
                    onClick={saveN8nConfig}
                    disabled={isSaving || !hasAutomationAccess}
                    className="bg-gradient-primary text-white shadow-glow flex-1"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {isSaving ? "Speichern..." : "Speichern"}
                  </Button>
                </div>

              </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}