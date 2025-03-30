
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read objects in the public bucket
CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'almacenamiento');

-- Create policy to allow authenticated users to upload objects
CREATE POLICY "Allow authenticated users to upload" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'almacenamiento');

-- Create policy to allow users to update their own objects
CREATE POLICY "Allow users to update own objects" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'almacenamiento' AND (auth.uid() = owner OR auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  )));

-- Create policy to allow users to delete their own objects
CREATE POLICY "Allow users to delete own objects" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'almacenamiento' AND (auth.uid() = owner OR auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  )));
