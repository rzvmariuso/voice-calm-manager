import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PatientForm } from "./PatientForm";

interface PatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: any;
  isEditing?: boolean;
  onSuccess?: () => void;
}

export function PatientDialog({ 
  open, 
  onOpenChange, 
  patient, 
  isEditing = false, 
  onSuccess 
}: PatientDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-3xl max-h-[90vh] overflow-y-auto animate-scale-in"
        aria-describedby="patient-dialog-description"
      >
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Patient bearbeiten" : "Neuer Patient"}
          </DialogTitle>
          <div id="patient-dialog-description" className="sr-only">
            {isEditing 
              ? "Bearbeiten Sie die Informationen des ausgewählten Patienten" 
              : "Erstellen Sie einen neuen Patienteneintrag mit allen erforderlichen Daten"
            }
          </div>
        </DialogHeader>
        <PatientForm
          patient={patient}
          isEditing={isEditing}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}