import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft, Lock, Eye, Trash2, Download } from "lucide-react";
import { Link } from "react-router-dom";

export default function DataProtection() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 p-6 bg-background">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Link to="/">
                <Button variant="ghost" className="hover:scale-105 transition-transform duration-200">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Zurück zum Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gradient">
                  Datenschutzerklärung
                </h1>
                <p className="text-muted-foreground">
                  Informationen zur Verarbeitung Ihrer personenbezogenen Daten
                </p>
              </div>
            </div>

            <div className="grid gap-6">
              {/* DSGVO Rechte - Prominente Darstellung */}
              <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Shield className="w-5 h-5" />
                    Ihre Rechte nach DSGVO
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                      <Eye className="w-5 h-5 text-primary" />
                      <div>
                        <h3 className="font-medium">Auskunftsrecht</h3>
                        <p className="text-sm text-muted-foreground">Einsicht in Ihre gespeicherten Daten</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                      <Download className="w-5 h-5 text-primary" />
                      <div>
                        <h3 className="font-medium">Datenportabilität</h3>
                        <p className="text-sm text-muted-foreground">Export Ihrer Daten</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                      <Lock className="w-5 h-5 text-primary" />
                      <div>
                        <h3 className="font-medium">Berichtigung</h3>
                        <p className="text-sm text-muted-foreground">Korrektur falscher Daten</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                      <Trash2 className="w-5 h-5 text-primary" />
                      <div>
                        <h3 className="font-medium">Löschung</h3>
                        <p className="text-sm text-muted-foreground">Recht auf Vergessenwerden</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg">
                    <p className="text-sm text-success-foreground">
                      <strong>Kontakt:</strong> Für alle Anfragen zu Ihren Datenschutzrechten wenden Sie sich an: 
                      <a href="mailto:datenschutz@praxisflow.de" className="underline ml-1">datenschutz@praxisflow.de</a>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Hauptinhalt */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Datenschutzerklärung - Stand: Januar 2024
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                  <div className="space-y-6">
                    <section>
                      <h2 className="text-xl font-semibold mb-3">1. Verantwortlicher</h2>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-muted-foreground">
                          <strong>PraxisFlow GmbH</strong><br />
                          Musterstraße 123<br />
                          10115 Berlin<br />
                          Deutschland<br />
                          <br />
                          E-Mail: datenschutz@praxisflow.de<br />
                          Telefon: +49 30 12345678<br />
                          <br />
                          <strong>Datenschutzbeauftragter:</strong><br />
                          dsb@praxisflow.de
                        </p>
                      </div>
                    </section>

                    <section>
                      <h2 className="text-xl font-semibold mb-3">2. Grundlagen der Datenverarbeitung</h2>
                      <p className="text-muted-foreground leading-relaxed">
                        Wir verarbeiten personenbezogene Daten nur auf der Grundlage gesetzlicher Erlaubnisvorschriften. 
                        Die Verarbeitung erfolgt auf Basis Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), 
                        zur Erfüllung unserer vertraglichen Pflichten (Art. 6 Abs. 1 lit. b DSGVO) oder 
                        auf Basis berechtigter Interessen (Art. 6 Abs. 1 lit. f DSGVO).
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-semibold mb-3">3. Welche Daten verarbeiten wir?</h2>
                      
                      <h3 className="text-lg font-medium mb-2 mt-4">3.1 Registrierungs- und Kontodaten</h3>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                        <li>E-Mail-Adresse</li>
                        <li>Passwort (verschlüsselt gespeichert)</li>
                        <li>Praxisdaten (Name, Adresse, Kontaktdaten)</li>
                        <li>Abrechnungsinformationen</li>
                      </ul>

                      <h3 className="text-lg font-medium mb-2 mt-4">3.2 Patientendaten (nur für Praxisinhaber)</h3>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                        <li>Name und Kontaktdaten der Patienten</li>
                        <li>Geburtsdatum</li>
                        <li>Terminhistorie</li>
                        <li>Behandlungsnotizen</li>
                      </ul>

                      <h3 className="text-lg font-medium mb-2 mt-4">3.3 Nutzungsdaten</h3>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                        <li>IP-Adresse</li>
                        <li>Browser-Informationen</li>
                        <li>Zugriffszeiten</li>
                        <li>Verwendete Funktionen</li>
                      </ul>
                    </section>

                    <section>
                      <h2 className="text-xl font-semibold mb-3">4. Zwecke der Datenverarbeitung</h2>
                      <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                        <li><strong>Vertragserfüllung:</strong> Bereitstellung der Praxisverwaltungssoftware</li>
                        <li><strong>Kundenservice:</strong> Support und technische Hilfestellung</li>
                        <li><strong>Abrechnung:</strong> Verarbeitung von Zahlungen und Rechnungsstellung</li>
                        <li><strong>Sicherheit:</strong> Schutz vor Missbrauch und Betrug</li>
                        <li><strong>Verbesserung:</strong> Weiterentwicklung unserer Dienste</li>
                      </ul>
                    </section>

                    <section>
                      <h2 className="text-xl font-semibold mb-3">5. Speicherdauer</h2>
                      <div className="space-y-3">
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <h4 className="font-medium mb-1">Kontodaten</h4>
                          <p className="text-sm text-muted-foreground">Bis zur Löschung des Kontos oder 3 Jahre nach Vertragsende</p>
                        </div>
                        
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <h4 className="font-medium mb-1">Patientendaten</h4>
                          <p className="text-sm text-muted-foreground">10 Jahre (gesetzliche Aufbewahrungspflicht für Praxen)</p>
                        </div>
                        
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <h4 className="font-medium mb-1">Abrechnungsdaten</h4>
                          <p className="text-sm text-muted-foreground">10 Jahre (steuerrechtliche Aufbewahrungspflicht)</p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h2 className="text-xl font-semibold mb-3">6. Datensicherheit</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border border-border rounded-lg">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-primary" />
                            Verschlüsselung
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Alle Daten werden mit AES-256 verschlüsselt gespeichert und übertragen.
                          </p>
                        </div>
                        
                        <div className="p-4 border border-border rounded-lg">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary" />
                            Server-Standort
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Alle Server befinden sich in Deutschland und unterliegen der DSGVO.
                          </p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h2 className="text-xl font-semibold mb-3">7. Cookies und Tracking</h2>
                      <p className="text-muted-foreground leading-relaxed">
                        Wir verwenden nur technisch notwendige Cookies für die Funktionalität der Anwendung. 
                        Marketing- oder Tracking-Cookies werden nicht eingesetzt. Sie können Cookies in 
                        Ihren Browsereinstellungen verwalten.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-semibold mb-3">8. Kontakt und Beschwerden</h2>
                      <p className="text-muted-foreground leading-relaxed">
                        Bei Fragen zum Datenschutz oder zur Ausübung Ihrer Rechte kontaktieren Sie uns unter 
                        <a href="mailto:datenschutz@praxisflow.de" className="text-primary underline">datenschutz@praxisflow.de</a>.
                        Sie haben zudem das Recht, sich bei der zuständigen Datenschutzaufsichtsbehörde zu beschweren.
                      </p>
                    </section>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}