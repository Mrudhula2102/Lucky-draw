# Supabase Authentication Setup Guide

This guide will help you integrate Supabase authentication with the Lucky Draw Frontend.

## 📋 Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js and npm installed
- Lucky Draw Frontend project set up

## 🚀 Step-by-Step Setup

### Step 1: Install Supabase Dependency

The Supabase client library has already been added to the project. Install it by running:

```bash
npm install
```

### Step 2: Get Your Supabase Credentials

1. Go to https://supabase.com and sign in
2. Create a new project or select an existing one
3. Go to **Project Settings** (gear icon in sidebar)
4. Navigate to **API** section
5. Copy the following:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJhbG...`)

### Step 3: Configure Environment Variables

1. Create a `.env` file in the project root (if it doesn't exist):
```bash
copy .env.example .env
```

2. Open `.env` and add your Supabase credentials:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=Lucky Draw
REACT_APP_VERSION=1.0.0

# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** Replace the placeholder values with your actual Supabase credentials.

### Step 4: Set Up Authentication in Supabase

1. In your Supabase dashboard, go to **Authentication** → **Users**
2. Click **Add User** to create a test user
3. Enter:
   - Email: `admin@example.com` (or your preferred email)
   - Password: Create a secure password
   - Check "Auto Confirm User" (for testing)

### Step 5: Configure Email Settings (Optional)

For production, configure email templates:

1. Go to **Authentication** → **Email Templates**
2. Customize the confirmation and password reset emails
3. Configure SMTP settings in **Project Settings** → **Auth**

### Step 6: Restart Development Server

After updating the `.env` file:

```bash
# Stop the server (Ctrl+C if running)
npm start
```

## 🔐 How It Works

### Login Flow

1. User enters email and password
2. Application calls `supabase.auth.signInWithPassword()`
3. Supabase validates credentials
4. On success:
   - User data is retrieved
   - Session token is stored
   - User is redirected to dashboard
5. On failure:
   - Error message is displayed

### User Data Structure

The application extracts the following from Supabase:

```typescript
{
  id: data.user.id,                    // Supabase user ID
  email: data.user.email,              // User email
  name: data.user.user_metadata?.name, // Display name
  role: data.user.user_metadata?.role, // User role
  createdAt: data.user.created_at,     // Account creation date
  twoFactorEnabled: false              // 2FA status
}
```

### Session Management

- Session token is stored in Zustand store
- Token is persisted in localStorage
- Token is automatically included in API requests

## 🎯 Testing Authentication

### Test Login

1. Start the development server: `npm start`
2. Navigate to http://localhost:3000
3. Enter your Supabase user credentials
4. Click "Sign In"
5. You should be redirected to the dashboard

### Test Logout

1. Click on your user avatar in the top right
2. Click "Logout"
3. You should be redirected to the login page
4. Session should be cleared

## 🔧 Advanced Configuration

### Adding User Metadata

To store additional user information in Supabase:

1. When creating a user, add metadata:
```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    data: {
      name: 'John Doe',
      role: 'ADMIN',
    }
  }
})
```

### Role-Based Access Control

Update user metadata to include roles:

1. In Supabase dashboard, go to **Authentication** → **Users**
2. Click on a user
3. Edit **User Metadata** (Raw JSON):
```json
{
  "name": "Admin User",
  "role": "SUPER_ADMIN"
}
```

Available roles:
- `SUPER_ADMIN` - Full access
- `ADMIN` - Administrative access
- `MODERATOR` - Limited access

### Password Reset Flow

To implement password reset:

```typescript
// Request password reset
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'http://localhost:3000/reset-password',
});
```

### Social Authentication (Optional)

Enable social providers in Supabase:

1. Go to **Authentication** → **Providers**
2. Enable providers (Google, GitHub, etc.)
3. Configure OAuth credentials
4. Update login page to include social login buttons

## 🛡️ Security Best Practices

### Environment Variables

- ✅ Never commit `.env` file to version control
- ✅ Use different credentials for development and production
- ✅ Rotate API keys regularly
- ✅ Use Row Level Security (RLS) in Supabase

### Row Level Security (RLS)

Enable RLS on your Supabase tables:

```sql
-- Enable RLS on a table
ALTER TABLE contests ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Users can view their own contests"
ON contests FOR SELECT
USING (auth.uid() = created_by);
```

### API Key Security

- The `anon` key is safe to use in frontend code
- Never expose the `service_role` key in frontend
- Use Supabase RLS policies to secure data access

## 🐛 Troubleshooting

### Issue: "Invalid API key"

**Solution:**
- Verify your API key is correct in `.env`
- Make sure you're using the `anon` key, not `service_role`
- Restart the development server after changing `.env`

### Issue: "User not found"

**Solution:**
- Verify the user exists in Supabase dashboard
- Check that email confirmation is not required
- Ensure the user is not disabled

### Issue: "Network request failed"

**Solution:**
- Check your internet connection
- Verify the Supabase URL is correct
- Check Supabase service status

### Issue: Environment variables not loading

**Solution:**
```bash
# Stop the server
# Delete .env and recreate it
# Restart the server
npm start
```

## 📊 Monitoring Authentication

### View Active Sessions

In Supabase dashboard:
1. Go to **Authentication** → **Users**
2. Click on a user to see active sessions
3. You can manually revoke sessions if needed

### Authentication Logs

Check authentication events:
1. Go to **Logs** in Supabase dashboard
2. Filter by authentication events
3. Monitor login attempts and errors

## 🔄 Migration from Mock Auth

The application has been updated from mock authentication to Supabase. Key changes:

1. ✅ Supabase client initialized in `src/lib/supabase.ts`
2. ✅ Login component updated to use Supabase auth
3. ✅ Environment variables added for configuration
4. ✅ User data structure maintained for compatibility

## 📝 Next Steps

After setting up authentication:

1. ✅ Test login with your Supabase credentials
2. ✅ Create additional users for testing
3. ✅ Set up user roles and permissions
4. ✅ Configure email templates
5. ✅ Enable Row Level Security on database tables
6. ✅ Implement password reset functionality
7. ✅ Add social authentication (optional)

## 📞 Support

- **Supabase Docs**: https://supabase.com/docs/guides/auth
- **Supabase Discord**: https://discord.supabase.com
- **Project Issues**: Check TROUBLESHOOTING.md

---

**Your Supabase authentication is now configured! 🎉**

Simply add your credentials to the `.env` file and start using real authentication.
