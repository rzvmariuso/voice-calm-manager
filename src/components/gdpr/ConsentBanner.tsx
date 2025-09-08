import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Shield, 
  Cookie,
  Settings,
  X,
  Check,
  Info
} from "lucide-react"
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

interface ConsentPreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  functional: boolean
}

export function ConsentBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    functional: false
  })
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setIsVisible(true)
    }
  }, [])

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    }
    localStorage.setItem('cookie-consent', JSON.stringify({
      preferences: allAccepted,
      timestamp: new Date().toISOString()
    }))
    setIsVisible(false)
  }

  const acceptSelected = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      preferences,
      timestamp: new Date().toISOString()
    }))
    setIsVisible(false)
  }

  const rejectAll = () => {
    const minimal = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    }
    localStorage.setItem('cookie-consent', JSON.stringify({
      preferences: minimal,
      timestamp: new Date().toISOString()
    }))
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="shadow-2xl border-primary/20 bg-background/95 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Cookie className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">🍪 Cookie-Einstellungen</h3>
                <Badge variant="outline" className="border-primary text-primary text-xs">
                  DSGVO-konform
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                Wir verwenden Cookies, um Ihnen die bestmögliche Erfahrung zu bieten. 
                Notwendige Cookies sind für die Grundfunktionen erforderlich. 
                Weitere Cookies helfen uns, unseren Service zu verbessern.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={acceptAll}
                  className="bg-gradient-primary text-white shadow-glow"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Alle akzeptieren
                </Button>
                
                <Button
                  onClick={rejectAll}
                  variant="outline"
                >
                  Nur notwendige
                </Button>

                <Dialog open={showDetails} onOpenChange={setShowDetails}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Einstellungen
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        Cookie-Einstellungen verwalten
                      </DialogTitle>
                      <DialogDescription>
                        Wählen Sie, welche Cookies Sie zulassen möchten. Ihre Einstellungen können Sie jederzeit ändern.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                      {/* Necessary Cookies */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Checkbox 
                              checked={preferences.necessary} 
                              disabled
                              className="data-[state=checked]:bg-success"
                            />
                            <div>
                              <h4 className="font-medium">Notwendige Cookies</h4>
                              <p className="text-sm text-muted-foreground">
                                Erforderlich für grundlegende Funktionen
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-success/10 text-success">
                            Immer aktiv
                          </Badge>
                        </div>
                        <div className="pl-9 text-xs text-muted-foreground">
                          <p>Session-Management, Sicherheit, Login-Status</p>
                        </div>
                      </div>

                      <Separator />

                      {/* Analytics Cookies */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Checkbox 
                              checked={preferences.analytics}
                              onCheckedChange={(checked) => 
                                setPreferences(prev => ({ ...prev, analytics: !!checked }))
                              }
                            />
                            <div>
                              <h4 className="font-medium">Analyse-Cookies</h4>
                              <p className="text-sm text-muted-foreground">
                                Helfen uns, die Nutzung zu verstehen
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="pl-9 text-xs text-muted-foreground">
                          <p>Seitenaufrufe, Nutzungsdauer, beliebte Funktionen (anonymisiert)</p>
                        </div>
                      </div>

                      <Separator />

                      {/* Marketing Cookies */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Checkbox 
                              checked={preferences.marketing}
                              onCheckedChange={(checked) => 
                                setPreferences(prev => ({ ...prev, marketing: !!checked }))
                              }
                            />
                            <div>
                              <h4 className="font-medium">Marketing-Cookies</h4>
                              <p className="text-sm text-muted-foreground">
                                Für personalisierte Inhalte und Werbung
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="pl-9 text-xs text-muted-foreground">
                          <p>Zielgruppenansprache, Retargeting, personalisierte Anzeigen</p>
                        </div>
                      </div>

                      <Separator />

                      {/* Functional Cookies */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Checkbox 
                              checked={preferences.functional}
                              onCheckedChange={(checked) => 
                                setPreferences(prev => ({ ...prev, functional: !!checked }))
                              }
                            />
                            <div>
                              <h4 className="font-medium">Funktionale Cookies</h4>
                              <p className="text-sm text-muted-foreground">
                                Erweiterte Funktionen und Komfort
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="pl-9 text-xs text-muted-foreground">
                          <p>Spracheinstellungen, Design-Präferenzen, erweiterte Features</p>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button 
                          onClick={acceptSelected}
                          className="bg-gradient-primary text-white flex-1"
                        >
                          Auswahl speichern
                        </Button>
                        <Button 
                          onClick={() => setShowDetails(false)}
                          variant="outline"
                        >
                          Abbrechen
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Info className="w-3 h-3" />
                Weitere Informationen in unserer
              </span>
              <Link
                to="/data-protection" 
                className="text-primary hover:underline font-medium"
              >
                Datenschutzerklärung
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}