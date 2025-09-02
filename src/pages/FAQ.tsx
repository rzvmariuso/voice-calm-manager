import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  HelpCircle, 
  Phone, 
  Bot, 
  Calendar, 
  Users, 
  Settings,
  CheckCircle,
  PlayCircle,
  MessageSquare,
  Zap,
  Shield
} from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqData = [
  {
    id: "getting-started",
    title: "Erste Schritte",
    icon: PlayCircle,
    color: "text-green-600",
    questions: [
      {
        question: "Wie richte ich meine Praxis ein?",
        answer: "Gehen Sie zu 'Einstellungen' → 'Praxis' und geben Sie Ihre Praxisdaten ein: Name, Adresse, Telefon, E-Mail und Öffnungszeiten. Diese Informationen werden vom KI-Agent verwendet, um Patienten korrekt zu informieren."
      },
      {
        question: "Wie aktiviere ich den KI-Agent?",
        answer: "Navigieren Sie zu 'KI-Agent' und klicken Sie auf 'Starten'. Stellen Sie sicher, dass Ihr AI-Prompt konfiguriert ist und Sie eine gültige Telefonnummer eingerichtet haben."
      },
      {
        question: "Welche Daten sind für die ersten Termine nötig?",
        answer: "Für jeden Termin benötigen Sie: Patientenname, Telefonnummer, gewünschtes Datum und Uhrzeit, sowie die Art der Behandlung. Optional können Sie Notizen hinzufügen."
      }
    ]
  },
  {
    id: "ai-agent",
    title: "KI-Agent & Terminbuchung",
    icon: Bot,
    color: "text-blue-600",
    questions: [
      {
        question: "Wie funktioniert die automatische Terminbuchung?",
        answer: "Der KI-Agent nimmt Anrufe entgegen, führt natürliche Gespräche mit Patienten und bucht Termine automatisch. Er fragt nach Name, Telefonnummer, gewünschtem Termin und Behandlungsart."
      },
      {
        question: "Kann ich den KI-Agent personalisieren?",
        answer: "Ja! Unter 'KI-Agent' können Sie den Systemprompt anpassen. Definieren Sie Persönlichkeit, Gesprächsstil, verfügbare Behandlungen und Preise nach Ihren Wünschen."
      },
      {
        question: "Was passiert mit erfolgreichen Buchungen?",
        answer: "Erfolgreich gebuchte Termine erscheinen automatisch in Ihrer Terminliste mit dem 'KI' Badge. Sie können diese wie normale Termine verwalten, bestätigen oder bearbeiten."
      },
      {
        question: "Wie teste ich die AI-Booking Funktion?",
        answer: "Nutzen Sie die Test-Buttons auf der KI-Agent Seite. Sie können sowohl erfolgreiche als auch fehlgeschlagene Buchungen simulieren, um zu sehen, wie das System reagiert."
      }
    ]
  },
  {
    id: "appointments",
    title: "Terminverwaltung",
    icon: Calendar,
    color: "text-purple-600",
    questions: [
      {
        question: "Wie bestätige ich Termine?",
        answer: "Termine mit Status 'Wartend' können Sie durch Klick auf 'Bestätigen' bestätigen. Der Status ändert sich dann zu 'Bestätigt' und der Patient wird informiert (falls Benachrichtigungen aktiviert sind)."
      },
      {
        question: "Kann ich Termine bearbeiten?",
        answer: "Ja, klicken Sie auf das Bearbeiten-Symbol (Stift) neben einem Termin. Sie können Datum, Uhrzeit, Service und Notizen ändern."
      },
      {
        question: "Wie erkenne ich KI-gebuchte Termine?",
        answer: "KI-gebuchte Termine haben ein spezielles 'KI' Badge und sind in den Statistiken als 'KI-Buchungen' aufgeführt. Sie werden genauso behandelt wie manuell eingetragene Termine."
      },
      {
        question: "Was bedeuten die verschiedenen Status?",
        answer: "• 'Bestätigt' (grün): Termin ist bestätigt und findet statt\n• 'Wartend' (gelb): Termin wurde gebucht, aber noch nicht bestätigt\n• KI-Badge: Termin wurde automatisch durch den KI-Agent gebucht"
      }
    ]
  },
  {
    id: "automation",
    title: "Automation & n8n",
    icon: Zap,
    color: "text-orange-600",
    questions: [
      {
        question: "Was ist n8n Automation?",
        answer: "n8n ist ein Workflow-Automatisierungs-Tool. Sie können Workflows erstellen, die automatisch ausgelöst werden, wenn neue Termine gebucht werden - z.B. SMS-Erinnerungen oder E-Mail-Bestätigungen."
      },
      {
        question: "Wie richte ich SMS-Erinnerungen ein?",
        answer: "Laden Sie den bereitgestellten n8n-Workflow herunter, importieren Sie ihn in Ihre n8n-Instanz, konfigurieren Sie Ihre Twilio-Credentials und tragen Sie die Webhook-URL unter 'Automation' ein."
      },
      {
        question: "Welche Automatisierungen sind möglich?",
        answer: "• SMS-Erinnerungen 24h vor Terminen\n• E-Mail-Bestätigungen\n• Google Calendar Sync\n• Slack/Teams Benachrichtigungen\n• CRM-Updates\n• Automatische Rechnungserstellung"
      },
      {
        question: "Wie teste ich meine Webhooks?",
        answer: "Verwenden Sie den 'Test Webhook' Button unter 'Automation'. Dies sendet eine Test-Nachricht an Ihre n8n-Instanz, um zu überprüfen, ob die Verbindung funktioniert."
      }
    ]
  },
  {
    id: "patients",
    title: "Patientenverwaltung",
    icon: Users,
    color: "text-teal-600", 
    questions: [
      {
        question: "Werden Patientendaten automatisch erstellt?",
        answer: "Ja, wenn der KI-Agent erfolgreich einen Termin bucht, wird automatisch ein Patientendatensatz mit den angegebenen Informationen erstellt."
      },
      {
        question: "Wie lange werden Patientendaten gespeichert?",
        answer: "Standardmäßig 10 Jahre ab Erstellung, entsprechend den gesetzlichen Aufbewahrungsfristen. Dies können Sie in den Datenschutz-Einstellungen anpassen."
      },
      {
        question: "Kann ich Patientendaten exportieren?",
        answer: "Ja, über die DSGVO-Funktionen können Sie Patientendaten exportieren oder Löschanfragen bearbeiten. Dies ist wichtig für die Datenschutz-Compliance."
      }
    ]
  },
  {
    id: "security",
    title: "Sicherheit & DSGVO",
    icon: Shield,
    color: "text-red-600",
    questions: [
      {
        question: "Ist das System DSGVO-konform?",
        answer: "Ja, die Anwendung ist für DSGVO-Compliance ausgelegt. Alle Daten werden verschlüsselt gespeichert, Sie können Einverständniserklärungen verwalten und Betroffenenrechte umsetzen."
      },
      {
        question: "Wo werden meine Daten gespeichert?",
        answer: "Alle Daten werden in Supabase-Rechenzentren in der EU gespeichert (Frankfurt, Deutschland). Die Übertragung erfolgt verschlüsselt über HTTPS/TLS."
      },
      {
        question: "Wie sichere ich meine Telefonnummer?",
        answer: "Verwenden Sie starke Passwörter für alle Accounts, aktivieren Sie 2FA wo möglich, und teilen Sie API-Keys niemals öffentlich. Alle Geheimnisse werden verschlüsselt in Supabase gespeichert."
      },
      {
        question: "Was passiert bei einem Datenschutz-Antrag?",
        answer: "Unter 'Einstellungen' → 'DSGVO' können Sie Auskunfts-, Lösch- und Berichtigungsanträge bearbeiten. Das System protokolliert alle Aktionen für die Compliance-Dokumentation."
      }
    ]
  }
]

