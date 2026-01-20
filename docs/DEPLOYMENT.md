# Deployment Guide

## 🚀 Deploy to Vercel (Recommended)

Vercel is the easiest and fastest way to deploy Next.js applications with zero configuration.

### Prerequisites

1. **GitHub Account** (or GitLab/Bitbucket)
2. **Vercel Account** (free at [vercel.com](https://vercel.com))
3. **Supabase Project** (already set up)

### Step 1: Push Code to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - PushUp Challenge MVP"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/pushup-challenge.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings

### Step 3: Configure Environment Variables

In Vercel project settings → **Environment Variables**, add:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Important:** Add these for **Production**, **Preview**, and **Development** environments.

### Step 4: Configure Supabase Auth Redirect

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your Vercel URL to **Site URL**: `https://your-app.vercel.app`
3. Add to **Redirect URLs**: 
   - `https://your-app.vercel.app/auth/callback`
   - `https://your-app.vercel.app/**`

### Step 5: Deploy!

Click **"Deploy"** in Vercel. Your app will be live in ~2 minutes! 🎉

---

## 🔧 Alternative Deployment Options

### Deploy to Netlify

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. **New site from Git** → Import repository
4. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
5. Add environment variables in **Site settings** → **Environment variables**
6. Configure Supabase redirect URLs

### Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. **New Project** → **Deploy from GitHub repo**
3. Add environment variables
4. Railway auto-detects Next.js

### Self-Hosted (VPS)

```bash
# On your VPS
git clone https://github.com/YOUR_USERNAME/pushup-challenge.git
cd pushup-challenge
npm install
npm run build
npm start
```

Use PM2 for process management:
```bash
npm install -g pm2
pm2 start npm --name "pushup-challenge" -- start
pm2 save
pm2 startup
```

---

## ✅ Pre-Deployment Checklist

- [ ] All environment variables configured in Supabase
- [ ] Database schema created and RLS policies applied
- [ ] Supabase auth redirect URLs updated
- [ ] Code pushed to Git repository
- [ ] Environment variables added to deployment platform
- [ ] Test signup/login flow locally
- [ ] Test push-up logging
- [ ] Test challenge creation

---

## 🔐 Environment Variables Reference

Required variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_APP_URL=your_deployed_url
```

Optional (for OAuth):
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
```

---

## 🐛 Troubleshooting

### Build Fails
- Check environment variables are set
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

### Auth Not Working
- Verify Supabase redirect URLs match deployment URL
- Check environment variables are correct
- Ensure RLS policies are set up

### Database Errors
- Verify database schema is created
- Check RLS policies are applied
- Ensure user profile creation works

---

## 📊 Post-Deployment

1. **Monitor:** Check Vercel/Netlify logs for errors
2. **Test:** Test all features in production
3. **Domain:** Add custom domain if desired
4. **Analytics:** Set up Vercel Analytics (optional)

---

## 🎉 Success!

Your PushUp Challenge app is now live! Share it with friends and start building those habits! 💪

