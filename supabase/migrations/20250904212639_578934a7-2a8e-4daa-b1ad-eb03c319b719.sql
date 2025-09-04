-- Add DELETE policy for subscribers table
CREATE POLICY "delete_own_subscription" ON public.subscribers
FOR DELETE
USING (true);

-- Delete the specific subscriber
DELETE FROM public.subscribers 
WHERE email = 'oanceamarius18@gmail.com';