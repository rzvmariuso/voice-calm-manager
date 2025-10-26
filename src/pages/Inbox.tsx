import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Mail, 
  Phone,
  Send,
  Search,
  Star,
  Archive,
  Trash2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  from: string;
  channel: 'sms' | 'whatsapp' | 'email' | 'telegram';
  content: string;
  timestamp: string;
  read: boolean;
  starred: boolean;
}

export default function Inbox() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const messages: Message[] = [
    {
      id: '1',
      from: 'Max Mustermann',
      channel: 'whatsapp',
      content: 'Hallo, ich würde gerne einen Termin vereinbaren für nächste Woche.',
      timestamp: '10:30',
      read: false,
      starred: true
    },
    {
      id: '2',
      from: 'Anna Schmidt',
      channel: 'sms',
      content: 'Kann ich meinen Termin von morgen auf übermorgen verschieben?',
      timestamp: '09:15',
      read: true,
      starred: false
    },
    {
      id: '3',
      from: 'Thomas Weber',
      channel: 'email',
      content: 'Vielen Dank für den gestrigen Termin. Ich wollte mich noch einmal für die freundliche Beratung bedanken.',
      timestamp: 'Gestern',
      read: true,
      starred: false
    },
    {
      id: '4',
      from: 'Lisa Müller',
      channel: 'telegram',
      content: 'Ich benötige ein Rezept für meine Medikamente. Wann kann ich das abholen?',
      timestamp: 'Gestern',
      read: false,
      starred: false
    }
  ];

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return <MessageSquare className="w-4 h-4 text-green-600" />;
      case 'sms': return <Phone className="w-4 h-4 text-blue-600" />;
      case 'email': return <Mail className="w-4 h-4 text-red-600" />;
      case 'telegram': return <Send className="w-4 h-4 text-sky-600" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getChannelLabel = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return 'WhatsApp';
      case 'sms': return 'SMS';
      case 'email': return 'E-Mail';
      case 'telegram': return 'Telegram';
      default: return channel;
    }
  };

  const handleSendReply = () => {
    if (!replyContent.trim()) return;
    
    // Here you would send the reply via the appropriate channel
    console.log('Sending reply:', replyContent);
    setReplyContent("");
  };

  const filteredMessages = messages.filter(msg =>
    msg.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageLayout title="Unified Inbox">
      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        {/* Messages List */}
        <Card className="lg:col-span-1">
          <CardContent className="p-0">
            <div className="p-4 border-b space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Nachrichten durchsuchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="all">Alle</TabsTrigger>
                  <TabsTrigger value="unread">
                    Ungelesen
                    <Badge variant="secondary" className="ml-2">
                      {messages.filter(m => !m.read).length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="starred">
                    <Star className="w-4 h-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <ScrollArea className="h-[calc(100vh-20rem)]">
              <div className="divide-y">
                {filteredMessages.map((message) => (
                  <button
                    key={message.id}
                    onClick={() => setSelectedMessage(message)}
                    className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                      selectedMessage?.id === message.id ? 'bg-muted' : ''
                    } ${!message.read ? 'border-l-4 border-l-primary' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>
                          {message.from.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-medium truncate ${!message.read ? 'font-bold' : ''}`}>
                            {message.from}
                          </span>
                          <div className="flex items-center gap-2">
                            {message.starred && (
                              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {message.timestamp}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          {getChannelIcon(message.channel)}
                          <span className="text-xs text-muted-foreground">
                            {getChannelLabel(message.channel)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Message Detail */}
        <Card className="lg:col-span-2">
          <CardContent className="p-0 h-full flex flex-col">
            {selectedMessage ? (
              <>
                {/* Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback>
                          {selectedMessage.from.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{selectedMessage.from}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {getChannelIcon(selectedMessage.channel)}
                          <span>{getChannelLabel(selectedMessage.channel)}</span>
                          <span>•</span>
                          <span>{selectedMessage.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Star className={`w-4 h-4 ${selectedMessage.starred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Archive className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                    </div>
                  </div>
                </ScrollArea>

                {/* Reply Box */}
                <div className="p-4 border-t">
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Ihre Antwort..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={3}
                    />
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        Antwort wird über {getChannelLabel(selectedMessage.channel)} gesendet
                      </div>
                      <Button onClick={handleSendReply} className="bg-gradient-primary">
                        <Send className="w-4 h-4 mr-2" />
                        Senden
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Wählen Sie eine Nachricht aus, um sie anzuzeigen</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
