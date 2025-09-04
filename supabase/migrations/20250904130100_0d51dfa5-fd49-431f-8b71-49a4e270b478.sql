-- Add practice_type to practices table
ALTER TABLE public.practices 
ADD COLUMN practice_type TEXT NOT NULL DEFAULT 'general';

-- Create practice_services table
CREATE TABLE public.practice_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  practice_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER DEFAULT 30,
  price DECIMAL(10,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on practice_services
ALTER TABLE public.practice_services ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for practice_services
CREATE POLICY "Practice owners can view their services" 
ON public.practice_services 
FOR SELECT 
USING (practice_id IN (
  SELECT id FROM practices WHERE owner_id = auth.uid()
));

CREATE POLICY "Practice owners can create their services" 
ON public.practice_services 
FOR INSERT 
WITH CHECK (practice_id IN (
  SELECT id FROM practices WHERE owner_id = auth.uid()
));

CREATE POLICY "Practice owners can update their services" 
ON public.practice_services 
FOR UPDATE 
USING (practice_id IN (
  SELECT id FROM practices WHERE owner_id = auth.uid()
));

CREATE POLICY "Practice owners can delete their services" 
ON public.practice_services 
FOR DELETE 
USING (practice_id IN (
  SELECT id FROM practices WHERE owner_id = auth.uid()
));

-- Create trigger for updated_at
CREATE TRIGGER update_practice_services_updated_at
BEFORE UPDATE ON public.practice_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update appointments table to include service reference
ALTER TABLE public.appointments 
ADD COLUMN service_id UUID REFERENCES public.practice_services(id);

-- Create default services for existing practices
INSERT INTO public.practice_services (practice_id, name, description, duration_minutes)
SELECT 
  id as practice_id,
  'Beratung' as name,
  'Allgemeine Beratung und Behandlung' as description,
  30 as duration_minutes
FROM public.practices;