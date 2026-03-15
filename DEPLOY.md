# 🚀 fabb.booking — Complete Deployment Guide
## Ansil Dress House | ansilav78@gmail.com | GitHub: anssill

---

## ✅ WHAT YOU'LL HAVE AT THE END
- Live URL: `https://fabb-booking.vercel.app`
- Google login for Owner + staff email/password login
- Real Supabase PostgreSQL database (all data saved forever)
- Mobile PWA (install on phone like an app)
- WhatsApp message buttons for every customer

---

## STEP 1 — Set Up Supabase (10 minutes)

1. Go to **https://supabase.com** → Sign in
2. Click **"New Project"**
   - Name: `fabb-booking`
   - Password: (save this somewhere safe)
   - Region: **South Asia (Mumbai)** ← closest to Kerala
3. Wait 2 minutes for project to be created
4. Click **"SQL Editor"** (left sidebar)
5. Click **"New Query"**
6. Copy the ENTIRE contents of `supabase/schema.sql`
7. Paste it in and click **"Run"** ▶
8. You should see: `fabb.booking schema installed ✓`

### Get your Supabase keys:
1. Left sidebar → **Settings** → **API**
2. Copy these 3 values:
   ```
   Project URL:      https://xxxxx.supabase.co
   anon/public key:  eyJhbGci...  (under "Project API keys")
   service_role key: eyJhbGci...  (click "Reveal" to see it)
   ```

---

## STEP 2 — Set Up Google OAuth (10 minutes)

1. Go to **https://console.cloud.google.com**
2. Create a new project: **fabb-booking**
3. Left sidebar → **APIs & Services** → **Credentials**
4. Click **"+ CREATE CREDENTIALS"** → **OAuth client ID**
5. Application type: **Web application**
6. Name: `fabb-booking`
7. Authorized redirect URIs — add ALL of these:
   ```
   http://localhost:3000/api/auth/callback/google
   https://fabb-booking.vercel.app/api/auth/callback/google
   https://YOUR_SUPABASE_URL/auth/v1/callback
   ```
8. Click **Create** → Copy:
   ```
   Client ID:     xxxxx.apps.googleusercontent.com
   Client Secret: GOCSPX-xxxxx
   ```

### Also enable Google Auth in Supabase:
1. Supabase → **Authentication** → **Providers**
2. Find **Google** → Enable it
3. Paste your Google Client ID and Secret
4. Save

---

## STEP 3 — Set Up GitHub Repo (5 minutes)

1. Go to **https://github.com/anssill**
2. Click **"New repository"**
   - Name: `fabb-booking`
   - Private: ✅ (recommended)
   - Do NOT initialize with README
3. Click **Create repository**

### Push the code:
Open Terminal / Command Prompt on your computer:

```bash
# Navigate to the fabb-booking folder you downloaded
cd fabb-booking

# Initialize git
git init
git add .
git commit -m "Initial commit — fabb.booking cloth rental app"

# Connect to your GitHub repo
git remote add origin https://github.com/anssill/fabb-booking.git

# Push
git branch -M main
git push -u origin main
```

---

## STEP 4 — Deploy to Vercel (5 minutes)

1. Go to **https://vercel.com** → Sign in with GitHub
2. Click **"Add New Project"**
3. Select your **fabb-booking** repo
4. Framework: **Next.js** (auto-detected)
5. Click **"Environment Variables"** and add ALL of these:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` (anon key) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` (service key) |
| `NEXTAUTH_SECRET` | (click "Generate" or type 32 random chars) |
| `NEXTAUTH_URL` | `https://fabb-booking.vercel.app` |
| `GOOGLE_CLIENT_ID` | `xxxxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-xxxxx` |
| `NEXT_PUBLIC_OWNER_EMAIL` | `ansilav78@gmail.com` |
| `NEXT_PUBLIC_OWNER_WHATSAPP` | `+919999900000` |

6. Click **"Deploy"** 🚀
7. Wait ~3 minutes → Your app is LIVE!

---

## STEP 5 — First Login

1. Go to `https://fabb-booking.vercel.app`
2. Click **"Sign in with Google"**
3. Use **ansilav78@gmail.com** → You get **Owner** role automatically
4. All your sample data is already loaded!

---

## STEP 6 — Add Staff Logins

1. Go to **fabb-booking.vercel.app/login**
2. Click **"Staff Login"** tab
3. Or go to Supabase → **Authentication** → **Users** → **Invite user**
4. Enter staff email → They get an email to set password
5. After they sign up → Go to Supabase SQL Editor:

```sql
-- Set role for a staff member (run in Supabase SQL Editor)
UPDATE profiles SET role = 'wash' WHERE email = 'seema@example.com';
UPDATE profiles SET role = 'counter' WHERE email = 'ravi@example.com';
UPDATE profiles SET role = 'manager' WHERE email = 'manager@example.com';
```

### Role permissions:
| Role | Dashboard | Orders | Inventory | Customers | Washing | Settings |
|------|-----------|--------|-----------|-----------|---------|----------|
| **Owner** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| **Manager** | ✅ | ✅ Full | ✅ Full | ✅ Full | ✅ | ❌ |
| **Counter** | ✅ View | ✅ Create | ❌ | ✅ View | ❌ | ❌ |
| **Wash Staff** | ✅ View | ❌ | ❌ | ❌ | ✅ Full | ❌ |

---

## STEP 7 — Install on Phone (PWA)

### Android:
1. Open Chrome → go to `fabb-booking.vercel.app`
2. Tap the 3-dot menu (⋮) → **"Add to Home screen"**
3. Tap **Add** → App appears on home screen

### iPhone:
1. Open Safari → go to `fabb-booking.vercel.app`
2. Tap **Share** button (box with arrow) → **"Add to Home Screen"**
3. Tap **Add** → App appears on home screen

Works like a native app — opens full screen, works offline for viewing!

---

## STEP 8 — Custom Domain fabb.booking

1. Buy `fabb.booking` at **https://namecheap.com** or **https://godaddy.com**
2. Vercel → Your project → **Settings** → **Domains**
3. Add `fabb.booking`
4. Update your domain DNS:
   - Type: `CNAME`
   - Name: `@`
   - Value: `cname.vercel-dns.com`
5. Wait up to 24 hours for DNS to propagate
6. Update `NEXTAUTH_URL` in Vercel env vars to `https://fabb.booking`
7. Add `https://fabb.booking/api/auth/callback/google` to Google OAuth

---

## FUTURE UPDATES

Every time you want to update the app:
```bash
# Make changes to files, then:
git add .
git commit -m "Update: describe what changed"
git push
# Vercel auto-deploys in ~2 minutes
```

---

## SUPPORT

- Supabase docs: https://supabase.com/docs
- Vercel docs: https://vercel.com/docs
- NextAuth docs: https://next-auth.js.org
- Your GitHub: https://github.com/anssill/fabb-booking

---

Built with ❤️ for Ansil Dress House, Palakkad, Kerala
