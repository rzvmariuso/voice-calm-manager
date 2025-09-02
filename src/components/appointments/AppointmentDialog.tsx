import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppointmentForm } from "./AppointmentForm";

interface AppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: any;
  isEditing?: boolean;
  onSuccess?: () => void;
}

export function AppointmentDialog({ 
  open, 
  onOpenChange, 
  appointment, 
  isEditing = false, 
  onSuccess 
}: AppointmentDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Termin bearbeiten" : "Neuer Termin"}
          </DialogTitle>
        </DialogHeader>
        <AppointmentForm
          appointment={appointment}
          isEditing={isEditing}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}