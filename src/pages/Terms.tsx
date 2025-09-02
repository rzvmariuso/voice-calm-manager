import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Terms() {
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
                  Allgemeine Geschäftsbedingungen
                </h1>
                <p className="text-muted-foreground">
                  Rechtliche Bedingungen für die Nutzung von PraxisFlow
                </p>
              </div>
            </div>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  AGB - Stand: Januar 2024
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                <div className="space-y-6">
                  <section>
                    <h2 className="text-xl font-semibold mb-3">§ 1 Geltungsbereich</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen PraxisFlow GmbH 
                      (nachfolgend "Anbieter") und Kunden über die Nutzung der webbasierten Praxisverwaltungssoftware 
                      PraxisFlow (nachfolgend "Software" oder "Dienst").
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">§ 2 Leistungsbeschreibung</h2>
                    <div className="space-y-3">
                      <p className="text-muted-foreground leading-relaxed">
                        Der Anbieter stellt eine cloudbasierte Software zur Praxisverwaltung zur Verfügung, die folgende Funktionen umfasst:
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                        <li>Terminverwaltung und Online-Buchungssystem</li>
                        <li>Patientenverwaltung mit DSGVO-konformer Datenspeicherung</li>
                        <li>KI-gestützte Terminbuchung (je nach Tarif)</li>
                        <li>Praxisorganisation und Verwaltungstools</li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">§ 3 Vertragsschluss</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Der Vertrag kommt durch die Registrierung des Kunden und die Auswahl eines Abonnementplans zustande. 
                      Mit der Registrierung bestätigt der Kunde, dass er diese AGB gelesen und akzeptiert hat.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">§ 4 Preise und Zahlungsbedingungen</h2>
                    <div className="space-y-3">
                      <p className="text-muted-foreground leading-relaxed">
                        Die aktuellen Preise sind auf der Website ersichtlich. Es stehen folgende Tarife zur Verfügung:
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                        <li><strong>Starter:</strong> €29/Monat - Grundfunktionen für kleine Praxen</li>
                        <li><strong>Professional:</strong> €59/Monat - Erweiterte Funktionen inkl. KI-Features</li>
                        <li><strong>Enterprise:</strong> €99/Monat - Vollumfang für große Praxen</li>
                      </ul>
                      <p className="text-muted-foreground leading-relaxed">
                        Alle Preise verstehen sich zzgl. der gesetzlichen Mehrwertsteuer. Die Abrechnung erfolgt 
                        im Voraus per Kreditkarte oder SEPA-Lastschrift.
                      </p>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">§ 5 Kündigung</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Beide Parteien können den Vertrag mit einer Frist von 30 Tagen zum Monatsende kündigen. 
                      Die Kündigung muss schriftlich oder über die Plattform erfolgen. Bei jährlicher Zahlung 
                      gilt eine Kündigungsfrist von 3 Monaten zum Jahresende.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">§ 6 Datenschutz</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Der Anbieter verpflichtet sich zur Einhaltung aller geltenden Datenschutzbestimmungen, 
                      insbesondere der DSGVO. Näheres regelt die Datenschutzerklärung, die Bestandteil 
                      dieser AGB ist.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">§ 7 Verfügbarkeit</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Der Anbieter bemüht sich um eine Verfügbarkeit von 99,5% im Jahresmittel. 
                      Wartungsarbeiten werden nach Möglichkeit außerhalb der Geschäftszeiten durchgeführt 
                      und rechtzeitig angekündigt.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">§ 8 Haftung</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Die Haftung des Anbieters ist auf Vorsatz und grobe Fahrlässigkeit beschränkt. 
                      Bei leichter Fahrlässigkeit haftet der Anbieter nur bei Verletzung wesentlicher 
                      Vertragspflichten und nur in Höhe des vorhersehbaren, typischen Schadens.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">§ 9 Schlussbestimmungen</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Es gilt deutsches Recht. Gerichtsstand ist Berlin. Sollten einzelne Bestimmungen 
                      dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
                    </p>
                  </section>

                  <div className="mt-8 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>PraxisFlow GmbH</strong><br />
                      Musterstraße 123<br />
                      10115 Berlin<br />
                      Deutschland<br />
                      <br />
                      E-Mail: legal@praxisflow.de<br />
                      Telefon: +49 30 12345678
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}