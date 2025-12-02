# Database Setup Guide

## Issue
You're seeing a `500 Internal Server Error` when trying to fetch or create projects. This is because the Supabase database tables haven't been created yet.

## Solution

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click on "SQL Editor" in the left sidebar

### Step 2: Run the Schema
1. Click "New Query"
2. Copy the entire contents of `supabase/schema.sql` from this project
3. Paste it into the SQL editor
4. Click "Run" or press `Ctrl+Enter`

### Step 3: Verify Tables
1. Go to "Table Editor" in the left sidebar
2. You should see these tables:
   - `profiles`
   - `projects`
   - `generations`
   - `user_settings`

### Step 4: Test the Application
1. Refresh your browser
2. Try creating a new project
3. The error should be resolved

## Alternative: Quick SQL

If you don't want to use the full schema file, here's a minimal version to get started:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT UNIQUE NOT NULL,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    tech_stack TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'planning',
    repository_url TEXT,
    deployment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE
);

-- Create generations table
CREATE TABLE IF NOT EXISTS generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    prompt TEXT NOT NULL,
    generated_code JSONB,
    model_used TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT UNIQUE NOT NULL,
    preferences JSONB DEFAULT '{}',
    api_keys JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_project_id ON generations(project_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (Basic - you can customize these)
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can view their own projects" ON projects
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own projects" ON projects
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
    FOR DELETE USING (auth.uid()::text = user_id);
```

## Troubleshooting

### Error: "relation does not exist"
- The tables haven't been created. Run the SQL schema.

### Error: "foreign key constraint"
- You need to create a profile first. The API should handle this automatically, but you can manually insert:
  ```sql
  INSERT INTO profiles (user_id, email) VALUES ('your_clerk_user_id', 'your@email.com');
  ```

### Error: "permission denied"
- Check that RLS policies are set up correctly
- Verify that you're using the correct Supabase keys in `.env.local`

## Need Help?
Check the browser console and terminal for detailed error messages after the recent updates.
