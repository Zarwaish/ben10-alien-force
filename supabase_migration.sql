-- Clean up profiles and RLS policies for Ben10 Admin Panel
-- 1. Drop any existing policies on profiles
DO $$
DECLARE
    p record;
BEGIN
    FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='profiles' LOOP
        EXECUTE format('DROP POLICY %I ON profiles;', p.policyname);
    END LOOP;
END $$;

-- 2. Delete broken admin profile rows (if any)
DELETE FROM profiles WHERE email = 'admin@gmail.com' AND role <> 'admin';

-- 3. Ensure the admin user exists in auth.users (replace with actual admin email if different)
--    The following INSERT selects the correct UUID from auth.users and creates a matching profile.
INSERT INTO public.profiles (id, username, email, role, is_admin)
SELECT
    id,
    split_part(email, '@', 1) AS username,
    email,
    'admin' AS role,
    true AS is_admin
FROM auth.users
WHERE email = 'admin@gmail.com'
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    is_admin = EXCLUDED.is_admin;

-- 4. Enable Row Level Security on the profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create clean policies (only allow users to act on their own row)
CREATE POLICY "users can read own profile"
    ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "users can update own profile"
    ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "allow profile insert"
    ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- 6. Helper function to fetch the current user's profile safely (no recursion)
CREATE OR REPLACE FUNCTION public.get_profile(uid uuid)
RETURNS TABLE (id uuid, username text, email text, role text, is_admin boolean)
LANGUAGE sql SECURITY DEFINER AS $$
    SELECT id, username, email, role, is_admin FROM profiles WHERE id = uid;
$$;

-- 7. Verify the policies and function are in place (run these queries manually to test)
-- SELECT * FROM public.get_profile(auth.uid());
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';
