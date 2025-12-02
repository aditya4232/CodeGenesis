# Deployment Guide (Vercel)

## Prerequisites

1.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
2.  **GitHub Repository**: Push this code to a GitHub repository.
3.  **Supabase Project**: You have your Supabase project set up.
4.  **Clerk Application**: You have your Clerk application set up.

## Environment Variables

When deploying to Vercel, you must add the following Environment Variables in the Vercel Project Settings:

### Authentication (Clerk)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: (From Clerk Dashboard)
- `CLERK_SECRET_KEY`: (From Clerk Dashboard)
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`: `/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`: `/sign-up`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`: `/dashboard`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`: `/dashboard`

### Database (Supabase)
- `NEXT_PUBLIC_SUPABASE_URL`: `https://ascinqawqgrsjmefnwos.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `sb_publishable_...` (Your provided key)
- `SUPABASE_SERVICE_ROLE_KEY`: `sb_secret_...` (Your provided secret key)

### Backend API
- `NEXT_PUBLIC_API_URL`: `https://your-vercel-project.vercel.app` (Update this after deployment)

## Database Setup

1.  Go to your Supabase Dashboard -> SQL Editor.
2.  Copy the content of `supabase/schema.sql`.
3.  Run the SQL query to set up the tables and policies.

## Deployment Steps

1.  **Push to GitHub**:
    ```bash
    git add .
    git commit -m "Ready for deployment"
    git push origin main
    ```

2.  **Import in Vercel**:
    -   Go to Vercel Dashboard -> Add New -> Project.
    -   Select your GitHub repository.

3.  **Configure Project**:
    -   **Framework Preset**: Next.js
    -   **Root Directory**: `frontend` (Since your Next.js app is in the `frontend` folder).
    -   **Environment Variables**: Add all variables listed above.

4.  **Deploy**: Click "Deploy".

## Troubleshooting

-   **Build Errors**: Check the Vercel logs. Ensure all dependencies are in `package.json`.
-   **Database Connection**: Verify `SUPABASE_SERVICE_ROLE_KEY` is correct.
-   **Authentication**: Ensure Clerk "Allowed Origins" includes your Vercel domain.
