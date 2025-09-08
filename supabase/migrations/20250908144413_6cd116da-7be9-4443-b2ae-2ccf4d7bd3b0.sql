-- Add RLS policies to public_pricing table for better data protection
ALTER TABLE public.public_pricing ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view pricing plans (needed for subscription page)
CREATE POLICY "Authenticated users can view pricing plans" 
ON public.public_pricing 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Only admins can modify pricing plans
CREATE POLICY "Admins can manage pricing plans" 
ON public.public_pricing 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));