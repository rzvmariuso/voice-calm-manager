import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, Loader2, Sparkles, Calendar, Users, BarChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_ACTIONS = [
  { icon: Calendar, label: "Termine heute", prompt: "Zeige mir alle Termine für heute" },
  { icon: Users, label: "Neue Patienten", prompt: "Wie viele neue Patienten diese Woche?" },
  { icon: BarChart, label: "Statistiken", prompt: "Gib mir eine Übersicht der wichtigsten Kennzahlen" },
];

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hallo! Ich bin Ihr KI-Assistent für VoxCal. Ich kann Ihnen helfen bei:\n\n• Terminsuche und -planung\n• Patienteninformationen\n• Statistiken und Auswertungen\n• Allgemeine Fragen zur Praxisverwaltung\n\nWie kann ich Ihnen heute helfen?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSend = async (prompt?: string) => {
    const messageText = prompt || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Hier würde die Integration mit Lovable AI Gateway erfolgen
      // Für jetzt simulieren wir eine Antwort
      await new Promise(resolve => setTimeout(resolve, 1000));

      const assistantMessage: Message = {
        role: 'assistant',
        content: getSimulatedResponse(messageText),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die KI-Anfrage konnte nicht verarbeitet werden.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSimulatedResponse = (prompt: string): string => {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('termin') && lowerPrompt.includes('heute')) {
      return "Ich kann Ihnen die heutigen Termine zeigen. Bitte navigieren Sie zum Kalender oder geben Sie 'Kalender öffnen' ein, um alle Termine für heute anzusehen.";
    }
    
    if (lowerPrompt.includes('patient')) {
      return "Für Patienteninformationen können Sie:\n• Die Patientenliste durchsuchen\n• Einen bestimmten Patienten nach Namen suchen\n• Neue Patienten anlegen\n\nMöchten Sie die Patientenliste öffnen?";
    }
    
    if (lowerPrompt.includes('statistik') || lowerPrompt.includes('kennzahl')) {
      return "Die wichtigsten Kennzahlen finden Sie auf dem Dashboard:\n• Gesamtzahl der Patienten\n• Termine heute und diese Woche\n• Auslastungsstatistiken\n\nFür detaillierte Analysen empfehle ich die Analytics-Seite.";
    }

    return "Ich verstehe Ihre Anfrage und arbeite daran, Ihnen zu helfen. Diese Funktion wird noch erweitert, um noch bessere Antworten zu geben. Versuchen Sie es mit konkreten Fragen zu Terminen, Patienten oder Statistiken.";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                KI-Assistent
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="w-3 h-3" />
                  Beta
                </Badge>
              </CardTitle>
              <CardDescription>Intelligente Praxisunterstützung</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Quick Actions */}
        <div className="p-4 border-b bg-muted/30">
          <p className="text-sm text-muted-foreground mb-3">Schnellaktionen:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((action, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => handleSend(action.prompt)}
                disabled={isLoading}
              >
                <action.icon className="w-3.5 h-3.5" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.role === 'user' 
                      ? 'text-primary-foreground/70' 
                      : 'text-muted-foreground'
                  }`}>
                    {message.timestamp.toLocaleTimeString('de-DE', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Stellen Sie eine Frage..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Powered by Lovable AI • Ihre Daten bleiben vertraulich
          </p>
        </div>
      </CardContent>
    </Card>
  );
}