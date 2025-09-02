import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Eye, Trash2, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-subtle px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </Button>
        </div>

        <Card className="shadow-elegant">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <CardTitle className="text-3xl">Datenschutzerklärung</CardTitle>
                <CardDescription>DSGVO-konforme Datenverarbeitung bei TerminAgent</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Verantwortlicher</h2>
              <p>
                Verantwortlich für die Datenverarbeitung ist der jeweilige Praxisinhaber, 
                der unsere AI-Terminbuchungsdienstleistung nutzt.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Erhobene Daten</h2>
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">Wir verarbeiten nur notwendige Daten:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Name und Kontaktdaten für Terminbuchungen</li>
                  <li>Terminwunsch und Art der Behandlung</li>
                  <li>Telefonnummer für Terminbestätigungen</li>
                  <li>AI-Gesprächsprotokolle zur Qualitätssicherung</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Rechtsgrundlage</h2>
              <p>
                Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) 
                und Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Ihre Rechte</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Eye className="w-5 h-5 text-primary" />
                    <h3 className="font-medium">Auskunftsrecht</h3>
                  </div>
                  <p className="text-sm">Sie können jederzeit Auskunft über Ihre gespeicherten Daten verlangen.</p>
                </div>
                
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Trash2 className="w-5 h-5 text-primary" />
                    <h3 className="font-medium">Löschung</h3>
                  </div>
                  <p className="text-sm">Sie können die Löschung Ihrer Daten beantragen.</p>
                </div>
                
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Download className="w-5 h-5 text-primary" />
                    <h3 className="font-medium">Datenportabilität</h3>
                  </div>
                  <p className="text-sm">Sie können Ihre Daten in maschinenlesbarer Form erhalten.</p>
                </div>
                
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-5 h-5 text-primary" />
                    <h3 className="font-medium">Widerspruch</h3>
                  </div>
                  <p className="text-sm">Sie können der Verarbeitung Ihrer Daten widersprechen.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Datensicherheit</h2>
              <div className="bg-muted p-4 rounded-lg">
                <ul className="list-disc list-inside space-y-1">
                  <li>Ende-zu-Ende-Verschlüsselung aller Datenübertragungen</li>
                  <li>Sichere Speicherung in EU-Rechenzentren</li>
                  <li>Regelmäßige Sicherheitsupdates und -audits</li>
                  <li>Zugriffskontrolle und Protokollierung</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Speicherdauer</h2>
              <p>
                Patientendaten werden standardmäßig 10 Jahre gespeichert (gemäß medizinischer Aufbewahrungspflicht). 
                AI-Gesprächsprotokolle werden nach 2 Jahren automatisch gelöscht, 
                sofern keine längere Aufbewahrung gesetzlich erforderlich ist.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Internationale Datenübertragung</h2>
              <p>
                Für die AI-Funktionalität nutzen wir OpenAI (USA). Die Datenübertragung erfolgt 
                auf Grundlage von Standardvertragsklauseln und angemessenen Schutzmaßnahmen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Kontakt</h2>
              <p>
                Bei Fragen zum Datenschutz wenden Sie sich bitte an die jeweilige Praxis, 
                die unsere Dienstleistung nutzt, oder an unseren Datenschutzbeauftragten.
              </p>
            </section>

            <section className="bg-primary/10 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-3">Einverständniserklärung DSGVO</h2>
              <p className="mb-3">
                Mit der Nutzung unseres AI-Terminbuchungsservices erklären Sie sich einverstanden mit:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Der Verarbeitung Ihrer Daten gemäß dieser Datenschutzerklärung</li>
                <li>Der Speicherung Ihrer Terminbuchungsdaten</li>
                <li>Der Analyse von Gesprächsprotokollen zur Qualitätssicherung</li>
                <li>Der Nutzung von AI-Services (OpenAI) zur Terminbuchung</li>
              </ul>
              <p className="mt-3 text-sm text-muted-foreground">
                Diese Einwilligung können Sie jederzeit widerrufen.
              </p>
            </section>

            <div className="text-sm text-muted-foreground mt-8">
              <p>Stand: {new Date().toLocaleDateString('de-DE')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}