export default function FAQ() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 p-6 bg-background">
          <div className="flex items-center gap-4 mb-8">
            <SidebarTrigger />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                FAQ & Tutorials
              </h1>
              <p className="text-muted-foreground">
                Häufig gestellte Fragen und Anleitungen für TerminAgent
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{faqData.reduce((acc, section) => acc + section.questions.length, 0)}</p>
                    <p className="text-sm text-muted-foreground">FAQ Einträge</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-secondary rounded-lg flex items-center justify-center">
                    <PlayCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{faqData.length}</p>
                    <p className="text-sm text-muted-foreground">Kategorien</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-accent rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">24/7</p>
                    <p className="text-sm text-muted-foreground">Verfügbar</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Sections */}
          <div className="space-y-6">
            {faqData.map((section, sectionIndex) => (
              <Card key={section.id} className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-primary`}>
                      <section.icon className="w-4 h-4 text-white" />
                    </div>
                    <span>{section.title}</span>
                    <Badge variant="outline" className="ml-auto">
                      {section.questions.length} Fragen
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {section.questions.map((item, index) => (
                      <AccordionItem key={index} value={`${section.id}-${index}`}>
                        <AccordionTrigger className="text-left hover:text-primary">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Support */}
          <Card className="shadow-soft mt-8 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Weitere Fragen?</h3>
                <p className="text-muted-foreground mb-4">
                  Wenn Sie Ihre Frage hier nicht finden, kontaktieren Sie unser Support-Team
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>Support verfügbar Mo-Fr 9:00-17:00</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  )
}