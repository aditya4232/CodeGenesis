# CodeGenesis Frontend - Setup & Integration Guide

## 🎉 What's New

### ✅ Completed Integrations

1. **Clerk Authentication** - Full user authentication system
2. **Supabase Database** - User profiles and project management
3. **Enhanced UI/UX** - Modern, professional design across all pages
4. **Common Components** - Navbar and Footer shared across all pages
5. **Protected Routes** - Dashboard accessible only to authenticated users
6. **User Profile Management** - Complete user data handling

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Get from [Clerk Dashboard](https://dashboard.clerk.com)
- `CLERK_SECRET_KEY` - Get from Clerk Dashboard
- `NEXT_PUBLIC_SUPABASE_URL` - Get from [Supabase Dashboard](https://app.supabase.com)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Get from Supabase Dashboard
- `SUPABASE_SERVICE_ROLE_KEY` - Get from Supabase Dashboard (Settings → API)

### 3. Set Up Supabase Database

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Run the SQL schema from `AUTH_SETUP.md` (Database Tables section)

### 4. Configure Clerk

1. Go to your Clerk dashboard
2. Set the following paths:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/dashboard`
   - After sign-up URL: `/dashboard`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📁 Project Structure

```
frontend/
├── app/
│   ├── (public)/              # Public pages (no auth required)
│   │   ├── page.tsx           # Homepage
│   │   ├── pricing/           # Pricing page
│   │   ├── how-it-works/      # How it works page
│   │   ├── docs/              # Documentation
│   │   ├── terms/             # Terms & Conditions
│   │   ├── privacy/           # Privacy Policy
│   │   ├── sign-in/           # Sign-in page (Clerk)
│   │   ├── sign-up/           # Sign-up page (Clerk)
│   │   └── layout.tsx         # Public layout (Navbar + Footer)
│   │
│   ├── (dashboard)/           # Protected pages (auth required)
│   │   ├── dashboard/         # Main dashboard
│   │   ├── projects/          # Projects page
│   │   ├── editor/            # Code editor
│   │   ├── settings/          # User settings
│   │   └── layout.tsx         # Dashboard layout (Sidebar + Header)
│   │
│   ├── layout.tsx             # Root layout (Clerk provider)
│   ├── globals.css            # Global styles
│   └── loading.tsx            # Loading state
│
├── components/
│   ├── Navbar.tsx             # Main navigation (with auth)
│   ├── Footer.tsx             # Footer component
│   ├── Header.tsx             # Dashboard header (with user profile)
│   ├── Sidebar.tsx            # Dashboard sidebar
│   └── ui/                    # UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── lamp.tsx
│       ├── spotlight.tsx
│       └── ...
│
├── lib/
│   └── supabase.ts            # Supabase client & database operations
│
├── middleware.ts              # Route protection (Clerk)
├── .env.local                 # Environment variables (create this)
├── .env.example               # Environment variables template
└── AUTH_SETUP.md              # Detailed setup guide

```

## 🎨 Design System

### Colors
- **Primary**: `#6366f1` (Indigo)
- **Background**: `#09090b` (Near Black)
- **Foreground**: `#fafafa` (Off White)
- **Muted**: `#a1a1aa` (Gray)

### Components
All components use Tailwind CSS v4 with custom design tokens defined in `globals.css`.

### Animations
- Framer Motion for smooth transitions
- Hover effects on interactive elements
- Scroll-triggered animations

## 🔐 Authentication Flow

### Sign Up
1. User clicks "Get Started" or "Sign Up"
2. Redirected to `/sign-up`
3. Clerk handles authentication
4. User profile created in Supabase (via webhook or manual)
5. Redirected to `/dashboard`

### Sign In
1. User clicks "Sign In"
2. Redirected to `/sign-in`
3. Clerk authenticates user
4. Redirected to `/dashboard`

### Protected Routes
- All routes under `/dashboard/*` require authentication
- Middleware automatically redirects unauthenticated users to `/sign-in`
- Public routes: `/`, `/pricing`, `/how-it-works`, `/docs`, `/terms`, `/privacy`

## 💾 Database Operations

### User Profiles
```typescript
import { getUserProfile, createUserProfile, updateUserProfile } from '@/lib/supabase';

// Get user profile
const profile = await getUserProfile(userId);

// Create user profile
const newProfile = await createUserProfile({
  user_id: userId,
  email: 'user@example.com',
  full_name: 'John Doe',
});

// Update user profile
const updated = await updateUserProfile(userId, {
  full_name: 'Jane Doe',
});
```

### Projects
```typescript
import { getUserProjects, createProject, updateProject, deleteProject } from '@/lib/supabase';

// Get all user projects
const projects = await getUserProjects(userId);

// Create new project
const project = await createProject({
  user_id: userId,
  name: 'My App',
  description: 'A cool app',
  tech_stack: ['Next.js', 'TypeScript', 'Tailwind'],
  status: 'planning',
});

// Update project
const updated = await updateProject(projectId, {
  status: 'in_progress',
});

// Delete project
await deleteProject(projectId);
```

## 🎯 Key Features

### ✅ Implemented
- [x] Clerk authentication integration
- [x] Supabase database setup
- [x] User profile management
- [x] Protected routes with middleware
- [x] Common Navbar and Footer
- [x] Enhanced homepage with stats and testimonials
- [x] Professional pricing page
- [x] How it works page with CTA
- [x] Responsive design
- [x] Dark mode theme
- [x] Loading states
- [x] Error handling

### 🚧 In Progress
- [ ] Dashboard analytics
- [ ] Project CRUD operations in UI
- [ ] Real-time collaboration
- [ ] Code editor integration
- [ ] Deployment integration

### 📋 Planned
- [ ] Email notifications
- [ ] Team collaboration
- [ ] API key management
- [ ] Usage analytics
- [ ] Billing integration

## 🐛 Troubleshooting

### Common Issues

**1. "Invalid publishable key" error**
- Make sure you've copied the correct key from Clerk dashboard
- Check that `.env.local` exists and has the correct variables
- Restart the dev server after updating environment variables

**2. Database connection errors**
- Verify Supabase URL and keys are correct
- Check that you've run the SQL schema
- Ensure RLS policies are enabled

**3. Redirect loops**
- Check Clerk dashboard paths configuration
- Verify middleware.ts is correctly configured
- Clear browser cookies and try again

**4. Styling issues**
- Clear `.next` folder: `rm -rf .next`
- Rebuild: `npm run build`
- Check Tailwind CSS v4 is properly installed

## 📚 Documentation

- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- **Aditya Shenvi** - [LinkedIn](#)
- **Sneha Sah** - [LinkedIn](#)

---

**Need Help?** Check our [Discord community](#) or [GitHub Discussions](https://github.com/aditya4232/CodeGenesis/discussions)
