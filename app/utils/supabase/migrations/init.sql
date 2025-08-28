-- جدول الباكدجات
create table if not exists packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamp default now()
);

-- جدول السب-باكدجات
create table if not exists sub_packages (
  id uuid primary key default gen_random_uuid(),
  package_id uuid references packages(id) on delete cascade,
  name text not null,
  created_at timestamp default now()
);

-- جدول الفيديوهات
create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  sub_package_id uuid references sub_packages(id) on delete cascade,
  title text not null,
  youtube_url text not null,
  created_at timestamp default now()
);
