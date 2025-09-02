-- Create patient_notes table for storing patient history and notes
CREATE TABLE public.patient_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  practice_id UUID NOT NULL,
  note TEXT NOT NULL,
  note_type TEXT NOT NULL DEFAULT 'general' CHECK (note_type IN ('general', 'treatment', 'medical')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.patient_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for patient notes
CREATE POLICY "Practice owners can view their patient notes" 
ON public.patient_notes 
FOR SELECT 
USING (practice_id IN ( SELECT practices.id
   FROM practices
  WHERE (practices.owner_id = auth.uid())));

CREATE POLICY "Practice owners can create patient notes" 
ON public.patient_notes 
FOR INSERT 
WITH CHECK (practice_id IN ( SELECT practices.id
   FROM practices
  WHERE (practices.owner_id = auth.uid())));

CREATE POLICY "Practice owners can update their patient notes" 
ON public.patient_notes 
FOR UPDATE 
USING (practice_id IN ( SELECT practices.id
   FROM practices
  WHERE (practices.owner_id = auth.uid())));

CREATE POLICY "Practice owners can delete their patient notes" 
ON public.patient_notes 
FOR DELETE 
USING (practice_id IN ( SELECT practices.id
   FROM practices
  WHERE (practices.owner_id = auth.uid())));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_patient_notes_updated_at
BEFORE UPDATE ON public.patient_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for SMS reminders tracking
CREATE TABLE public.sms_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL,
  practice_id UUID NOT NULL,
  patient_phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sms_reminders ENABLE ROW LEVEL SECURITY;

-- Create policies for SMS reminders
CREATE POLICY "Practice owners can view their SMS reminders" 
ON public.sms_reminders 
FOR SELECT 
USING (practice_id IN ( SELECT practices.id
   FROM practices
  WHERE (practices.owner_id = auth.uid())));

CREATE POLICY "Practice owners can create SMS reminders" 
ON public.sms_reminders 
FOR INSERT 
WITH CHECK (practice_id IN ( SELECT practices.id
   FROM practices
  WHERE (practices.owner_id = auth.uid())));

CREATE POLICY "Practice owners can update their SMS reminders" 
ON public.sms_reminders 
FOR UPDATE 
USING (practice_id IN ( SELECT practices.id
   FROM practices
  WHERE (practices.owner_id = auth.uid())));

-- Create table for recurring appointments
CREATE TABLE public.recurring_appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  practice_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  service TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  notes TEXT,
  
  -- Recurrence settings
  recurrence_type TEXT NOT NULL CHECK (recurrence_type IN ('daily', 'weekly', 'monthly')),
  recurrence_interval INTEGER NOT NULL DEFAULT 1, -- every X days/weeks/months
  days_of_week INTEGER[], -- for weekly: [1,2,3] = Mon,Tue,Wed
  day_of_month INTEGER, -- for monthly: day of month (1-31)
  
  -- Time settings
  start_time TIME WITHOUT TIME ZONE NOT NULL,
  
  -- Date range
  start_date DATE NOT NULL,
  end_date DATE, -- NULL means no end date
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.recurring_appointments ENABLE ROW LEVEL SECURITY;

-- Create policies for recurring appointments
CREATE POLICY "Practice owners can view their recurring appointments" 
ON public.recurring_appointments 
FOR SELECT 
USING (practice_id IN ( SELECT practices.id
   FROM practices
  WHERE (practices.owner_id = auth.uid())));

CREATE POLICY "Practice owners can create recurring appointments" 
ON public.recurring_appointments 
FOR INSERT 
WITH CHECK (practice_id IN ( SELECT practices.id
   FROM practices
  WHERE (practices.owner_id = auth.uid())));

CREATE POLICY "Practice owners can update their recurring appointments" 
ON public.recurring_appointments 
FOR UPDATE 
USING (practice_id IN ( SELECT practices.id
   FROM practices
  WHERE (practices.owner_id = auth.uid())));

CREATE POLICY "Practice owners can delete their recurring appointments" 
ON public.recurring_appointments 
FOR DELETE 
USING (practice_id IN ( SELECT practices.id
   FROM practices
  WHERE (practices.owner_id = auth.uid())));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_recurring_appointments_updated_at
BEFORE UPDATE ON public.recurring_appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();