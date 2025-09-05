import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Clock, Bot, Phone } from "lucide-react"
import { supabase } from "@/integrations/supabase/client";
import { usePractice } from "@/hooks/usePractice";
import { nowInBerlin } from "@/lib/dateUtils";

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  service: string;
  status: string;
  ai_booked: boolean;
  patients: {
    first_name: string;
    last_name: string;
  };
}

const getStatusBadge = (status: string, aiBooked: boolean) => {
  if (aiBooked) {
    return (
      <Badge variant="outline" className="border-primary text-primary">
        <Bot className="w-3 h-3 mr-1" />
        AI-Buchung
      </Badge>
    );
  }
  
  switch (status) {
    case "confirmed":
      return <Badge variant="default" className="bg-success text-success-foreground">Bestätigt</Badge>
    case "pending":
      return <Badge variant="secondary" className="bg-warning text-warning-foreground">Wartend</Badge>
    case "cancelled":
      return <Badge variant="destructive">Abgesagt</Badge>
    case "completed":
      return <Badge variant="outline">Abgeschlossen</Badge>
    default:
      return <Badge variant="outline">Unbekannt</Badge>
  }
}

export function RecentAppointments() {
  const { practice } = usePractice();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!practice) return;

    const fetchRecentAppointments = async () => {
      try {
        const today = nowInBerlin();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

        const { data, error } = await supabase
          .from('appointments')
          .select(`
            id,
            appointment_date,
            appointment_time,
            service,
            status,
            ai_booked,
            patients!inner (
              first_name,
              last_name
            )
          `)
          .eq('practice_id', practice.id)
          .gte('appointment_date', today.toISOString().split('T')[0])
          .lte('appointment_date', nextWeek.toISOString().split('T')[0])
          .order('appointment_date', { ascending: true })
          .order('appointment_time', { ascending: true })
          .limit(5);

        if (error) {
          console.error('Error fetching appointments:', error);
        } else {
          setAppointments(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentAppointments();
  }, [practice]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = nowInBerlin();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Heute";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Morgen";
    } else {
      return date.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
    }
  };

  return (
    <Card className="shadow-soft card-interactive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary animate-bounce-gentle" />
          Aktuelle Termine
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground loading-dots">Lade Termine</span>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50 animate-bounce-gentle" />
            <p>Keine anstehenden Termine</p>
            <p className="text-xs mt-1 opacity-70">Die nächsten Termine erscheinen hier</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment, index) => (
              <div 
                key={appointment.id} 
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 hover:shadow-soft transition-all duration-300 animate-fade-in hover:scale-[1.02] cursor-pointer group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 group-hover:scale-110 transition-transform duration-200">
                    <AvatarFallback className="bg-gradient-primary text-white">
                      {appointment.patients.first_name[0]}{appointment.patients.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium text-foreground group-hover:text-primary transition-colors duration-200">
                      {appointment.patients.first_name} {appointment.patients.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {formatDate(appointment.appointment_date)}, {appointment.appointment_time.slice(0, 5)}
                      <span className="text-muted-foreground">•</span>
                      <span className="group-hover:text-primary/80 transition-colors duration-200">
                        {appointment.service}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(appointment.status, appointment.ai_booked)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}