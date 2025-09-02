import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import BookingTest from "@/components/BookingTest"
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
import { useAppointments } from "@/hooks/useAppointments"

export default function Appointments() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const { toast } = useToast()
  const { appointments, isLoading, error } = useAppointments()

  const getStatusBadge = (status: string, aiBooked: boolean | null) => {
    switch (status) {
      case "confirmed":
        return (
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-success text-success-foreground">
              <CheckCircle className="w-3 h-3 mr-1" />
              Bestätigt
            </Badge>
            {aiBooked && (
              <Badge variant="outline" className="border-primary text-primary text-xs">
                <Bot className="w-3 h-3 mr-1" />
                KI
              </Badge>
            )}
          </div>
        )
      case "pending":
        return (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-warning text-warning-foreground">
              <Clock className="w-3 h-3 mr-1" />
              Wartend
            </Badge>
            {aiBooked && (
              <Badge variant="outline" className="border-primary text-primary text-xs">
                <Bot className="w-3 h-3 mr-1" />
                KI-Buchung
              </Badge>
            )}
          </div>
        )
      default:
        return <Badge variant="outline">Unbekannt</Badge>
    }
  }

  const filteredAppointments = appointments.filter(appointment => {
    const patientName = `${appointment.patient.first_name} ${appointment.patient.last_name}`;
    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === "confirmed").length,
    pending: appointments.filter(a => a.status === "pending").length,
    aiBooked: appointments.filter(a => a.ai_booked === true).length
  }

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1 p-6 bg-background">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Lade Termine...</p>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    )
  }

  if (error) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1 p-6 bg-background">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
                <p className="text-destructive">Fehler beim Laden der Termine: {error}</p>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    )
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 animate-fade-in">
            <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <Card className="shadow-soft card-interactive">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Gesamt</p>
                      <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-200" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <Card className="shadow-soft card-interactive">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Bestätigt</p>
                      <p className="text-2xl font-bold text-success">{stats.confirmed}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-success group-hover:scale-110 transition-transform duration-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <Card className="shadow-soft card-interactive">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Wartend</p>
                      <p className="text-2xl font-bold text-warning">{stats.pending}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-warning group-hover:scale-110 transition-transform duration-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="animate-scale-in" style={{ animationDelay: '0.4s' }}>
              <Card className="shadow-soft card-interactive">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">KI-Buchungen</p>
                      <p className="text-2xl font-bold text-primary">{stats.aiBooked}</p>
                    </div>
                    <Bot className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-200 animate-bounce-gentle" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Test Component - Temporary */}
          <BookingTest />

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
              <div className="space-y-4 animate-fade-in">
                {filteredAppointments.map((appointment, index) => (
                  <div 
                    key={appointment.id} 
                    className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-all duration-300 hover:shadow-soft hover:scale-[1.02] group animate-scale-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="w-12 h-12 group-hover:scale-110 transition-transform duration-200">
                          <AvatarFallback className="bg-gradient-primary text-white">
                            {appointment.patient.first_name[0]}{appointment.patient.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors duration-200">
                              {appointment.patient.first_name} {appointment.patient.last_name}
                            </h3>
                            {getStatusBadge(appointment.status, appointment.ai_booked)}
                          </div>
                          
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(appointment.appointment_date).toLocaleDateString('de-DE')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {appointment.appointment_time} ({appointment.duration_minutes || 30}min)
                              </span>
                              {appointment.patient.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {appointment.patient.phone}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <span className="font-medium group-hover:text-primary/80 transition-colors duration-200">
                                {appointment.service}
                              </span>
                              {appointment.ai_booked && (
                                <Badge variant="outline" className="border-primary text-primary text-xs">
                                  AI-gebucht
                                </Badge>
                              )}
                            </div>
                            
                            {appointment.notes && (
                              <p className="text-xs italic opacity-70 group-hover:opacity-90 transition-opacity duration-200">
                                {appointment.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {appointment.status === "pending" && (
                          <Button 
                            size="sm" 
                            onClick={() => handleConfirm(appointment.id)}
                            className="bg-success text-success-foreground hover:bg-success/80 hover:scale-105 transition-all duration-200"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Bestätigen
                          </Button>
                        )}
                        
                        <Button variant="outline" size="sm" className="hover:scale-105 transition-transform duration-200">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCancel(appointment.id)}
                          className="text-destructive hover:text-destructive-foreground hover:bg-destructive hover:scale-105 transition-all duration-200"
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