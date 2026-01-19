# 🚀 Vercel Deployment Guide - Frontend in Subfolder

## ✅ Your Setup is Correct!

Your project structure with `frontend/` and `backend/` folders is **perfectly fine** for Vercel deployment. Here's how it works:

---

## 📁 Project Structure

```
CodeGenesis/
├── frontend/          # Next.js app (deploys to Vercel)
│   ├── app/
│   ├── components/
│   ├── package.json
│   └── next.config.ts
├── backend/           # Python backend (already on Supabase)
├── vercel.json        # ✅ Updated to point to frontend/
└── README.md
```

---

## 🔧 Two Ways to Deploy

### **Option 1: Vercel Dashboard (Recommended - Easier)**

1. **Connect GitHub:**
   - Go to [Vercel Dashboard](https://vercel.com/new)
   - Click "Import Project"
   - Select your GitHub repository

2. **Configure Build Settings:**
   ```
   Framework Preset: Next.js
   Root Directory: frontend    ← IMPORTANT!
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

3. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add all variables from `.env.production.template`
   - Click "Deploy"

4. **Done!** ✅
   - Vercel will auto-deploy on every push to `main` branch
   - You'll get a URL like: `https://your-project.vercel.app`

---

### **Option 2: vercel.json (Already Configured)**

I've updated your `vercel.json` to automatically handle the frontend folder:

```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/.next",
  "installCommand": "cd frontend && npm install",
  "framework": "nextjs",
  "crons": [...]
}
```

**With this config:**
- ✅ Just push to GitHub
- ✅ Vercel auto-detects the config
- ✅ Builds from `frontend/` folder
- ✅ Deploys automatically

---

## 🔄 Auto-Deployment Flow

```
You push to GitHub
    ↓
Vercel detects push
    ↓
Reads vercel.json
    ↓
Runs: cd frontend && npm install
    ↓
Runs: cd frontend && npm run build
    ↓
Deploys frontend/.next
    ↓
Your site is live! 🎉
```

**Backend stays on Supabase** - no changes needed!

---

## 🔐 Clerk Production Keys - Important!

You're **absolutely right** - Clerk needs your domain for production keys!

### **How to Get Clerk Production Keys:**

#### **Step 1: Deploy First (Use Test Keys)**
```bash
# For first deployment, use your existing test keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

This will give you a Vercel URL like: `https://codegenesis-xyz.vercel.app`

#### **Step 2: Add Domain to Clerk**

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **"Domains"** (in sidebar)
4. Click **"Add Domain"**
5. Add your Vercel URL:
   ```
   https://codegenesis-xyz.vercel.app
   ```
6. Click **"Add Domain"**

#### **Step 3: Switch to Production**

1. In Clerk Dashboard, toggle to **"Production"** mode (top right)
2. Go to **"API Keys"**
3. Copy your production keys:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   CLERK_SECRET_KEY=sk_live_...
   ```

#### **Step 4: Update Vercel Environment Variables**

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update the Clerk keys to production keys
3. Redeploy (Vercel will auto-redeploy on next push, or click "Redeploy" button)

---

## 📋 Complete Deployment Checklist

### **Before First Deploy:**

- [ ] Push code to GitHub
- [ ] Connect repository to Vercel
- [ ] Set Root Directory to `frontend`
- [ ] Add environment variables (can use test keys initially)
- [ ] Deploy!

### **After First Deploy:**

- [ ] Get your Vercel URL
- [ ] Add Vercel URL to Clerk domains
- [ ] Switch Clerk to production mode
- [ ] Get production keys
- [ ] Update Vercel environment variables
- [ ] Redeploy (or wait for next push)

### **Database Setup:**

- [ ] Go to Supabase Dashboard
- [ ] Run `frontend/supabase/schema_agent_conversations.sql`
- [ ] Verify tables created

---

## 🎯 Quick Deploy Steps (Start to Finish)

### **1. Push to GitHub**
```bash
git add .
git commit -m "Production ready - all issues fixed"
git push origin main
```

### **2. Deploy to Vercel**
- Import from GitHub
- Set Root Directory: `frontend`
- Add environment variables (use test keys for now)
- Deploy

### **3. Configure Clerk**
- Get Vercel URL from deployment
- Add URL to Clerk domains
- Switch to production mode
- Get production keys
- Update Vercel env vars

### **4. Setup Database**
- Run Supabase schema
- Test the app!

---

## ⚡ Environment Variables Needed

### **Minimum for First Deploy (Test Keys OK):**
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_SUPABASE_URL=https://ascinqawqgrsjmefnwos.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
NEXT_PUBLIC_API_URL=https://your-backend-url.com
API_KEY_ENCRYPTION_SECRET=<generate-new>
CRON_SECRET=<generate-new>
```

### **After Getting Vercel URL (Production Keys):**
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...  ← Update
CLERK_SECRET_KEY=sk_live_...                    ← Update
# ... rest stays the same
```

---

## 🔄 Auto-Deploy on Push

Once configured, **every push to main branch** will:
1. ✅ Trigger Vercel build
2. ✅ Build from `frontend/` folder
3. ✅ Deploy automatically
4. ✅ Update your live site

**No manual deployment needed!**

---

## 🆘 Troubleshooting

### **"Build failed" on Vercel:**
- Check Root Directory is set to `frontend`
- Verify environment variables are set
- Check build logs for specific errors

### **"Clerk authentication not working":**
- Verify domain is added in Clerk dashboard
- Check you're using correct keys (test vs production)
- Ensure redirect URLs match your domain

### **"Backend API not responding":**
- Update `NEXT_PUBLIC_API_URL` to production backend
- Ensure backend is deployed and accessible
- Check CORS settings on backend

---

## 💡 Pro Tips

1. **Use Test Keys First:** Deploy with test keys, then upgrade to production
2. **Custom Domain:** Add your own domain in Vercel settings later
3. **Preview Deployments:** Every PR gets a preview URL automatically
4. **Environment Variables:** Can be different for Production/Preview/Development

---

## ✅ Summary

**Your setup is perfect!** Here's what happens:

1. ✅ `vercel.json` points to `frontend/` folder
2. ✅ Push to GitHub triggers auto-deploy
3. ✅ Vercel builds only the frontend
4. ✅ Backend stays on Supabase (separate)
5. ✅ Use test keys first, then upgrade to production keys after getting domain

**You're ready to deploy!** 🚀

---

## 📞 Next Steps

1. Push to GitHub
2. Import to Vercel (set Root Directory: `frontend`)
3. Deploy with test keys
4. Get Vercel URL
5. Add URL to Clerk
6. Update to production keys
7. Celebrate! 🎉

**Good luck with your deployment!** 🍀
