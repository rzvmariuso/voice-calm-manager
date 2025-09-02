-- Add SMS reminder tracking column to appointments table
ALTER TABLE public.appointments 
ADD COLUMN sms_reminder_sent boolean DEFAULT false;