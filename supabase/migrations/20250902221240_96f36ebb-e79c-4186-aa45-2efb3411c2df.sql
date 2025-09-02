-- Add foreign key constraint between recurring_appointments and patients
ALTER TABLE public.recurring_appointments 
ADD CONSTRAINT fk_recurring_appointments_patient_id 
FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

-- Also add foreign key constraint between recurring_appointments and practices for completeness
ALTER TABLE public.recurring_appointments 
ADD CONSTRAINT fk_recurring_appointments_practice_id 
FOREIGN KEY (practice_id) REFERENCES public.practices(id) ON DELETE CASCADE;