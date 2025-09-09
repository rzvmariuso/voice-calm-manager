-- Add DELETE policy for appointments so practice owners can delete their appointments
CREATE POLICY "Practice owners can delete their appointments" 
ON public.appointments 
FOR DELETE 
USING (user_owns_practice(practice_id));