-- Create user progress tracking
create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  video_id uuid references public.videos(id) on delete cascade not null,
  watched_duration integer default 0, -- in seconds
  completed boolean default false,
  last_watched_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, video_id)
);

-- Enable RLS
alter table public.user_progress enable row level security;

-- RLS policies for user_progress
create policy "Users can view their own progress"
  on public.user_progress for select
  using (auth.uid() = user_id);

create policy "Users can update their own progress"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own progress"
  on public.user_progress for update
  using (auth.uid() = user_id);

-- Admins can view all progress
create policy "Admins can view all progress"
  on public.user_progress for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
