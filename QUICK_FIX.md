# 🚀 QUICK FIX - 10 Minutes to Working App

## ✅ BUILD SUCCEEDED! Just need runtime config.

---

## 🎯 **DO THIS NOW (10 minutes):**

### 🚀 **THE ULTIMATE FIX (Do THIS first):**

1. **UPGRADE CLERK:**
   - In `frontend/package.json`, change `@clerk/nextjs` to `^6.0.0` (Already done in code).
   - In Vercel, this will automatically install the new version on next deploy.

2. **REDEPLOY:**
   - Go to Vercel → Deployments → Click "Redeploy".

---


### **1. Add Environment Variables to Vercel (5 min)**

Go to: [Vercel Dashboard](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables

Click "Add New" for each:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_test_Y3J1Y2lhbC13ZWV2aWwtNzUuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY = sk_test_XtBeRezTs74xLqSzDQE2W7gsOnsTlUN3BG6ZxIysE5
NEXT_PUBLIC_SUPABASE_URL = https://ascinqawqgrsjmefnwos.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = sb_publishable_euoSX6uuvU0rDrxVAYhIdA_K8-4eSeg
SUPABASE_SERVICE_ROLE_KEY = sb_secret_2tRxchBPnQ4i5KunwIYdkg_i2LQLGQ1
NEXT_PUBLIC_API_URL = http://localhost:8000
API_KEY_ENCRYPTION_SECRET = codegenesis-super-secret-encryption-key-change-in-production-2024
CRON_SECRET = codegenesis-cron-secret-key-change-in-production-2024
NEXT_PUBLIC_CLERK_SIGN_IN_URL = /sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL = /sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL = /dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL = /dashboard
```

For each: Select "Production, Preview, Development" → Save

---

### **2. Add Domain to Clerk (2 min)**

Go to: [Clerk Dashboard](https://dashboard.clerk.com) → Your App → Domains

Click "Add Domain" → Enter: `https://code-genesis-one.vercel.app` → Save

---

### **3. Run Database Schema (2 min)**

Go to: [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → SQL Editor

Copy/paste from: `frontend/supabase/schema_agent_conversations.sql` → Run

---

### **4. Redeploy (1 min)**

Go to: Vercel Dashboard → Deployments → ... (three dots) → Redeploy

---

## ✅ **DONE! App will work after redeploy!**

---

## 🔍 **If Still Broken:**

Check Vercel logs:
1. Vercel Dashboard → Deployments → Latest → Functions
2. Look for red error messages
3. Share the error

---

## 📊 **Progress:**

✅ Build fixed  
✅ Files committed  
✅ Deployed  
⚠️ Runtime config needed ← **YOU ARE HERE**  
⬜ Fully working  

**10 minutes to finish line!** 🏁
