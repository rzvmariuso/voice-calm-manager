import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, ArrowLeft, Mail, Phone, Globe, FileText } from "lucide-react";
import { Link } from "react-router-dom";

export default function Imprint() {
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
                  Impressum
                </h1>
                <p className="text-muted-foreground">
                  Rechtliche Angaben gemäß § 5 TMG
                </p>
              </div>
            </div>

            <div className="grid gap-6">
              {/* Hauptangaben */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-primary" />
                    Anbieterinformationen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Unternehmen</h3>
                        <div className="text-muted-foreground space-y-1">
                          <p><strong>PraxisFlow GmbH</strong></p>
                          <p>Musterstraße 123</p>
                          <p>10115 Berlin</p>
                          <p>Deutschland</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Kontakt</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-4 h-4 text-primary" />
                            <span>+49 30 12345678</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="w-4 h-4 text-primary" />
                            <a href="mailto:info@praxisflow.de" className="text-primary hover:underline">
                              info@praxisflow.de
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Globe className="w-4 h-4 text-primary" />
                            <a href="https://praxisflow.de" className="text-primary hover:underline">
                              www.praxisflow.de
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Geschäftsführung</h3>
                        <div className="text-muted-foreground">
                          <p>Max Mustermann</p>
                          <p>Maria Musterfrau</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Registereintrag</h3>
                        <div className="text-muted-foreground space-y-1">
                          <p>Amtsgericht Berlin-Charlottenburg</p>
                          <p>HRB 123456 B</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Umsatzsteuer-ID</h3>
                        <div className="text-muted-foreground">
                          <p>DE123456789</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rechtliche Hinweise */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Rechtliche Hinweise
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <section>
                    <h3 className="text-lg font-semibold mb-3">Haftungsausschluss</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Haftung für Inhalte</h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, 
                          Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. 
                          Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten 
                          nach den allgemeinen Gesetzen verantwortlich.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Haftung für Links</h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen 
                          Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. 
                          Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber 
                          der Seiten verantwortlich.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Urheberrecht</h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen 
                          dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art 
                          der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen 
                          Zustimmung des jeweiligen Autors bzw. Erstellers.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold mb-3">Streitschlichtung</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
                      Verbraucherschlichtungsstelle teilzunehmen.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold mb-3">Berufsrechtliche Angaben</h3>
                    <div className="text-muted-foreground text-sm space-y-2">
                      <p><strong>Berufsbezeichnung:</strong> Software-Dienstleister</p>
                      <p><strong>Zuständige Aufsichtsbehörde:</strong> Gewerbeaufsichtsamt Berlin</p>
                      <p><strong>Berufsrechtliche Regelungen:</strong> Gewerbeordnung (GewO)</p>
                    </div>
                  </section>
                </CardContent>
              </Card>

              {/* Support-Kontakt */}
              <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Mail className="w-5 h-5" />
                    Support und Kontakt
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-background/50 rounded-lg">
                      <Mail className="w-8 h-8 text-primary mx-auto mb-2" />
                      <h4 className="font-medium mb-1">Allgemeine Anfragen</h4>
                      <a href="mailto:info@praxisflow.de" className="text-sm text-primary hover:underline">
                        info@praxisflow.de
                      </a>
                    </div>
                    
                    <div className="text-center p-4 bg-background/50 rounded-lg">
                      <Phone className="w-8 h-8 text-primary mx-auto mb-2" />
                      <h4 className="font-medium mb-1">Technischer Support</h4>
                      <a href="mailto:support@praxisflow.de" className="text-sm text-primary hover:underline">
                        support@praxisflow.de
                      </a>
                    </div>
                    
                    <div className="text-center p-4 bg-background/50 rounded-lg">
                      <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
                      <h4 className="font-medium mb-1">Rechtliche Fragen</h4>
                      <a href="mailto:legal@praxisflow.de" className="text-sm text-primary hover:underline">
                        legal@praxisflow.de
                      </a>
                    </div>
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