-- Enable realtime for appointments table
ALTER TABLE public.appointments REPLICA IDENTITY FULL;

-- Add the appointments table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;