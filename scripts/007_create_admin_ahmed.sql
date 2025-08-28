-- Create admin user for ahmed8636973@gmail.com
-- This script sets up the initial admin account for EDUSpark

-- First, we need to insert the user into auth.users table
-- Note: In production, you should use Supabase dashboard or auth API to create users
-- This is a direct database approach for initial setup

INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'ahmed8636973@gmail.com',
  crypt('123456789951', gen_salt('bf')),
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Create the profile for the admin user
INSERT INTO public.profiles (
  id,
  full_name,
  email,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'ahmed8636973@gmail.com'),
  'Ahmed Admin',
  'ahmed8636973@gmail.com',
  'admin',
  true,
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  is_active = true,
  updated_at = now();

-- Verify the admin user was created
SELECT 
  u.email,
  p.full_name,
  p.role,
  p.is_active
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'ahmed8636973@gmail.com';
