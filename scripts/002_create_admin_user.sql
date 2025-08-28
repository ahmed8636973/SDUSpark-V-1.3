-- Insert the admin user directly into auth.users (this simulates what Supabase auth would do)
-- Note: In a real setup, you would use Supabase auth.signUp, but for this demo we'll create directly

-- First, let's create a function to create the admin user
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Generate a UUID for the admin user
  admin_user_id := gen_random_uuid();
  
  -- Insert into profiles table directly (since we can't easily insert into auth.users from SQL)
  -- The admin will need to sign up normally, then we'll update their role
  INSERT INTO public.profiles (id, full_name, role, is_active)
  VALUES (
    admin_user_id,
    'Ahmed Admin',
    'admin',
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    is_active = true,
    full_name = 'Ahmed Admin';
    
  -- For now, we'll create a placeholder that will be updated when the user signs up
  RAISE NOTICE 'Admin profile prepared. User must sign up with email: ahmed8636973@gmail.com';
END;
$$;

-- Execute the function
SELECT create_admin_user();

-- Drop the function after use
DROP FUNCTION create_admin_user();
