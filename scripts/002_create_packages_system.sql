-- Create packages table
create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_by uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create sub_packages table
create table if not exists public.sub_packages (
  id uuid primary key default gen_random_uuid(),
  package_id uuid references public.packages(id) on delete cascade not null,
  name text not null,
  description text,
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create videos table
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  sub_package_id uuid references public.sub_packages(id) on delete cascade not null,
  title text not null,
  youtube_url text not null,
  youtube_video_id text not null,
  description text,
  duration integer, -- in seconds
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on all tables
alter table public.packages enable row level security;
alter table public.sub_packages enable row level security;
alter table public.videos enable row level security;

-- RLS policies for packages
create policy "Anyone can view packages"
  on public.packages for select
  using (true);

create policy "Admins can manage packages"
  on public.packages for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- RLS policies for sub_packages
create policy "Anyone can view sub_packages"
  on public.sub_packages for select
  using (true);

create policy "Admins can manage sub_packages"
  on public.sub_packages for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- RLS policies for videos
create policy "Anyone can view videos"
  on public.videos for select
  using (true);

create policy "Admins can manage videos"
  on public.videos for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
