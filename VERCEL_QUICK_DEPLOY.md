# Vercel Deployment Guide - Quick Steps

## ✅ GitHub Updated Successfully!

The Vercel configuration has been pushed to GitHub. Now let's deploy to Vercel.

---

## 🚀 Deploy to Vercel

### Step 1: Go to Vercel Dashboard
1. Open: https://vercel.com/dashboard
2. Click "Add New Project"

### Step 2: Import Your GitHub Repository
1. Select: `workstaion27-png/EliteDrops-Ecommerce-Platform`
2. Click "Import"

### Step 3: Configure Project Settings

**Framework Preset:** Next.js (auto-detected)

**Build Command:** `npm run build`

**Output Directory:** `.next`

### Step 4: Add Environment Variables ⚠️ CRITICAL

Click "Environment Variables" and add ALL these variables:

```
# Supabase (Project: niodbejcakihgjdptgyw)
NEXT_PUBLIC_SUPABASE_URL=https://niodbejcakihgjdptgyw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pb2RiZWpjYWtpaGdqZHB0Z3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0ODU0OTAsImV4cCI6MjA4MjA2MTQ5MH0.GLuX6aA9UJegbi2jeLCgGZrz_PTgpj1yKEKVycBWjJw

# CJ Dropshipping
CJ_APP_KEY=CJ4990471
CJ_SECRET_KEY=@api@f291f4ea4b7e4b88b816656fef7d7aa8
CJ_PARTNER_ID=CJ4990471

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID=Afci_08L6xFO22HB8UKZh0TZ3gDhONQ7w6yy376gtR522RRNBPqifomIq8O8Z2wFfiCw1o-lZsT8ihMs
PAYPAL_CLIENT_SECRET=EMpcrKTla8uJjMkzPy6iKSIF8RZ3XBJeQIYbT7mVIknu2JmHyEXWyYncLeoQqxf479-2-6Lui1_HeLOm

# Stripe (Optional - for future)
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_SECRET_KEY=sk_test_your_stripe_key

# Security
JWT_SECRET=luxuryhub-super-secret-jwt-key-2025-luxuryhub-ecommerce-platform
ENCRYPTION_KEY=luxuryhub-encryption-key-2025-secure-crypto-key

# Store Settings
STORE_NAME=LuxuryHub
STORE_URL=https://yourdomain.com
STORE_CURRENCY=USD
STORE_TAX_RATE=0.08

# Admin (Temporary)
ADMIN_EMAIL=admin@luxuryhub.com
ADMIN_PASSWORD=luxuryhub-admin-secure-password-2025
```

**Important:** Check "Automatically expose relevant Environment Variables" if available

### Step 5: Deploy
1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. Get your Vercel URL

---

## 🔗 Connect Custom Domain (Optional)

1. Go to Vercel Dashboard > Your Project > Settings > Domains
2. Add your custom domain
3. Configure DNS as instructed by Vercel

---

## ✅ Database Connection Status

Your database is properly configured:

- **Project URL:** https://niodbejcakihgjdptgyw.supabase.co
- **Tables Created:** ✅ All 16 tables are set up
- **RLS Policies:** ✅ Row Level Security enabled
- **API Ready:** ✅ Supabase API is accessible

**The website will automatically connect to Supabase** once you deploy with the environment variables above.

---

## 🔄 Future Updates

When you make code changes:

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Your message"
   git push origin main
   ```

2. **Vercel Auto-Deploy:**
   - Vercel will automatically detect changes
   - Deploy within 30-60 seconds
   - Check Vercel Dashboard for deployment status

---

## 🆘 Troubleshooting

**Build Fails?**
- Check Vercel Build Logs for errors
- Common issues: Missing environment variables, syntax errors

**Database Not Connecting?**
- Verify NEXT_PUBLIC_SUPABASE_URL is correct
- Check RLS policies in Supabase Dashboard

**PayPal Not Working?**
- Ensure PayPal sandbox/live keys are correct
- Check domain is registered in PayPal developer dashboard

---

## 📝 Quick Copy-Paste for Vercel

Copy this block for Vercel Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://niodbejcakihgjdptgyw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pb2RiZWpjYWtpaGdqZHB0Z3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0ODU0OTAsImV4cCI6MjA4MjA2MTQ5MH0.GLuX6aA9UJegbi2jeLCgGZrz_PTgpj1yKEKVycBWjJw
CJ_APP_KEY=CJ4990471
CJ_SECRET_KEY=@api@f291f4ea4b7e4b88b816656fef7d7aa8
CJ_PARTNER_ID=CJ4990471
NEXT_PUBLIC_PAYPAL_CLIENT_ID=Afci_08L6xFO22HB8UKZh0TZ3gDhONQ7w6yy376gtR522RRNBPqifomIq8O8Z2wFfiCw1o-lZsT8ihMs
PAYPAL_CLIENT_SECRET=EMpcrKTla8uJjMkzPy6iKSIF8RZ3XBJeQIYbT7mVIknu2JmHyEXWyYncLeoQqxf479-2-6Lui1_HeLOm
JWT_SECRET=luxuryhub-super-secret-jwt-key-2025-luxuryhub-ecommerce-platform
ENCRYPTION_KEY=luxuryhub-encryption-key-2025-secure-crypto-key
STORE_NAME=LuxuryHub
STORE_URL=https://yourdomain.com
STORE_CURRENCY=USD
STORE_TAX_RATE=0.08
```

---

**Done! Your site will be live on Vercel once deployed! 🎉**
