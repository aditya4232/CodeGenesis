# Authentication & Database Setup Guide

This guide will help you set up Clerk authentication and Supabase database for CodeGenesis.

## 🔐 Clerk Authentication Setup

### 1. Create a Clerk Account
1. Go to [clerk.com](https://clerk.com) and sign up
2. Create a new application
3. Choose "Next.js" as your framework

### 2. Get Your API Keys
1. In your Clerk dashboard, go to **API Keys**
2. Copy the following keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

### 3. Update Environment Variables
Open `frontend/.env.local` and update:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
```

### 4. Configure Clerk Settings
In your Clerk dashboard:
1. Go to **Paths** and set:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/dashboard`
   - After sign-up URL: `/dashboard`

2. Go to **Appearance** and customize to match your brand (optional)

## 🗄️ Supabase Database Setup

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up
2. Click "New Project"
3. Fill in project details and wait for setup to complete

### 2. Get Your API Keys
1. In your project dashboard, go to **Settings** → **API**
2. Copy the following:
   - `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
   - `anon public` key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - `service_role` key (SUPABASE_SERVICE_ROLE_KEY)

### 3. Update Environment Variables
Open `frontend/.env.local` and update:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4. Create Database Tables
Run the following SQL in your Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    api_key TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Projects Table
CREATE TABLE projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    tech_stack TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'completed', 'deployed')),
    repository_url TEXT,
    deployment_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

-- RLS Policies for projects
CREATE POLICY "Users can view their own projects"
    ON projects FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own projects"
    ON projects FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own projects"
    ON projects FOR UPDATE
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own projects"
    ON projects FOR DELETE
    USING (auth.uid()::text = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 5. Set Up Clerk Webhook (Optional but Recommended)
To automatically create user profiles when users sign up:

1. In Clerk dashboard, go to **Webhooks**
2. Click "Add Endpoint"
3. Set endpoint URL to: `https://your-domain.com/api/webhooks/clerk`
4. Subscribe to `user.created` event
5. Copy the signing secret

Create `frontend/app/api/webhooks/clerk/route.ts`:
```typescript
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createUserProfile } from '@/lib/supabase';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env.local');
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  if (evt.type === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    
    await createUserProfile({
      user_id: id,
      email: email_addresses[0].email_address,
      full_name: `${first_name || ''} ${last_name || ''}`.trim(),
      avatar_url: image_url,
    });
  }

  return new Response('', { status: 200 });
}
```

## 🚀 Testing Your Setup

### 1. Start the Development Server
```bash
cd frontend
npm run dev
```

### 2. Test Authentication
1. Go to `http://localhost:3000`
2. Click "Get Started" or "Sign Up"
3. Create a new account
4. You should be redirected to `/dashboard`

### 3. Verify Database
1. Go to your Supabase dashboard
2. Navigate to **Table Editor**
3. Check `user_profiles` table - you should see your new user

### 4. Test User Profile
1. In the dashboard, your name and email should appear in the header
2. Click on your profile picture to access user settings

## 🔧 Troubleshooting

### Clerk Issues
- **"Invalid publishable key"**: Make sure you're using the correct key from your Clerk dashboard
- **Redirect not working**: Check your Clerk dashboard paths configuration
- **Styling issues**: The dark theme is configured in `app/layout.tsx`

### Supabase Issues
- **"Invalid API key"**: Verify you copied the correct keys from Settings → API
- **RLS errors**: Make sure you ran all the SQL commands, including RLS policies
- **Connection timeout**: Check your project URL is correct and project is active

### General Issues
- **Environment variables not loading**: Restart your dev server after updating `.env.local`
- **TypeScript errors**: Run `npm install` to ensure all dependencies are installed
- **Build errors**: Clear `.next` folder and rebuild: `rm -rf .next && npm run build`

## 📚 Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## 🎯 Next Steps

After setup is complete:
1. Customize your Clerk appearance to match your brand
2. Add custom user metadata in Clerk
3. Create additional database tables as needed
4. Set up email templates in Clerk
5. Configure OAuth providers (Google, GitHub, etc.)
6. Set up Supabase Storage for file uploads
7. Configure Supabase Edge Functions for serverless operations

---

**Need Help?** Check our [Discord community](https://discord.gg/codegenesis) or [GitHub Discussions](https://github.com/aditya4232/CodeGenesis/discussions)
