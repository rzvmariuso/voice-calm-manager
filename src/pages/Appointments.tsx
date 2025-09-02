import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { AppointmentDialog } from "@/components/appointments/AppointmentDialog";
import { AppointmentList } from "@/components/appointments/AppointmentList";

export default function Appointments() {
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    document.title = "Termine | Verwaltung & Kalender";
  }, []);

  const handleAdd = () => {
    setSelectedAppointment(null);
    setIsEditing(false);
    setShowAppointmentDialog(true);
  };

  const handleEdit = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsEditing(true);
    setShowAppointmentDialog(true);
  };

  const handleSuccess = () => {
    setShowAppointmentDialog(false);
    setSelectedAppointment(null);
    setIsEditing(false);
    setRefreshCounter((c) => c + 1);
  };

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
            <Button className="bg-gradient-primary text-white shadow-glow" onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Neuer Termin
            </Button>
          </div>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Termine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AppointmentList onEdit={handleEdit} onAdd={handleAdd} refreshTrigger={refreshCounter} />
            </CardContent>
          </Card>
        </main>

        <AppointmentDialog
          open={showAppointmentDialog}
          onOpenChange={setShowAppointmentDialog}
          appointment={selectedAppointment}
          isEditing={isEditing}
          onSuccess={handleSuccess}
        />
      </div>
    </SidebarProvider>
  );
}
