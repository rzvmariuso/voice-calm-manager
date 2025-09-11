-- Add DELETE policy for patients table to allow practice owners to delete their patients
CREATE POLICY "Practice owners can delete their patients" 
ON public.patients 
FOR DELETE 
USING (user_owns_practice(practice_id));