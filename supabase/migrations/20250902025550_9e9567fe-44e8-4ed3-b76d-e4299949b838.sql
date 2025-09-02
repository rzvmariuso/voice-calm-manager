-- Create tables for AI appointment booking system

-- Practices table for multi-tenant support
CREATE TABLE public.practices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  business_hours JSONB DEFAULT '{"monday":{"open":"09:00","close":"17:00"},"tuesday":{"open":"09:00","close":"17:00"},"wednesday":{"open":"09:00","close":"17:00"},"thursday":{"open":"09:00","close":"17:00"},"friday":{"open":"09:00","close":"17:00"},"saturday":{"closed":true},"sunday":{"closed":true}}'::jsonb,
  ai_prompt TEXT DEFAULT 'Sie sind ein freundlicher AI-Assistent für Terminbuchungen. Helfen Sie Patienten dabei, Termine zu buchen und allgemeine Fragen zu beantworten.',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Patients table (DSGVO compliant with minimal data)
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  practice_id UUID NOT NULL REFERENCES public.practices(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  date_of_birth DATE,
  privacy_consent BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMP WITH TIME ZONE,
  data_retention_until DATE DEFAULT (CURRENT_DATE + INTERVAL '10 years'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  practice_id UUID NOT NULL REFERENCES public.practices(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  service TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  ai_booked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI call logs (for monitoring and improvement)
CREATE TABLE public.ai_call_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  practice_id UUID NOT NULL REFERENCES public.practices(id) ON DELETE CASCADE,
  caller_phone TEXT,
  call_duration INTEGER,
  outcome TEXT CHECK (outcome IN ('appointment_booked', 'information_provided', 'transfer_requested', 'call_ended')),
  transcript TEXT,
  appointment_id UUID REFERENCES public.appointments(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- GDPR data requests table
CREATE TABLE public.data_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  practice_id UUID NOT NULL REFERENCES public.practices(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('access', 'rectification', 'erasure', 'portability')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  requested_by_email TEXT NOT NULL,
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for practices
CREATE POLICY "Users can view their own practices" 
ON public.practices 
FOR SELECT 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own practices" 
ON public.practices 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own practices" 
ON public.practices 
FOR UPDATE 
USING (auth.uid() = owner_id);

-- RLS Policies for patients
CREATE POLICY "Practice owners can view their patients" 
ON public.patients 
FOR SELECT 
USING (
  practice_id IN (
    SELECT id FROM public.practices WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Practice owners can create patients" 
ON public.patients 
FOR INSERT 
WITH CHECK (
  practice_id IN (
    SELECT id FROM public.practices WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Practice owners can update their patients" 
ON public.patients 
FOR UPDATE 
USING (
  practice_id IN (
    SELECT id FROM public.practices WHERE owner_id = auth.uid()
  )
);

-- RLS Policies for appointments
CREATE POLICY "Practice owners can view their appointments" 
ON public.appointments 
FOR SELECT 
USING (
  practice_id IN (
    SELECT id FROM public.practices WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Practice owners can create appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (
  practice_id IN (
    SELECT id FROM public.practices WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Practice owners can update their appointments" 
ON public.appointments 
FOR UPDATE 
USING (
  practice_id IN (
    SELECT id FROM public.practices WHERE owner_id = auth.uid()
  )
);

-- RLS Policies for AI call logs
CREATE POLICY "Practice owners can view their call logs" 
ON public.ai_call_logs 
FOR SELECT 
USING (
  practice_id IN (
    SELECT id FROM public.practices WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Practice owners can create call logs" 
ON public.ai_call_logs 
FOR INSERT 
WITH CHECK (
  practice_id IN (
    SELECT id FROM public.practices WHERE owner_id = auth.uid()
  )
);

-- RLS Policies for data requests
CREATE POLICY "Practice owners can view their data requests" 
ON public.data_requests 
FOR SELECT 
USING (
  practice_id IN (
    SELECT id FROM public.practices WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Practice owners can create data requests" 
ON public.data_requests 
FOR INSERT 
WITH CHECK (
  practice_id IN (
    SELECT id FROM public.practices WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Practice owners can update their data requests" 
ON public.data_requests 
FOR UPDATE 
USING (
  practice_id IN (
    SELECT id FROM public.practices WHERE owner_id = auth.uid()
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_practices_updated_at
  BEFORE UPDATE ON public.practices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- GDPR compliance function - automatic data deletion after retention period
CREATE OR REPLACE FUNCTION public.cleanup_expired_patient_data()
RETURNS void AS $$
BEGIN
  -- Delete patients whose data retention period has expired
  DELETE FROM public.patients 
  WHERE data_retention_until < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create indexes for better performance
CREATE INDEX idx_practices_owner_id ON public.practices(owner_id);
CREATE INDEX idx_patients_practice_id ON public.patients(practice_id);
CREATE INDEX idx_appointments_practice_id ON public.appointments(practice_id);
CREATE INDEX idx_appointments_date_time ON public.appointments(appointment_date, appointment_time);
CREATE INDEX idx_ai_call_logs_practice_id ON public.ai_call_logs(practice_id);
CREATE INDEX idx_patients_retention ON public.patients(data_retention_until);