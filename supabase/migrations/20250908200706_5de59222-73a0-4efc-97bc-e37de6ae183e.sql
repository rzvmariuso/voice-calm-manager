-- Fix security issues identified in security review

-- 1. Fix public_pricing table - add RLS and restrict access to authenticated users only
ALTER TABLE public.public_pricing ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view pricing plans
CREATE POLICY "Authenticated users can view pricing plans" 
ON public.public_pricing 
FOR SELECT 
TO authenticated
USING (true);

-- 2. Verify and strengthen INSERT policies for appointments table
-- The existing policy should validate practice ownership properly
DROP POLICY IF EXISTS "Practice owners can create appointments" ON public.appointments;
CREATE POLICY "Practice owners can create appointments" 
ON public.appointments 
FOR INSERT 
TO authenticated
WITH CHECK (
  practice_id IN (
    SELECT practices.id
    FROM practices
    WHERE practices.owner_id = auth.uid()
  )
);

-- 3. Verify and strengthen INSERT policies for patients table  
-- The existing policy should validate practice ownership properly
DROP POLICY IF EXISTS "Practice owners can create patients" ON public.patients;
CREATE POLICY "Practice owners can create patients" 
ON public.patients 
FOR INSERT 
TO authenticated
WITH CHECK (
  practice_id IN (
    SELECT practices.id
    FROM practices
    WHERE practices.owner_id = auth.uid()
  )
);

-- 4. Add additional security function to validate practice ownership
CREATE OR REPLACE FUNCTION public.user_owns_practice(_practice_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.practices
    WHERE id = _practice_id
      AND owner_id = auth.uid()
  )
$$;