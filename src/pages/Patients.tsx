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
import { supabase } from "@/integrations/supabase/client";
import { usePractice } from "@/hooks/usePractice";
import { useToast } from "@/hooks/use-toast";

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

  useEffect(() => {
    if (practice) {
      fetchPatients();
    }
  }, [practice]);

  const fetchPatients = async () => {
    if (!practice) return;
    
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('practice_id', practice.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
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

  const filteredPatients = patients.filter(patient =>
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
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-center h-64">
            <p>Lade Patienten...</p>
          </div>
        </main>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Patienten
            </h1>
          </div>
          <Button className="bg-gradient-primary text-white shadow-glow">
            <Plus className="w-4 h-4 mr-2" />
            Neuer Patient
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Gesamt Patienten"
            value={stats.total}
            change="Registrierte Patienten"
            changeType="positive"
            icon={User}
            description="In der Datenbank"
          />
          <StatsCard
            title="DSGVO Einwilligung"
            value={stats.withConsent}
            change={`${Math.round((stats.withConsent / stats.total) * 100) || 0}% haben zugestimmt`}
            changeType="positive"
            icon={Calendar}
            description="Datenschutz konform"
          />
          <StatsCard
            title="Neue Patienten"
            value={stats.thisMonth}
            change="Diesen Monat"
            changeType="positive"
            icon={Plus}
            description="Monatliche Registrierungen"
          />
        </div>

        {/* Search */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Patienten suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Patients List */}
        <div className="grid gap-4">
          {filteredPatients.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Keine Patienten gefunden</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "Keine Patienten entsprechen Ihrer Suche." : "Noch keine Patienten registriert."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredPatients.map((patient) => (
              <Card key={patient.id} className="transition-all hover:shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-primary text-white">
                          {patient.first_name[0]}{patient.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">
                            {patient.first_name} {patient.last_name}
                          </h3>
                          {getConsentStatus(patient.consent_date)}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {patient.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {patient.email}
                            </div>
                          )}
                          {patient.phone && (
                            <div className="flex items-center gap-1">
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
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeletePatient(patient.id)}
                          className="text-destructive"
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
    </SidebarProvider>
  );
};

export default Patients;