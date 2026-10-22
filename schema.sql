-- Run this in Supabase Dashboard > SQL Editor.
create table if not exists public.site_sections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  icon text not null default '•',
  sort_order integer not null default 1,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.site_sections enable row level security;

-- Anyone can read only published sections on the public site.
drop policy if exists "Public can read published sections" on public.site_sections;
create policy "Public can read published sections"
on public.site_sections for select
to anon, authenticated
using (published = true);

-- Authenticated admins can manage content. Only create admin accounts you control.
drop policy if exists "Authenticated users can manage sections" on public.site_sections;
create policy "Authenticated users can manage sections"
on public.site_sections for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

insert into public.site_sections (title,slug,description,icon,sort_order,published)
values
('Operations','operations','Operation-related public information and reference pages.','⚓',1,true),
('General Information','general-information','General reference information, berth details and navigation resources.','🧭',2,true),
('Organization','organization','Organization overview and approved staff directory information.','◈',3,true),
('Ships / Crafts','ships-crafts','Individual ship and craft profile pages.','🚢',4,true),
('Gallery','gallery','Photo collections, events and approved media.','▧',5,true),
('Weather','weather','Weather-related reference information and links.','☁',6,true),
('Events','events','Announcements, upcoming events and forecasts.','▦',7,true),
('Watch Online','watch-online','A placeholder for an approved online viewing service.','▶',8,true)
on conflict (slug) do nothing;