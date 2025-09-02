import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, Phone, Calendar } from "lucide-react"

const mockAppointments = [
  {
    id: "1",
    patient: "Anna Müller",
    time: "09:00",
    date: "Heute",
    service: "Massage",
    status: "confirmed",
    phone: "+49 123 456789",
    avatar: ""
  },
  {
    id: "2", 
    patient: "Michael Schmidt",
    time: "10:30",
    date: "Heute",
    service: "Physiotherapie",
    status: "pending",
    phone: "+49 987 654321",
    avatar: ""
  },
  {
    id: "3",
    patient: "Sarah Wagner",
    time: "14:00", 
    date: "Morgen",
    service: "Zahnreinigung",
    status: "confirmed",
    phone: "+49 555 123456",
    avatar: ""
  },
  {
    id: "4",
    patient: "Thomas Bauer",
    time: "16:15",
    date: "Morgen", 
    service: "Massage",
    status: "ai_booked",
    phone: "+49 444 987654",
    avatar: ""
  }
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "confirmed":
      return <Badge variant="default" className="bg-success text-success-foreground">Bestätigt</Badge>
    case "pending":
      return <Badge variant="secondary" className="bg-warning text-warning-foreground">Wartend</Badge>
    case "ai_booked":
      return <Badge variant="outline" className="border-primary text-primary">KI-Buchung</Badge>
    default:
      return <Badge variant="outline">Unbekannt</Badge>
  }
}

export function RecentAppointments() {
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Aktuelle Termine
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockAppointments.map((appointment) => (
            <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={appointment.avatar} />
                  <AvatarFallback className="bg-gradient-primary text-white">
                    {appointment.patient.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium text-foreground">{appointment.patient}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {appointment.date}, {appointment.time}
                    <span className="text-muted-foreground">•</span>
                    {appointment.service}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Phone className="w-3 h-3" />
                    {appointment.phone}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {getStatusBadge(appointment.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}