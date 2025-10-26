import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, Database, Lock, FileText, Server, Eye, AlertCircle, CheckCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Compliance() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(-1)}
                className="h-9 w-9 p-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">DSGVO & Compliance</h1>
                  <p className="text-sm text-muted-foreground">
                    Transparenz & Datensicherheit
                  </p>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="hidden sm:flex gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              DSGVO-konform
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-5xl mx-auto">
          
          {/* Critical Information Alert */}
          <Alert className="mb-6 border-primary/50">
            <Shield className="h-4 w-4" />
            <AlertTitle>Vollständige DSGVO-Konformität</AlertTitle>
            <AlertDescription>
              VoxCal wurde nach den strengsten europäischen Datenschutzrichtlinien entwickelt. 
              Alle personenbezogenen Daten werden verschlüsselt und sicher in der EU gespeichert.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
              <TabsTrigger value="overview">Übersicht</TabsTrigger>
              <TabsTrigger value="dataflow">Datenfluss</TabsTrigger>
              <TabsTrigger value="security">Sicherheit</TabsTrigger>
              <TabsTrigger value="rights">Ihre Rechte</TabsTrigger>
              <TabsTrigger value="processors">Verarbeiter</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    DSGVO-Compliance Übersicht
                  </CardTitle>
                  <CardDescription>
                    Wie wir Ihre Daten schützen und verarbeiten
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex gap-3 p-4 border rounded-lg">
                      <Database className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold mb-1">Datenspeicherung</h4>
                        <p className="text-sm text-muted-foreground">
                          Alle Daten werden ausschließlich auf Servern in der EU gespeichert (Supabase Frankfurt).
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 p-4 border rounded-lg">
                      <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold mb-1">Verschlüsselung</h4>
                        <p className="text-sm text-muted-foreground">
                          Ende-zu-Ende-Verschlüsselung für alle sensiblen Patientendaten (AES-256).
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 p-4 border rounded-lg">
                      <Eye className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold mb-1">Zugriffskontrolle</h4>
                        <p className="text-sm text-muted-foreground">
                          Row-Level Security (RLS) stellt sicher, dass nur Sie Ihre Daten sehen können.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 p-4 border rounded-lg">
                      <Server className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold mb-1">Audit Logs</h4>
                        <p className="text-sm text-muted-foreground">
                          Alle Zugriffe auf personenbezogene Daten werden protokolliert.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Aufbewahrungsfristen</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between p-2 bg-muted/50 rounded">
                        <span>Patientendaten</span>
                        <span className="font-medium">10 Jahre (automatische Löschung)</span>
                      </div>
                      <div className="flex justify-between p-2 bg-muted/50 rounded">
                        <span>Terminhistorie</span>
                        <span className="font-medium">10 Jahre</span>
                      </div>
                      <div className="flex justify-between p-2 bg-muted/50 rounded">
                        <span>Audit Logs</span>
                        <span className="font-medium">3 Jahre</span>
                      </div>
                      <div className="flex justify-between p-2 bg-muted/50 rounded">
                        <span>AI Call Logs</span>
                        <span className="font-medium">2 Jahre</span>
                      </div>
                    </div>
                    <Alert className="mt-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        Nach Ablauf der Aufbewahrungsfrist werden Daten <strong>automatisch und unwiderruflich gelöscht</strong>.
                        Sie können jederzeit eine vorzeitige Löschung beantragen.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Data Flow Tab */}
            <TabsContent value="dataflow" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Datenfluss & Verarbeitung
                  </CardTitle>
                  <CardDescription>
                    Wohin fließen Ihre Daten und warum?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">1. Datenerfassung</h4>
                    <div className="pl-4 border-l-2 border-primary/30 space-y-2">
                      <p className="text-sm text-muted-foreground">
                        <strong>Was wird erfasst?</strong> Name, Kontaktdaten, Termininformationen, Notizen
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) + Art. 9 Abs. 2 lit. h DSGVO (Gesundheitsvorsorge)
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Zweck:</strong> Terminverwaltung und Patientenbetreuung
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-semibold">2. Datenspeicherung</h4>
                    <div className="pl-4 border-l-2 border-primary/30 space-y-2">
                      <p className="text-sm text-muted-foreground">
                        <strong>Speicherort:</strong> Supabase (PostgreSQL) - Frankfurt, Deutschland (EU)
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Sicherheit:</strong> AES-256 Verschlüsselung, Row-Level Security, ISO 27001 zertifiziert
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Backup:</strong> Tägliche automatische Backups (verschlüsselt)
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-semibold">3. Datenverarbeitung durch Dritte</h4>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <strong className="text-sm">VAPI (Telefonie-AI)</strong>
                          <Badge variant="secondary">USA</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Spracherkennung und KI-gestützte Terminbuchung per Telefon
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <strong>Daten:</strong> Sprachaufnahmen, Transkripte (temporär, max. 30 Tage)<br />
                          <strong>Rechtsgrundlage:</strong> Standard-Vertragsklauseln (EU-Kommission)<br />
                          <strong>Zweck:</strong> Telefonische Terminbuchung
                        </p>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <strong className="text-sm">OpenAI (GPT-4)</strong>
                          <Badge variant="secondary">USA</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          KI-gestützte Textverarbeitung und Chatbot-Funktionalität
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <strong>Daten:</strong> Anonymisierte Anfragen (keine personenbezogenen Daten)<br />
                          <strong>Rechtsgrundlage:</strong> Standard-Vertragsklauseln<br />
                          <strong>Zweck:</strong> Intelligente Assistenzfunktionen
                        </p>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <strong className="text-sm">Stripe (Zahlungen)</strong>
                          <Badge variant="outline">EU</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Sichere Zahlungsabwicklung und Abonnementverwaltung
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <strong>Daten:</strong> E-Mail, Zahlungsinformationen<br />
                          <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO<br />
                          <strong>Zweck:</strong> Abwicklung von Zahlungen
                        </p>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertTitle>Wichtig: Drittland-Übermittlungen</AlertTitle>
                    <AlertDescription className="text-sm mt-2">
                      Alle Übermittlungen in Drittländer (USA) erfolgen ausschließlich auf Basis von 
                      <strong> EU-Standardvertragsklauseln</strong> und werden durch zusätzliche technische 
                      Maßnahmen (Verschlüsselung, Pseudonymisierung) abgesichert.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Technische & Organisatorische Maßnahmen
                  </CardTitle>
                  <CardDescription>
                    Wie wir Ihre Daten technisch schützen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <strong className="text-sm">Zutrittskontrolle</strong>
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">
                        Rechenzentren mit biometrischem Zugang, 24/7 Überwachung, ISO 27001 zertifiziert
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <strong className="text-sm">Zugangskontrolle</strong>
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">
                        Multi-Faktor-Authentifizierung (MFA), Passwort-Policies (min. 8 Zeichen, Komplexität), 
                        Session-Timeout nach 24 Stunden Inaktivität
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <strong className="text-sm">Zugriffskontrolle</strong>
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">
                        Row-Level Security (RLS) - Jeder Benutzer sieht nur eigene Daten, 
                        Rollen-basierte Zugriffsrechte (Owner, Admin, Staff)
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <strong className="text-sm">Trennungskontrolle</strong>
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">
                        Logische Trennung aller Praxisdaten, keine Praxis kann Daten anderer Praxen sehen
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <strong className="text-sm">Pseudonymisierung</strong>
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">
                        UUIDs statt Namen in Logs, Anonymisierung für Analytics, 
                        keine direkten Identifikatoren in Drittanbieter-APIs
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <strong className="text-sm">Verschlüsselung</strong>
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">
                        TLS 1.3 für Datenübertragung, AES-256 für Datenspeicherung, 
                        verschlüsselte Backups
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <strong className="text-sm">Verfügbarkeitskontrolle</strong>
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">
                        99.9% Uptime-SLA, tägliche Backups (30 Tage Aufbewahrung), 
                        Disaster Recovery Plan
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <strong className="text-sm">Auftragskontrolle</strong>
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">
                        Audit Logs für alle Datenzugriffe, unveränderbar, 3 Jahre Aufbewahrung
                      </p>
                    </div>
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      Alle technischen Maßnahmen werden regelmäßig durch unabhängige Sicherheitsaudits überprüft 
                      und entsprechen dem Stand der Technik (Art. 32 DSGVO).
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rights Tab */}
            <TabsContent value="rights" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Ihre Rechte nach DSGVO
                  </CardTitle>
                  <CardDescription>
                    Was Sie jederzeit tun können
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Recht auf Auskunft (Art. 15 DSGVO)
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Sie können jederzeit Auskunft über Ihre gespeicherten Daten erhalten.
                      </p>
                      <Button variant="outline" size="sm" onClick={() => navigate('/export')}>
                        Daten exportieren
                      </Button>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Recht auf Berichtigung (Art. 16 DSGVO)</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Falsche Daten können Sie jederzeit selbst korrigieren oder uns kontaktieren.
                      </p>
                      <Button variant="outline" size="sm" onClick={() => navigate('/patients')}>
                        Patientendaten bearbeiten
                      </Button>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Recht auf Löschung (Art. 17 DSGVO)</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Sie können die Löschung Ihrer Daten beantragen, sofern keine gesetzlichen Aufbewahrungsfristen entgegenstehen.
                      </p>
                      <Button variant="outline" size="sm" onClick={() => navigate('/settings?tab=gdpr')}>
                        Löschantrag stellen
                      </Button>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Export aller Daten in maschinenlesbarem Format (JSON, CSV).
                      </p>
                      <Button variant="outline" size="sm" onClick={() => navigate('/export')}>
                        Daten exportieren
                      </Button>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Recht auf Widerspruch (Art. 21 DSGVO)</h4>
                      <p className="text-sm text-muted-foreground">
                        Sie können der Verarbeitung Ihrer Daten jederzeit widersprechen.
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Recht auf Beschwerde (Art. 77 DSGVO)</h4>
                      <p className="text-sm text-muted-foreground">
                        Sie haben das Recht, sich bei der zuständigen Datenschutzbehörde zu beschweren.
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-semibold">Kontakt für Datenschutzanfragen</h4>
                    <p className="text-sm text-muted-foreground">
                      Für alle Anfragen zu Ihren Daten erreichen Sie uns unter:
                    </p>
                    <div className="p-3 bg-muted/50 rounded-lg space-y-1 text-sm">
                      <p><strong>E-Mail:</strong> datenschutz@voxcal.de</p>
                      <p><strong>Antwortzeit:</strong> Innerhalb von 30 Tagen (gesetzlich vorgeschrieben)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Processors Tab */}
            <TabsContent value="processors" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5" />
                    Auftragsverarbeiter (AVV)
                  </CardTitle>
                  <CardDescription>
                    Alle Dienstleister, die Ihre Daten verarbeiten
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertTitle>Auftragsverarbeitungsvertrag (AVV)</AlertTitle>
                    <AlertDescription className="text-sm mt-2">
                      Mit allen nachfolgenden Dienstleistern haben wir Auftragsverarbeitungsverträge 
                      nach Art. 28 DSGVO abgeschlossen. Auf Anfrage stellen wir Ihnen gerne Kopien zur Verfügung.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <strong>Supabase Inc.</strong>
                        <Badge>Primary Processor</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Zweck:</strong> Datenbank-Hosting, Authentication, Storage<br />
                        <strong>Standort:</strong> Frankfurt, Deutschland (EU)<br />
                        <strong>Zertifizierungen:</strong> ISO 27001, SOC 2 Type II<br />
                        <strong>AVV:</strong> Verfügbar unter supabase.com/dpa
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <strong>VAPI AI Inc.</strong>
                        <Badge variant="secondary">Sub-Processor</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Zweck:</strong> Telefonie-AI, Spracherkennung<br />
                        <strong>Standort:</strong> USA (Standard-Vertragsklauseln)<br />
                        <strong>Datensparsamkeit:</strong> Nur Sprachdaten, keine Gesundheitsdaten<br />
                        <strong>AVV:</strong> Vorhanden
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <strong>OpenAI LLC</strong>
                        <Badge variant="secondary">Sub-Processor</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Zweck:</strong> KI-Textverarbeitung (anonymisiert)<br />
                        <strong>Standort:</strong> USA (Standard-Vertragsklauseln)<br />
                        <strong>Datensparsamkeit:</strong> Keine personenbezogenen Daten<br />
                        <strong>AVV:</strong> Vorhanden
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <strong>Stripe Payments Europe Ltd.</strong>
                        <Badge variant="outline">Sub-Processor</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Zweck:</strong> Zahlungsabwicklung<br />
                        <strong>Standort:</strong> Irland (EU)<br />
                        <strong>Zertifizierungen:</strong> PCI DSS Level 1<br />
                        <strong>AVV:</strong> Verfügbar unter stripe.com/dpa
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Wichtige Hinweise</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                      <li>Alle Auftragsverarbeiter sind vertraglich verpflichtet, die DSGVO einzuhalten</li>
                      <li>Keine Weitergabe an weitere Subunternehmer ohne Ihre Zustimmung</li>
                      <li>Regelmäßige Audits und Sicherheitsprüfungen</li>
                      <li>Sofortige Benachrichtigung bei Datenschutzverletzungen</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Footer Actions */}
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Haben Sie Fragen zu unserer Datenverarbeitung?</p>
                  <p className="text-xs text-muted-foreground">
                    Unser Datenschutzbeauftragter hilft Ihnen gerne weiter.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => navigate('/privacy')}>
                    Datenschutzerklärung
                  </Button>
                  <Button onClick={() => window.location.href = 'mailto:datenschutz@voxcal.de'}>
                    Kontakt aufnehmen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}