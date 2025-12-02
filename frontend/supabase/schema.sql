-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES TABLE (Synced with Clerk)
create table public.profiles (
  id text primary key, -- Clerk User ID
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PROJECTS TABLE
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id text references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  status text default 'in_progress' check (status in ('in_progress', 'completed', 'deployed', 'archived')),
  tech_stack text[] default '{}',
  repo_url text,
  preview_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- GENERATIONS TABLE (Chat History / Code Versions)
create table public.generations (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id text references public.profiles(id) on delete cascade not null,
  prompt text not null,
  code text,
  model text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- USER SETTINGS (Preferences)
create table public.user_settings (
  user_id text references public.profiles(id) on delete cascade primary key,
  theme text default 'dark',
  default_model text default 'gpt-4o',
  api_keys_configured boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.generations enable row level security;
alter table public.user_settings enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (id = auth.uid()::text); -- Note: auth.uid() depends on how we authenticate. With Clerk, we might need a custom claim or just trust the backend.

-- For now, since we access via Supabase Client with a Service Role or Anon Key, we need to be careful.
-- If using Clerk + Supabase integration, we can use JWT.
-- If using simple client-side calls, we need to ensure the user_id matches.

-- Let's assume we use the 'anon' key but filter by user_id in the query, 
-- AND we trust the client to send the correct user_id (which is insecure).
-- PROPER WAY: Use Supabase Auth or Custom JWT from Clerk.
-- Since user wants "proper authentication", we should set up Clerk -> Supabase JWT.

-- However, for this beta, we might just allow authenticated users to access their own data.
-- We'll define policies assuming 'auth.uid()' maps to the Clerk ID if we set up the integration.
-- If not, we might need to disable RLS or use a service role wrapper in the API routes.

-- For the API Routes (Backend), we use the Service Role Key, so RLS is bypassed.
-- For the Frontend (Client), we need RLS.

-- Let's define policies based on a hypothetical 'user_id' claim or just open for now if we can't easily set up JWT in this environment.
-- Actually, the best way for "proper" auth without full JWT setup right now is to proxy all DB calls through our Next.js API routes, 
-- where we verify the Clerk session and then use the Service Role key.

-- So, I will create API routes for Projects as well, to be secure.

-- FUNCTIONS
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- TRIGGER for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

create trigger update_profiles_updated_at before update on public.profiles for each row execute procedure update_updated_at_column();
create trigger update_projects_updated_at before update on public.projects for each row execute procedure update_updated_at_column();
create trigger update_user_settings_updated_at before update on public.user_settings for each row execute procedure update_updated_at_column();
