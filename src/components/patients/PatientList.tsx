import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Phone, 
  Mail, 
  Edit, 
  Trash2, 
  Search,
  Plus,
  Calendar,
  Shield,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePractice } from "@/hooks/usePractice";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  privacy_consent: boolean;
  consent_date: string | null;
  created_at: string;
  data_retention_until: string | null;
}

interface PatientListProps {
  onEdit?: (patient: Patient) => void;
  onAdd?: () => void;
  refreshTrigger?: number;
}

export function PatientList({ onEdit, onAdd, refreshTrigger }: PatientListProps) {
  const { practice } = usePractice();
  const { toast } = useToast();
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  useEffect(() => {
    if (practice) {
      loadPatients();
    }
  }, [practice, refreshTrigger]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('practice_id', practice?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error loading patients:', error);
      toast({
        title: "Fehler",
        description: "Patienten konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!patientToDelete) return;

    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientToDelete.id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Patient wurde gelöscht",
      });

      loadPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast({
        title: "Fehler",
        description: "Patient konnte nicht gelöscht werden",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setPatientToDelete(null);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.first_name.toLowerCase().includes(searchLower) ||
      patient.last_name.toLowerCase().includes(searchLower) ||
      patient.email?.toLowerCase().includes(searchLower) ||
      patient.phone?.includes(searchTerm)
    );
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return <Loading text="Patienten werden geladen..." />;
  }

  if (patients.length === 0) {
    return (
      <EmptyState
        icon={User}
        title="Keine Patienten vorhanden"
        description="Fügen Sie Ihren ersten Patienten hinzu, um loszulegen."
        action={
          onAdd ? {
            label: "Ersten Patienten hinzufügen",
            onClick: onAdd
          } : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Patienten durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {onAdd && (
          <Button onClick={onAdd} className="button-gradient">
            <Plus className="w-4 h-4 mr-2" />
            Neuer Patient
          </Button>
        )}
      </div>

      {/* Patients List */}
      <div className="grid gap-4">
        {filteredPatients.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Keine Patienten gefunden.</p>
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <Card key={patient.id} className="card-interactive hover:shadow-soft transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Patient Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="w-16 h-16 hover:scale-110 transition-transform duration-200">
                      <AvatarFallback className="bg-gradient-primary text-white text-lg font-semibold">
                        {getInitials(patient.first_name, patient.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-foreground">
                          {patient.first_name} {patient.last_name}
                        </h3>
                        
                        {patient.privacy_consent ? (
                          <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                            <Shield className="w-3 h-3 mr-1" />
                            DSGVO-konform
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="bg-red-500/10 text-red-700 border-red-500/20">
                            <Shield className="w-3 h-3 mr-1" />
                            Keine Einwilligung
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        {patient.date_of_birth && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {calculateAge(patient.date_of_birth)} Jahre 
                              ({format(new Date(patient.date_of_birth), "dd.MM.yyyy")})
                            </span>
                          </div>
                        )}
                        
                        {patient.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{patient.email}</span>
                          </div>
                        )}
                        
                        {patient.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{patient.phone}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Erstellt: {format(new Date(patient.created_at), "dd.MM.yyyy")}</span>
                        </div>
                        
                        {patient.data_retention_until && (
                          <div className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            <span>
                              Löschung: {format(new Date(patient.data_retention_until), "dd.MM.yyyy")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(patient)}
                        className="hover:scale-105 transition-transform duration-200"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPatientToDelete(patient);
                        setDeleteDialogOpen(true);
                      }}
                      className="hover:scale-105 transition-transform duration-200 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Patient löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie diesen Patienten löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
              {patientToDelete && (
                <div className="mt-2 p-2 bg-muted rounded text-sm">
                  <strong>{patientToDelete.first_name} {patientToDelete.last_name}</strong>
                  {patientToDelete.email && <div>E-Mail: {patientToDelete.email}</div>}
                  {patientToDelete.phone && <div>Telefon: {patientToDelete.phone}</div>}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}