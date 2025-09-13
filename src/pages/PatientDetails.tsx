import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PatientHistory } from "@/components/patients/PatientHistory";
import { PatientNotes } from "@/components/patients/PatientNotes";
import { PatientFiles } from "@/components/patients/PatientFiles";
import { PatientDialog } from "@/components/patients/PatientDialog";
import { LoadingPage } from "@/components/common/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";
import { usePractice } from "@/hooks/usePractice";
import { useToast } from "@/hooks/use-toast";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
}

export default function PatientDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { practice, loading: practiceLoading } = usePractice();
  const { toast } = useToast();
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    if (practice && id) {
      loadPatient();
    }
  }, [practice, id]);

  const loadPatient = async () => {
    if (!practice || !id) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('practice_id', practice.id)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Patient nicht gefunden",
          description: "Der angeforderte Patient konnte nicht gefunden werden.",
          variant: "destructive",
        });
        navigate('/patients');
        return;
      }

      setPatient(data);
    } catch (error) {
      console.error('Error loading patient:', error);
      toast({
        title: "Fehler",
        description: "Patientendaten konnten nicht geladen werden",
        variant: "destructive",
      });
      navigate('/patients');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientUpdate = () => {
    setEditDialogOpen(false);
    loadPatient(); // Reload patient data
  };

  if (practiceLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <LoadingPage 
          title="Lade Patientendaten..." 
          description="Patienteninformationen werden geladen" 
        />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-background">
        <LoadingPage 
          title="Patient nicht gefunden" 
          description="Weiterleitung zur Patientenliste..." 
        />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-subtle">
          <AppSidebar />
          <MobileNavigation />
          
          <main className="flex-1 flex flex-col overflow-hidden">
            <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4 lg:px-6">
              <SidebarTrigger className="lg:hidden" />
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Zurück
                </Button>
                <div className="h-6 w-px bg-border" />
                <h1 className="text-lg font-semibold">
                  {patient.first_name} {patient.last_name}
                </h1>
              </div>
              <div className="flex-1" />
              <Button
                onClick={() => setEditDialogOpen(true)}
                size="sm"
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                Bearbeiten
              </Button>
            </header>
            
            <div className="flex-1 overflow-auto p-4 lg:p-6 space-y-6">
              <PatientHistory patient={patient} />
              
              <PatientNotes 
                patientId={patient.id} 
                patientName={`${patient.first_name} ${patient.last_name}`}
              />

              <PatientFiles 
                patientId={patient.id} 
                patientName={`${patient.first_name} ${patient.last_name}`}
              />
            </div>
          </main>
        </div>

        <PatientDialog
          patient={patient}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={handlePatientUpdate}
        />
      </SidebarProvider>
    </TooltipProvider>
  );
}