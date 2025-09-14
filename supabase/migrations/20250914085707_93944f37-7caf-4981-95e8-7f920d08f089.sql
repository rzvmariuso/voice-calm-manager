-- Create storage buckets for patient files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('patient-files', 'patient-files', false, 20971520, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);

-- Create RLS policies for patient files
CREATE POLICY "Users can view their own practice patient files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'patient-files' 
  AND EXISTS (
    SELECT 1 FROM patients p 
    WHERE p.id::text = (storage.foldername(name))[2]
    AND p.practice_id IN (
      SELECT id FROM practices WHERE owner_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can upload files for their practice patients" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'patient-files' 
  AND EXISTS (
    SELECT 1 FROM patients p 
    WHERE p.id::text = (storage.foldername(name))[2]
    AND p.practice_id IN (
      SELECT id FROM practices WHERE owner_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update files for their practice patients" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'patient-files' 
  AND EXISTS (
    SELECT 1 FROM patients p 
    WHERE p.id::text = (storage.foldername(name))[2]
    AND p.practice_id IN (
      SELECT id FROM practices WHERE owner_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can delete files for their practice patients" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'patient-files' 
  AND EXISTS (
    SELECT 1 FROM patients p 
    WHERE p.id::text = (storage.foldername(name))[2]
    AND p.practice_id IN (
      SELECT id FROM practices WHERE owner_id = auth.uid()
    )
  )
);