# 🔧 RUNTIME ERROR FIX - Server Component Error

## ❌ **Current Error:**
```
Application error: a server-side exception has occurred while loading code-genesis-one.vercel.app
Digest: 670006b06
```

### 🚨 **CRITICAL: Next.js 15/16 & Clerk Incompatibility**

The error `TypeError: headers().get is not a function` is caused by using **Clerk v5** with **Next.js 15/16**.
Next.js 15+ has made `headers()` asynchronous, and Clerk v5 uses it synchronously.

**FIX:** You MUST upgrade Clerk to **v6**:
1. Run: `npm install @clerk/nextjs@latest`
2. Update `middleware.ts` to use `await auth.protect()` (already done in codebase).
3. Ensure all server-side `auth()` calls are `await auth()`.

---

## 🔍 **What This Means:**

This is a **server-side runtime error** - the build succeeded, but there's an error when the page loads. The error is hidden in production for security.

---

## 🎯 **Most Likely Causes:**

### **1. Missing Environment Variables** (Most Common)
Vercel might be missing critical environment variables:

**Check in Vercel Dashboard → Settings → Environment Variables:**
- ✅ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- ✅ `CLERK_SECRET_KEY`
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `API_KEY_ENCRYPTION_SECRET`
- ✅ `CRON_SECRET`

### **2. Clerk Configuration**
- Domain not added to Clerk
- Using test keys instead of production keys
- Clerk middleware failing

### **3. Supabase Connection**
- Database not accessible
- Missing tables
- RLS policies blocking access

---

## ✅ **IMMEDIATE FIXES:**

### **Fix 1: Check Vercel Logs**

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Click "Functions" tab
4. Look for error logs
5. Find the actual error message (not hidden there)

### **Fix 2: Add Missing Environment Variables**

If any variables are missing:

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add ALL variables from `.env.local`:

```bash
# Clerk (use test keys for now, upgrade later)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y3J1Y2lhbC13ZWV2aWwtNzUuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_XtBeRezTs74xLqSzDQE2W7gsOnsTlUN3BG6ZxIysE5

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ascinqawqgrsjmefnwos.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_euoSX6uuvU0rDrxVAYhIdA_K8-4eSeg
SUPABASE_SERVICE_ROLE_KEY=sb_secret_2tRxchBPnQ4i5KunwIYdkg_i2LQLGQ1

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000

# Security
API_KEY_ENCRYPTION_SECRET=codegenesis-super-secret-encryption-key-change-in-production-2024
CRON_SECRET=codegenesis-cron-secret-key-change-in-production-2024

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
```

3. Click "Save"
4. Redeploy (Deployments → ... → Redeploy)

### **Fix 3: Add Vercel Domain to Clerk**

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to "Domains"
4. Add your Vercel URL: `https://code-genesis-one.vercel.app`
5. Save

---

## 🔍 **How to Debug:**

### **Step 1: Check Vercel Function Logs**

The actual error message will be in the Vercel function logs:

1. Vercel Dashboard → Deployments → Latest → Functions
2. Look for red error messages
3. Find the stack trace

### **Step 2: Enable Development Mode Locally**

Test locally to see the full error:

```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` and check browser console for errors.

### **Step 3: Check Vercel Runtime Logs**

1. Vercel Dashboard → Logs (in sidebar)
2. Filter by "Errors"
3. Find the actual error message

---

## 🆘 **Common Errors & Solutions:**

### **Error: "Clerk publishable key not found"**
**Solution:** Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` to Vercel env vars

### **Error: "Supabase client error"**
**Solution:** 
- Add Supabase env vars
- Run database schema in Supabase

### **Error: "Module not found"**
**Solution:** Already fixed - files are now in git

### **Error: "Middleware failed"**
**Solution:** Add Vercel domain to Clerk

---

## 📋 **Quick Checklist:**

- [ ] All environment variables added to Vercel
- [ ] Vercel domain added to Clerk
- [ ] Supabase schema executed
- [ ] Check Vercel function logs for actual error
- [ ] Redeploy after adding env vars

---

## 🎯 **Next Steps:**

1. **Check Vercel Logs** - Find the actual error message
2. **Add Missing Env Vars** - Most likely cause
3. **Add Domain to Clerk** - Required for authentication
4. **Redeploy** - After fixing

---

## 💡 **Pro Tip:**

The error digest `670006b06` is unique to this error instance. If you share the Vercel function logs, I can help identify the exact issue!

---

**The build succeeded, so we're 90% there! Just need to fix the runtime configuration.** 🚀

---

## 📞 **What to Do Right Now:**

1. Go to Vercel Dashboard → Your Project → Deployments → Latest
2. Click "Functions" tab
3. Look for error logs
4. Share the error message (or screenshot)
5. I'll help you fix it immediately!

**Most likely it's just missing environment variables!** ✅
