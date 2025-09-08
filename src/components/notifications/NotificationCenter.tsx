import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bell, 
  BellRing, 
  MessageSquare, 
  Mail, 
  Smartphone, 
  Settings, 
  Send,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePractice } from "@/hooks/usePractice";

interface NotificationSettings {
  smsEnabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  reminderHours: number;
  customMessage: string;
}

interface NotificationItem {
  id: string;
  type: 'sms' | 'email' | 'push';
  title: string;
  message: string;
  timestamp: Date;
  status: 'sent' | 'pending' | 'failed';
  appointmentId?: string;
}

export function NotificationCenter() {
  const { toast } = useToast();
  const { practice } = usePractice();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    smsEnabled: true,
    emailEnabled: true,
    pushEnabled: false,
    reminderHours: 24,
    customMessage: "Hallo {patientName}, wir möchten Sie an Ihren Termin am {date} um {time} erinnern. Bei Fragen rufen Sie uns gerne an!"
  });
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Request notification permissions
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        setSettings(prev => ({ ...prev, pushEnabled: permission === 'granted' }));
      });
    }

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('notification-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Simulate loading notifications
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    // Start with empty notifications - real data will be loaded from database
    setNotifications([]);
    setUnreadCount(0);
  };

  const saveSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    localStorage.setItem('notification-settings', JSON.stringify(newSettings));
    toast({
      title: "Einstellungen gespeichert",
      description: "Ihre Benachrichtigungseinstellungen wurden aktualisiert",
    });
  };

  const sendTestNotification = async (type: 'sms' | 'email' | 'push') => {
    try {
      const message = "Dies ist eine Test-Benachrichtigung von Ihrer Praxis-App.";
      
      if (type === 'push' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Test Benachrichtigung', {
          body: message,
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        });
      }

      const newNotification: NotificationItem = {
        id: Date.now().toString(),
        type,
        title: `Test ${type.toUpperCase()}`,
        message,
        timestamp: new Date(),
        status: 'sent'
      };

      setNotifications(prev => [newNotification, ...prev]);
      
      toast({
        title: "Test gesendet",
        description: `Test-${type.toUpperCase()} wurde erfolgreich gesendet`,
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Test-Benachrichtigung konnte nicht gesendet werden",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sms':
        return <Smartphone className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'push':
        return <Bell className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `vor ${minutes} Min`;
    } else if (hours < 24) {
      return `vor ${hours} Std`;
    } else {
      return `vor ${days} Tag${days !== 1 ? 'en' : ''}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification Button with Badge */}
      <div className="flex items-center justify-between">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              {unreadCount > 0 ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Benachrichtigungen</h4>
                <Badge variant="secondary">{notifications.length}</Badge>
              </div>
              
              <div className="max-h-64 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Keine Benachrichtigungen
                  </p>
                ) : (
                  notifications.map((notification) => (
                    <div key={notification.id} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-1">
                        {getTypeIcon(notification.type)}
                        {getStatusIcon(notification.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Settings Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Benachrichtigungseinstellungen
          </CardTitle>
          <CardDescription>
            Konfigurieren Sie, wie und wann Sie benachrichtigt werden möchten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Notifications */}
          <div className="space-y-4">
            <h4 className="font-medium">Benachrichtigungstypen</h4>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                <Label htmlFor="sms-enabled">SMS Erinnerungen</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="sms-enabled"
                  checked={settings.smsEnabled}
                  onCheckedChange={(checked) => 
                    saveSettings({ ...settings, smsEnabled: checked })
                  }
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendTestNotification('sms')}
                  disabled={!settings.smsEnabled}
                >
                  Test
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <Label htmlFor="email-enabled">E-Mail Benachrichtigungen</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="email-enabled"
                  checked={settings.emailEnabled}
                  onCheckedChange={(checked) => 
                    saveSettings({ ...settings, emailEnabled: checked })
                  }
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendTestNotification('email')}
                  disabled={!settings.emailEnabled}
                >
                  Test
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <Label htmlFor="push-enabled">Browser Benachrichtigungen</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="push-enabled"
                  checked={settings.pushEnabled}
                  onCheckedChange={(checked) => {
                    if (checked && 'Notification' in window) {
                      Notification.requestPermission().then(permission => {
                        const enabled = permission === 'granted';
                        saveSettings({ ...settings, pushEnabled: enabled });
                      });
                    } else {
                      saveSettings({ ...settings, pushEnabled: checked });
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendTestNotification('push')}
                  disabled={!settings.pushEnabled}
                >
                  Test
                </Button>
              </div>
            </div>
          </div>

          {/* Reminder Timing */}
          <div className="space-y-3">
            <Label htmlFor="reminder-hours">Erinnerung senden (Stunden vor Termin)</Label>
            <Input
              id="reminder-hours"
              type="number"
              min="1"
              max="168"
              value={settings.reminderHours}
              onChange={(e) => 
                saveSettings({ ...settings, reminderHours: parseInt(e.target.value) || 24 })
              }
            />
          </div>

          {/* Custom Message */}
          <div className="space-y-3">
            <Label htmlFor="custom-message">Nachrichtenvorlage</Label>
            <Textarea
              id="custom-message"
              placeholder="Ihre persönliche Nachrichtenvorlage..."
              value={settings.customMessage}
              onChange={(e) => 
                saveSettings({ ...settings, customMessage: e.target.value })
              }
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Verfügbare Platzhalter: {'{patientName}'}, {'{date}'}, {'{time}'}, {'{service}'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Letzte Benachrichtigungen</CardTitle>
          <CardDescription>Übersicht über gesendete Benachrichtigungen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Noch keine Benachrichtigungen gesendet
              </p>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(notification.type)}
                    <div>
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(notification.status)}
                    <span className="text-sm text-muted-foreground">
                      {formatTimestamp(notification.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}