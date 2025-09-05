-- Create table for user phone numbers
CREATE TABLE public.user_phone_numbers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  country_code TEXT NOT NULL DEFAULT 'DE',
  area_code TEXT,
  vapi_phone_id TEXT,
  vapi_assistant_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  provider TEXT DEFAULT 'vapi',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_phone_numbers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own phone numbers" 
ON public.user_phone_numbers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own phone numbers" 
ON public.user_phone_numbers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own phone numbers" 
ON public.user_phone_numbers 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own phone numbers" 
ON public.user_phone_numbers 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for timestamps
CREATE TRIGGER update_user_phone_numbers_updated_at
BEFORE UPDATE ON public.user_phone_numbers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();