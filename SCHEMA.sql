-- LifeOS Database Schema

-- 1. Users Table (Extends Auth)
create table public.users (
  id uuid references auth.users not null primary key,
  settings jsonb default '{"voice_lang": "en-IN", "theme": "dark"}'::jsonb,
  weekly_digest_enabled boolean default true,
  created_at timestamptz default now()
);

-- 2. Daily Logs (The Quant Data)
create table public.daily_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  date date not null,
  
  -- Time Architecture (Hours)
  work_hours numeric(4,1) default 0,
  personal_hours numeric(4,1) default 0,
  health_hours numeric(4,1) default 0,
  sleep_hours numeric(4,1) default 0,
  
  -- Scores (1-10)
  work_score integer check (work_score >= 1 and work_score <= 10),
  personal_score integer check (personal_score >= 1 and personal_score <= 10),
  
  -- Voice Log
  transcript text,
  audio_url text, -- Optional: link to stored audio file
  
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- 3. Reflections (The Qual Data - Sentiment & Tags)
create table public.reflections (
  id uuid default gen_random_uuid() primary key,
  log_id uuid references public.daily_logs(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  
  type text check (type in ('work', 'personal', 'general')),
  sentiment_tags text[], -- Array of strings e.g. ['productive', 'anxious']
  learning text, -- "What did I learn?"
  improvement text, -- "What could be better?"
  
  created_at timestamptz default now()
);

-- 4. Weekly Reports (The AI Output)
create table public.weekly_reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  week_start_date date not null,
  week_end_date date not null,
  
  summary_text text, -- Markdown summary from Gemini
  metrics_json jsonb, -- Structured data for charts
  
  created_at timestamptz default now()
);

-- Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.daily_logs enable row level security;
alter table public.reflections enable row level security;
alter table public.weekly_reports enable row level security;

-- RLS Policies
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.users for insert with check (auth.uid() = id);

create policy "Users can view own logs" on public.daily_logs for select using (auth.uid() = user_id);
create policy "Users can insert own logs" on public.daily_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own logs" on public.daily_logs for update using (auth.uid() = user_id);

create policy "Users can view own reflections" on public.reflections for select using (auth.uid() = user_id);
create policy "Users can insert own reflections" on public.reflections for insert with check (auth.uid() = user_id);
create policy "Users can update own reflections" on public.reflections for update using (auth.uid() = user_id);

create policy "Users can view own reports" on public.weekly_reports for select using (auth.uid() = user_id);

-- Trigger to create user profile on auth signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
