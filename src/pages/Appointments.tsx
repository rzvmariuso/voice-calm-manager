import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Phone, 
  Edit3, 
  Trash2,
  Bot,
  CheckCircle,
  AlertCircle,
  Users
} from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

const mockAppointments = [
  {
    id: "1",
    patient: {
      name: "Anna Müller",
      phone: "+49 123 456789",
      email: "anna.muller@email.de",
      avatar: ""
    },
    date: "2024-01-15",
    time: "09:00",
    duration: 60,
    service: "Ganzkörper-Massage",
    status: "confirmed",
    source: "ai",
    notes: "Rückenschmerzen seit 2 Wochen",
    price: 85.00
  },
  {
    id: "2", 
    patient: {
      name: "Michael Schmidt",
      phone: "+49 987 654321",
      email: "m.schmidt@email.de",
      avatar: ""
    },
    date: "2024-01-15",
    time: "10:30",
    duration: 45,
    service: "Physiotherapie",
    status: "pending",
    source: "manual",
    notes: "Nachbehandlung Knie-OP",
    price: 65.00
  },
  {
    id: "3",
    patient: {
      name: "Sarah Wagner",
      phone: "+49 555 123456",
      email: "s.wagner@email.de",
      avatar: ""
    },
    date: "2024-01-16",
    time: "14:00",
    duration: 30,
    service: "Prophylaxe",
    status: "confirmed",
    source: "ai",
    notes: "Routinetermin",
    price: 45.00
  },
  {
    id: "4",
    patient: {
      name: "Thomas Bauer",
      phone: "+49 444 987654", 
      email: "t.bauer@email.de",
      avatar: ""
    },
    date: "2024-01-16",
    time: "16:15",
    duration: 60,
    service: "Hot Stone Massage",
    status: "ai_booked",
    source: "ai",
    notes: "Ersttermin - telefonisch gebucht",
    price: 95.00
  },
  {
    id: "5",
    patient: {
      name: "Lisa Hoffman",
      phone: "+49 111 222333",
      email: "l.hoffman@email.de", 
      avatar: ""
    },
    date: "2024-01-17",
    time: "11:00",
    duration: 90,
    service: "Wellness Paket",
    status: "confirmed",
    source: "ai",
    notes: "Geburtstagsgeschenk",
    price: 120.00
  }
]

export default function Appointments() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const { toast } = useToast()

  const getStatusBadge = (status: string, source: string) => {
    switch (status) {
      case "confirmed":
        return (
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-success text-success-foreground">
              <CheckCircle className="w-3 h-3 mr-1" />
              Bestätigt
            </Badge>
            {source === "ai" && (
              <Badge variant="outline" className="border-primary text-primary text-xs">
                <Bot className="w-3 h-3 mr-1" />
                KI
              </Badge>
            )}
          </div>
        )
      case "pending":
        return (
          <Badge variant="secondary" className="bg-warning text-warning-foreground">
            <Clock className="w-3 h-3 mr-1" />
            Wartend
          </Badge>
        )
      case "ai_booked":
        return (
          <Badge variant="outline" className="border-primary text-primary">
            <Bot className="w-3 h-3 mr-1" />
            KI-Buchung
          </Badge>
        )
      default:
        return <Badge variant="outline">Unbekannt</Badge>
    }
  }

  const filteredAppointments = mockAppointments.filter(appointment => {
    const matchesSearch = appointment.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.service.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || appointment.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const handleConfirm = (id: string) => {
    toast({
      title: "Termin bestätigt",
      description: "Der Termin wurde erfolgreich bestätigt.",
    })
  }

  const handleCancel = (id: string) => {
    toast({
      title: "Termin storniert", 
      description: "Der Termin wurde storniert.",
      variant: "destructive"
    })
  }

  const stats = {
    total: mockAppointments.length,
    confirmed: mockAppointments.filter(a => a.status === "confirmed").length,
    pending: mockAppointments.filter(a => a.status === "pending").length,
    aiBooked: mockAppointments.filter(a => a.source === "ai").length
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 p-6 bg-background">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                  Termine
                </h1>
                <p className="text-muted-foreground">
                  Verwalten Sie alle Termine und KI-Buchungen
                </p>
              </div>
            </div>
            <Button className="bg-gradient-primary text-white shadow-glow">
              <Plus className="w-4 h-4 mr-2" />
              Neuer Termin
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Gesamt</p>
                    <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Bestätigt</p>
                    <p className="text-2xl font-bold text-success">{stats.confirmed}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Wartend</p>
                    <p className="text-2xl font-bold text-warning">{stats.pending}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-warning" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">KI-Buchungen</p>
                    <p className="text-2xl font-bold text-primary">{stats.aiBooked}</p>
                  </div>
                  <Bot className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="shadow-soft mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Patient oder Service suchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 text-sm bg-background border border-input rounded-md"
                  >
                    <option value="all">Alle Status</option>
                    <option value="confirmed">Bestätigt</option>
                    <option value="pending">Wartend</option>
                    <option value="ai_booked">KI-Buchung</option>
                  </select>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointments List */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Termine ({filteredAppointments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={appointment.patient.avatar} />
                          <AvatarFallback className="bg-gradient-primary text-white">
                            {appointment.patient.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-medium text-foreground">{appointment.patient.name}</h3>
                            {getStatusBadge(appointment.status, appointment.source)}
                          </div>
                          
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(appointment.date).toLocaleDateString('de-DE')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {appointment.time} ({appointment.duration}min)
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {appointment.patient.phone}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <span className="font-medium">{appointment.service}</span>
                              <span>€{appointment.price.toFixed(2)}</span>
                            </div>
                            
                            {appointment.notes && (
                              <p className="text-xs italic">{appointment.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {appointment.status === "pending" && (
                          <Button 
                            size="sm" 
                            onClick={() => handleConfirm(appointment.id)}
                            className="bg-success text-success-foreground hover:bg-success/80"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Bestätigen
                          </Button>
                        )}
                        
                        <Button variant="outline" size="sm">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCancel(appointment.id)}
                          className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  )
}