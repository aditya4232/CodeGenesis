# ✅ VERCEL DEPLOYMENT CHECKLIST - Print This!

## 🚀 **Follow in Order:**

---

### **□ STEP 1: Go to Vercel**
- [ ] Open: https://vercel.com/new
- [ ] Sign in with GitHub

---

### **□ STEP 2: Import Repository**
- [ ] Find: **aditya4232/CodeGenesis**
- [ ] Click: **Import**

---

### **□ STEP 3: Configure Project** ⚠️ **CRITICAL!**

**Framework Preset:**
- [ ] Select: **Next.js**

**Root Directory:** ⚠️ **MOST IMPORTANT!**
- [ ] Click: **Edit**
- [ ] Type: `frontend`
- [ ] Verify it shows: `frontend` (not `./`)

**Build Settings:** (auto-detected, leave as is)
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `.next`
- [ ] Install Command: `npm install`

---

### **□ STEP 4: Environment Variables**

**Click: "Environment Variables" (expand section)**

**Option A: Bulk Add (Recommended)**
- [ ] Click: **"Bulk Add"** or **"Add Multiple"**
- [ ] Copy from: `frontend/.env.local`
- [ ] Paste all 12 variables
- [ ] Click: **Add**

**Option B: Manual Add**
- [ ] Add each variable one by one
- [ ] Select: Production, Preview, Development (all 3)
- [ ] Total: 12 variables

**Required Variables:**
```
✓ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
✓ CLERK_SECRET_KEY
✓ NEXT_PUBLIC_SUPABASE_URL
✓ NEXT_PUBLIC_SUPABASE_ANON_KEY
✓ SUPABASE_SERVICE_ROLE_KEY
✓ NEXT_PUBLIC_API_URL
✓ API_KEY_ENCRYPTION_SECRET
✓ CRON_SECRET
✓ NEXT_PUBLIC_CLERK_SIGN_IN_URL
✓ NEXT_PUBLIC_CLERK_SIGN_UP_URL
✓ NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL
✓ NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL
```

---

### **□ STEP 5: Deploy**
- [ ] Click: **Deploy** button
- [ ] Wait: 2-3 minutes
- [ ] Copy: Your Vercel URL (e.g., `https://codegenesis-xyz.vercel.app`)

---

### **□ STEP 6: Configure Clerk**
- [ ] Go to: https://dashboard.clerk.com
- [ ] Select: Your application
- [ ] Click: **Domains** (sidebar)
- [ ] Click: **Add Domain**
- [ ] Paste: Your Vercel URL
- [ ] Click: **Save**

---

### **□ STEP 7: Setup Database**
- [ ] Go to: https://supabase.com/dashboard
- [ ] Select: Your project
- [ ] Click: **SQL Editor**
- [ ] Open file: `frontend/supabase/schema_agent_conversations.sql`
- [ ] Copy: All contents
- [ ] Paste: Into SQL Editor
- [ ] Click: **Run**
- [ ] Verify: "Success" message

---

### **□ STEP 8: Test Deployment**
- [ ] Open: Your Vercel URL
- [ ] Check: Landing page loads (no errors)
- [ ] Click: **Sign Up**
- [ ] Test: Create account
- [ ] Test: Sign in
- [ ] Check: Dashboard loads

---

## ✅ **SUCCESS CRITERIA:**

✓ Build completed without errors  
✓ Landing page loads  
✓ No "Application error" message  
✓ Sign up/sign in works  
✓ Dashboard accessible  

---

## 🚨 **CRITICAL - DON'T FORGET:**

1. ⚠️ **Root Directory = `frontend`** (MOST IMPORTANT!)
2. ⚠️ **All 12 environment variables** (use bulk add)
3. ⚠️ **Add Vercel URL to Clerk domains**
4. ⚠️ **Run Supabase schema**

---

## ⏱️ **Timeline:**

```
Import repository      → 1 min
Configure settings     → 2 min
Add env variables      → 1 min (bulk) or 5 min (manual)
Deploy (automatic)     → 2-3 min
Configure Clerk        → 1 min
Setup database         → 1 min
Test                   → 2 min
─────────────────────────────
Total: ~10-15 minutes
```

---

## 📞 **Need Help?**

See: `DEPLOY_FROM_SCRATCH.md` for detailed instructions

---

**Print this and check off each step!** ✅
