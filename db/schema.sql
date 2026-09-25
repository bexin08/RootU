-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists vector;

-- 1. Profiles (1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  origin_city text,
  destination_city text,
  university text,
  major text,
  program_level text check (program_level in ('undergraduate','postgraduate','diploma','other')),
  dietary_preferences text[] not null default '{}',
  move_in_date date,
  housing_type text check (housing_type in ('hostel','pg','apartment','other')),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Advisory configuration
create table public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  commute_mode text not null default 'bus'
    check (commute_mode in ('bus','auto','walk','bike','own_vehicle')),
  briefing_time time not null default '06:30',
  weather_alert_threshold text not null default 'medium'
    check (weather_alert_threshold in ('low','medium','high')),
  traffic_check_enabled boolean not null default true,
  notify_in_app boolean not null default true,
  notify_email boolean not null default false,
  updated_at timestamptz not null default now()
);

-- 3. Auto-create a bare profile + preferences row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  insert into public.user_preferences (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. Conversations + messages (shared by onboarding and Local Insider chat)
create table public.conversations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('onboarding','assistant')),
  title text,
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  extracted_entities jsonb,
  sources jsonb,
  created_at timestamptz not null default now()
);
create index messages_conversation_idx on public.messages (conversation_id, created_at);

-- 5. Academic schedule
create table public.schedule_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  event_type text not null default 'class'
    check (event_type in ('class','lab','exam','assignment_due','other')),
  location text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  recurrence_rule text,
  source text not null default 'manual'
    check (source in ('manual','google_calendar','ical_import')),
  created_at timestamptz not null default now()
);
create index schedule_events_user_time_idx on public.schedule_events (user_id, start_time);

-- 6. Calendar sync links
create table public.calendar_links (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('google','ical_url')),
  external_ref text not null,
  last_synced_at timestamptz,
  sync_status text not null default 'pending'
    check (sync_status in ('pending','synced','error')),
  created_at timestamptz not null default now()
);

-- 7. Curated local knowledge base (RAG corpus)
create table public.local_knowledge (
  id uuid primary key default uuid_generate_v4(),
  city text not null,
  category text not null check (category in
    ('transit','housing','food','health_emergency','academic','community_culture','finance_essentials')),
  title text not null,
  content text not null,
  embedding vector(768),
  source text,
  verified boolean not null default true,
  created_at timestamptz not null default now()
);
create index local_knowledge_embedding_idx
  on public.local_knowledge using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index local_knowledge_city_category_idx on public.local_knowledge (city, category);

-- 8. Daily briefing cache
create table public.daily_briefings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  briefing_date date not null,
  headline text not null,
  content text not null,
  weather_snapshot jsonb,
  traffic_snapshot jsonb,
  schedule_snapshot jsonb,
  generated_at timestamptz not null default now(),
  unique (user_id, briefing_date)
);

-- RPC for vector search
create or replace function public.match_local_knowledge(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_city text
)
returns table (
  id uuid,
  city text,
  category text,
  title text,
  content text,
  similarity float
)
language sql stable as $$
  select
    id,
    city,
    category,
    title,
    content,
    1 - (embedding <=> query_embedding) as similarity
  from public.local_knowledge
  where city = filter_city and 1 - (embedding <=> query_embedding) > match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;
