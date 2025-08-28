-- Create device sessions table for tracking user devices
create table if not exists public.device_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  device_fingerprint text not null,
  device_info jsonb,
  ip_address text,
  user_agent text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_activity timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, device_fingerprint)
);

-- Enable RLS
alter table public.device_sessions enable row level security;

-- RLS policies for device_sessions
create policy "Users can view their own device sessions"
  on public.device_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own device sessions"
  on public.device_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own device sessions"
  on public.device_sessions for update
  using (auth.uid() = user_id);

-- Admins can view all device sessions
create policy "Admins can view all device sessions"
  on public.device_sessions for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Function to deactivate other device sessions when a new one is created
create or replace function public.handle_device_session()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Deactivate all other sessions for this user
  update public.device_sessions
  set is_active = false
  where user_id = new.user_id 
    and device_fingerprint != new.device_fingerprint;

  return new;
end;
$$;

-- Trigger to enforce single device restriction
drop trigger if exists on_device_session_created on public.device_sessions;

create trigger on_device_session_created
  after insert on public.device_sessions
  for each row
  execute function public.handle_device_session();
