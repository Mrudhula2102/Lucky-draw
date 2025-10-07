# Supabase Quick Setup - 3 Steps

## ⚡ Quick Start (5 Minutes)

### Step 1: Get Supabase Credentials

1. Go to https://supabase.com
2. Sign in or create account
3. Create a new project
4. Go to **Settings** → **API**
5. Copy:
   - **Project URL**
   - **anon public key**

### Step 2: Configure .env File

Create `.env` file in project root:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=Lucky Draw
REACT_APP_VERSION=1.0.0

# Supabase Configuration
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Replace** `xxxxx` with your actual Supabase project URL and key!

### Step 3: Create a User in Supabase

1. In Supabase dashboard → **Authentication** → **Users**
2. Click **Add User**
3. Enter:
   - Email: `admin@example.com`
   - Password: `YourSecurePassword123!`
   - ✅ Check "Auto Confirm User"
4. Click **Create User**

### Step 4: Test Login

```bash
# Restart the server
npm start
```

1. Open http://localhost:3000
2. Login with:
   - Email: `admin@example.com`
   - Password: `YourSecurePassword123!`
3. ✅ You're in!

---

## 🎯 What's Changed

### Before (Mock Auth)
- Any email/password worked
- No real authentication
- Demo data only

### Now (Supabase Auth)
- ✅ Real authentication with Supabase
- ✅ Secure user sessions
- ✅ Password validation
- ✅ Production-ready

---

## 📁 Files Modified

1. ✅ `package.json` - Added @supabase/supabase-js
2. ✅ `src/lib/supabase.ts` - Supabase client
3. ✅ `src/pages/auth/Login.tsx` - Updated login logic
4. ✅ `.env.example` - Added Supabase config

---

## 🔐 Your Credentials

**You need to provide:**

1. **REACT_APP_SUPABASE_URL**
   - From: Supabase Dashboard → Settings → API
   - Format: `https://xxxxx.supabase.co`

2. **REACT_APP_SUPABASE_ANON_KEY**
   - From: Supabase Dashboard → Settings → API
   - Format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## ✅ Checklist

- [ ] Created Supabase account
- [ ] Created new project in Supabase
- [ ] Copied Project URL
- [ ] Copied anon/public key
- [ ] Created `.env` file
- [ ] Added credentials to `.env`
- [ ] Created user in Supabase dashboard
- [ ] Restarted development server
- [ ] Tested login

---

## 🆘 Quick Troubleshooting

### Can't login?
- Check `.env` file has correct credentials
- Verify user exists in Supabase dashboard
- Restart server after changing `.env`

### "Invalid API key" error?
- Use `anon` key, NOT `service_role` key
- Check for typos in `.env`

### Environment variables not working?
```bash
# Stop server (Ctrl+C)
# Restart
npm start
```

---

## 📚 Full Documentation

For detailed setup: See **SUPABASE_SETUP.md**

---

**Ready to go! Just add your Supabase credentials to `.env` and you're set! 🚀**
