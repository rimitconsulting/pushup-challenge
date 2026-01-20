# Quick Deployment Guide

## 🚀 Deploy to Vercel (Easiest - 5 minutes)

### Step 1: Push to GitHub

```bash
# If not already a git repo
git init
git add .
git commit -m "PushUp Challenge MVP"

# Create repo on GitHub, then:
git remote add origin https://github.com/rimitconsulting/pushup-challenge.git
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → Sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
   - `NEXT_PUBLIC_APP_URL` = https://your-app.vercel.app (auto-filled)
5. Click **"Deploy"**

### Step 3: Update Supabase Auth URLs

In Supabase Dashboard → Authentication → URL Configuration:
- **Site URL:** `https://your-app.vercel.app`
- **Redirect URLs:** Add `https://your-app.vercel.app/auth/callback`

### Done! 🎉 Your app is live!

For detailed instructions, see `docs/DEPLOYMENT.md`

