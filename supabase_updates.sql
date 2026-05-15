-- ==========================================
-- SUPABASE ENHANCEMENTS
-- ==========================================

-- Ensure profiles has all needed columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, role, avatar_url)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    'user',
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = COALESCE(profiles.username, EXCLUDED.username);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on auth.users insert
-- Note: Check if trigger already exists to avoid errors
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- STORAGE BUCKET & RLS POLICIES
-- ==========================================

-- Insert the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('alien-assets', 'alien-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view images (Public read access)
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'alien-assets');

-- Policy: Authenticated users can upload images
CREATE POLICY "Authenticated users can upload" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'alien-assets');

-- Policy: Users can update their own uploads
CREATE POLICY "Users can update own uploads" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'alien-assets' AND auth.uid() = owner);

-- Policy: Users can delete their own uploads
CREATE POLICY "Users can delete own uploads" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'alien-assets' AND auth.uid() = owner);

-- Add policy for profiles
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);
