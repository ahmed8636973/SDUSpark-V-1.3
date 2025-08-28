-- Setup initial admin user
-- Replace 'admin@eduspark.com' with your desired admin email
-- Replace 'your-secure-password' with your desired admin password

-- Note: This script creates the admin user in the auth.users table
-- You'll need to run this with appropriate admin privileges

-- Insert admin user (this would typically be done through Supabase dashboard or API)
-- The profile will be created automatically via the trigger

-- For manual setup, you can use this query after creating the user through Supabase Auth:
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE email = 'admin@eduspark.com';

-- Alternatively, you can insert directly if you have the user ID:
-- INSERT INTO public.profiles (id, email, full_name, role, is_active)
-- VALUES (
--   'your-user-uuid-here',
--   'admin@eduspark.com', 
--   'Admin User',
--   'admin',
--   true
-- );

-- For security, ensure only one admin exists initially
-- You can add more admins later through the admin dashboard
