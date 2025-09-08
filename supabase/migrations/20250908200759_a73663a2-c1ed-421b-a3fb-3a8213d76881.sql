-- Fix security issues identified in security review (excluding public_pricing view)

-- 1. Verify and strengthen INSERT policies for appointments table
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

-- 2. Verify and strengthen INSERT policies for patients table  
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

-- 3. Add additional security function to validate practice ownership
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

-- 4. Enhance existing policies with the new function for better performance
DROP POLICY IF EXISTS "Practice owners can update their appointments" ON public.appointments;
CREATE POLICY "Practice owners can update their appointments" 
ON public.appointments 
FOR UPDATE 
TO authenticated
USING (public.user_owns_practice(practice_id));

DROP POLICY IF EXISTS "Practice owners can view their appointments" ON public.appointments;
CREATE POLICY "Practice owners can view their appointments" 
ON public.appointments 
FOR SELECT 
TO authenticated
USING (public.user_owns_practice(practice_id));

DROP POLICY IF EXISTS "Practice owners can update their patients" ON public.patients;
CREATE POLICY "Practice owners can update their patients" 
ON public.patients 
FOR UPDATE 
TO authenticated
USING (public.user_owns_practice(practice_id));

DROP POLICY IF EXISTS "Practice owners can view their patients" ON public.patients;
CREATE POLICY "Practice owners can view their patients" 
ON public.patients 
FOR SELECT 
TO authenticated
USING (public.user_owns_practice(practice_id));