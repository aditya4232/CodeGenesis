# 🔧 VERCEL DEPLOYMENT FIX - URGENT!

## ❌ Error You're Getting:
```
sh: line 1: cd: frontend: No such file or directory
Error: Command "cd frontend && npm install" exited with 1
```

## ✅ SOLUTION: Configure in Vercel Dashboard

The `vercel.json` approach doesn't work well with subfolders. Use the **Vercel Dashboard** instead!

---

## 🚀 CORRECT DEPLOYMENT STEPS:

### **Step 1: Delete Current Deployment**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your project
3. Click on it → Settings → Delete Project (or just reconfigure)

### **Step 2: Re-import with Correct Settings**

1. **Go to:** https://vercel.com/new
2. **Import** your GitHub repository
3. **IMPORTANT:** Configure these settings:

```
Framework Preset: Next.js
Root Directory: frontend    ← CRITICAL! Click "Edit" and set this!
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Node.js Version: 18.x (or latest)
```

4. **Add Environment Variables** (click "Environment Variables"):

```bash
# Clerk (use test keys for now)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y3J1Y2lhbC13ZWV2aWwtNzUuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_XtBeRezTs74xLqSzDQE2W7gsOnsTlUN3BG6ZxIysE5

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ascinqawqgrsjmefnwos.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_euoSX6uuvU0rDrxVAYhIdA_K8-4eSeg
SUPABASE_SERVICE_ROLE_KEY=sb_secret_2tRxchBPnQ4i5KunwIYdkg_i2LQLGQ1

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000

# Security (generate new with: openssl rand -base64 32)
API_KEY_ENCRYPTION_SECRET=YOUR_GENERATED_SECRET_HERE
CRON_SECRET=YOUR_GENERATED_SECRET_HERE

# Clerk URLs (optional)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
```

5. **Click "Deploy"**

---

## 📸 Visual Guide:

### **Finding Root Directory Setting:**

When importing, you'll see:
```
┌─────────────────────────────────────┐
│ Configure Project                    │
├─────────────────────────────────────┤
│ Framework Preset: Next.js            │
│                                      │
│ Root Directory: ./        [Edit] ←── CLICK THIS!
│                                      │
│ Build Command: npm run build         │
│ Output Directory: .next              │
│ Install Command: npm install         │
└─────────────────────────────────────┘
```

**Click [Edit]** next to "Root Directory" and type: `frontend`

---

## ✅ What This Does:

When you set **Root Directory: frontend**, Vercel will:
1. Navigate to the `frontend/` folder
2. Run `npm install` there
3. Run `npm run build` there
4. Deploy the `.next` folder from there

**No need for `cd frontend` commands!**

---

## 🔄 After Fixing:

1. Push the updated `vercel.json` (I just fixed it):
   ```bash
   git add vercel.json
   git commit -m "Fix: Simplified vercel.json for dashboard config"
   git push origin main
   ```

2. Re-import in Vercel with **Root Directory: frontend**

3. Deploy will succeed! ✅

---

## 📋 Quick Checklist:

- [ ] Delete/reconfigure current Vercel project
- [ ] Re-import from GitHub
- [ ] Set **Root Directory: frontend** ← MOST IMPORTANT!
- [ ] Add all environment variables
- [ ] Deploy
- [ ] Success! 🎉

---

## 🆘 Still Having Issues?

### **Option A: Use Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend folder
cd frontend

# Deploy from there
vercel

# Follow prompts
```

### **Option B: Move frontend files to root**
(Not recommended - better to use Root Directory setting)

---

## 💡 Why This Happened:

The `vercel.json` with `cd frontend` commands doesn't work because:
- Vercel runs commands from the repository root
- The `cd` command in JSON doesn't persist between commands
- **Solution:** Use Vercel's built-in "Root Directory" setting instead

---

## ✅ CORRECT CONFIG:

**vercel.json** (simplified - I just updated it):
```json
{
  "crons": [
    {
      "path": "/api/agent/cleanup",
      "schedule": "0 0 * * *"
    }
  ]
}
```

**Vercel Dashboard Settings:**
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

---

## 🎯 Next Steps:

1. **Push the fixed vercel.json:**
   ```bash
   git add vercel.json
   git commit -m "Fix: Simplified vercel.json"
   git push origin main
   ```

2. **Go to Vercel Dashboard**
3. **Delete current project** (or reconfigure)
4. **Re-import** with **Root Directory: frontend**
5. **Add environment variables**
6. **Deploy!**

**This will work!** ✅

---

## 📞 Need Visual Help?

Check Vercel's official guide:
https://vercel.com/docs/projects/project-configuration#root-directory

**Screenshot of where to set Root Directory:**
- It's in the "Configure Project" step during import
- Look for "Root Directory" field
- Click "Edit" button
- Type: `frontend`
- Continue with deployment

---

**You're almost there! Just need to set Root Directory in the dashboard!** 🚀
