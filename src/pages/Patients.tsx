import { useState, useEffect } from "react";
import { Search, Plus, User, Mail, Phone, Calendar, MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { supabase } from "@/integrations/supabase/client";
import { usePractice } from "@/hooks/usePractice";
import { useToast } from "@/hooks/use-toast";
import { PatientDialog } from "@/components/patients/PatientDialog";

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  consent_date?: string;
  created_at: string;
}

const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
const { practice } = usePractice();
const { toast } = useToast();

const [dialogOpen, setDialogOpen] = useState(false);
const [isEditing, setIsEditing] = useState(false);
const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
const [appointmentCounts, setAppointmentCounts] = useState<Record<string, number>>({});

useEffect(() => {
  if (practice) {
    fetchPatients();
  }
}, [practice]);

const fetchPatients = async () => {
  if (!practice) return;
  
  try {
    setLoading(true);
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('practice_id', practice.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setPatients(data || []);

    // Lade Terminanzahl pro Patient
    const { data: appts, error: apptErr } = await supabase
      .from('appointments')
      .select('patient_id')
      .eq('practice_id', practice.id);

    if (!apptErr && appts) {
      const counts: Record<string, number> = {};
      appts.forEach((a: any) => {
        if (a.patient_id) {
          counts[a.patient_id] = (counts[a.patient_id] || 0) + 1;
        }
      });
      setAppointmentCounts(counts);
    }
  } catch (error: any) {
    toast({
      title: "Fehler",
      description: "Patienten konnten nicht geladen werden.",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};

const uniqueByName = (() => {
  const map = new Map<string, Patient>();
  for (const p of patients) {
    const key = `${p.first_name} ${p.last_name}`.toLowerCase();
    if (!map.has(key)) map.set(key, p);
  }
  return Array.from(map.values());
})();

const filteredPatients = uniqueByName.filter(patient =>
  `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
  (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
  (patient.phone && patient.phone.includes(searchTerm))
);

  const handleDeletePatient = async (patientId: string) => {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId);

      if (error) throw error;

      setPatients(patients.filter(p => p.id !== patientId));
      toast({
        title: "Patient gelöscht",
        description: "Der Patient wurde erfolgreich gelöscht.",
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Patient konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  const getConsentStatus = (consentDate?: string) => {
    if (!consentDate) {
      return <Badge variant="destructive">Keine Einwilligung</Badge>;
    }
    return <Badge variant="default">DSGVO Einwilligung</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const stats = {
    total: patients.length,
    withConsent: patients.filter(p => p.consent_date).length,
    thisMonth: patients.filter(p => {
      const patientDate = new Date(p.created_at);
      const now = new Date();
      return patientDate.getMonth() === now.getMonth() && patientDate.getFullYear() === now.getFullYear();
    }).length,
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1 p-6 bg-background">
            <Loading text="Lade Patienten" />
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 p-6 bg-background space-y-6">
          <div className="flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-3xl font-bold text-gradient">
                  Patienten
                </h1>
                <p className="text-muted-foreground">
                  Verwalten Sie alle Patientendaten und DSGVO-Einwilligungen
                </p>
              </div>
            </div>
<Button className="button-gradient hover:scale-105 transition-transform duration-200" onClick={() => { setIsEditing(false); setSelectedPatient(null); setDialogOpen(true); }}>
  <Plus className="w-4 h-4 mr-2" />
  Neuer Patient
</Button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <StatsCard
                title="Gesamt Patienten"
                value={stats.total}
                change="Registrierte Patienten"
                changeType="positive"
                icon={User}
                description="In der Datenbank"
              />
            </div>
            <div className="animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <StatsCard
                title="DSGVO Einwilligung"
                value={stats.withConsent}
                change={`${Math.round((stats.withConsent / stats.total) * 100) || 0}% haben zugestimmt`}
                changeType="positive"
                icon={Calendar}
                description="Datenschutz konform"
              />
            </div>
            <div className="animate-scale-in" style={{ animationDelay: '0.4s' }}>
              <StatsCard
                title="Neue Patienten"
                value={stats.thisMonth}
                change="Diesen Monat"
                changeType="positive"
                icon={Plus}
                description="Monatliche Registrierungen"
              />
            </div>
          </div>

          {/* Search */}
          <div className="flex gap-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Patienten suchen (Name, E-Mail, Telefon)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 hover:border-primary/50 focus:border-primary transition-colors duration-200"
              />
            </div>
          </div>

          {/* Patients List */}
          <div className="grid gap-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            {filteredPatients.length === 0 ? (
              <EmptyState
                icon={User}
                title={searchTerm ? "Keine Patienten gefunden" : "Noch keine Patienten"}
                description={
                  searchTerm 
                    ? "Versuchen Sie eine andere Suchanfrage oder fügen Sie einen neuen Patienten hinzu." 
                    : "Fügen Sie Ihren ersten Patienten hinzu, um loszulegen."
                }
action={{
  label: "Neuer Patient",
  onClick: () => { setIsEditing(false); setSelectedPatient(null); setDialogOpen(true); }
}}
              />
            ) : (
              filteredPatients.map((patient, index) => (
                <Card 
                  key={patient.id} 
                  className="card-interactive animate-scale-in"
                  style={{ animationDelay: `${0.7 + (index * 0.05)}s` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => { setIsEditing(true); setSelectedPatient(patient); setDialogOpen(true); }}>
                        <Avatar className="w-12 h-12 hover:scale-110 transition-transform duration-200">
                          <AvatarFallback className="bg-gradient-primary text-white">
                            {patient.first_name[0]}{patient.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
<div className="flex items-center gap-2 mb-1">
  <h3 className="font-semibold text-foreground hover:text-primary transition-colors duration-200">
    {patient.first_name} {patient.last_name}
  </h3>
  {getConsentStatus(patient.consent_date)}
  {appointmentCounts[patient.id] ? (
    <Badge variant="outline" className="text-xs">{appointmentCounts[patient.id]} Termine</Badge>
  ) : null}
</div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {patient.email && (
                              <div className="flex items-center gap-1 hover:text-primary/80 transition-colors duration-200">
                                <Mail className="w-3 h-3" />
                                {patient.email}
                              </div>
                            )}
                            {patient.phone && (
                              <div className="flex items-center gap-1 hover:text-primary/80 transition-colors duration-200">
                                <Phone className="w-3 h-3" />
                                {patient.phone}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Registriert: {formatDate(patient.created_at)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover:scale-110 transition-transform duration-200">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="animate-scale-in">
<DropdownMenuItem 
  onClick={() => { setIsEditing(true); setSelectedPatient(patient); setDialogOpen(true); }}
  className="hover:bg-accent transition-colors duration-200"
>
  <Edit2 className="w-4 h-4 mr-2" />
  Bearbeiten
</DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeletePatient(patient.id)}
                            className="text-destructive hover:bg-destructive/10 transition-colors duration-200"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
</main>
  <PatientDialog 
    open={dialogOpen}
    onOpenChange={setDialogOpen}
    patient={selectedPatient || undefined}
    isEditing={isEditing}
    onSuccess={() => { fetchPatients(); }}
  />
</div>
</SidebarProvider>
  );
};

export default Patients;