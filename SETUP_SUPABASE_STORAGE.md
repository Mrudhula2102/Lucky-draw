# Setup Supabase Storage for QR Codes

## 🎯 Quick Setup (5 Minutes)

### Step 1: Create Storage Bucket in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `rnihpvwaugrekmkbvhlk`
3. Click **Storage** in the left sidebar
4. Click **New Bucket**
5. Enter bucket name: `contest-qr-codes`
6. Set **Public bucket**: ✅ **YES** (check this box)
7. Click **Create bucket**

### Step 2: Add qr_code_url Column to Database

Run this SQL in Supabase SQL Editor:

```sql
-- Add qr_code_url column to contests table
ALTER TABLE contests 
ADD COLUMN IF NOT EXISTS qr_code_url VARCHAR(500);

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'contests' AND column_name = 'qr_code_url';
```

### Step 3: Set Storage Policies (Allow Public Access)

Run this SQL:

```sql
-- Allow public access to read QR codes
CREATE POLICY "Public Access to QR Codes"
ON storage.objects FOR SELECT
USING (bucket_id = 'contest-qr-codes');

-- Allow authenticated users to upload QR codes
CREATE POLICY "Authenticated users can upload QR codes"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'contest-qr-codes');

-- Allow authenticated users to update QR codes
CREATE POLICY "Authenticated users can update QR codes"
ON storage.objects FOR UPDATE
USING (bucket_id = 'contest-qr-codes');
```

### Step 4: Test the Setup

1. Refresh your browser
2. Create a new contest
3. QR code should be automatically generated and uploaded
4. Click the QR code button to view it

## ✅ What Happens Now

When you create a contest:
1. ✅ Contest is created in database
2. ✅ QR code is generated with participation URL
3. ✅ QR code is uploaded to Supabase Storage bucket
4. ✅ Public URL is saved to `contests.qr_code_url`
5. ✅ QR code button shows the generated QR code

## 🔍 Verify Everything Works

### Check Storage Bucket:
1. Go to Supabase Dashboard → Storage
2. Click on `contest-qr-codes` bucket
3. You should see QR code images in `qr-codes/` folder

### Check Database:
```sql
SELECT contest_id, name, qr_code_url 
FROM contests 
WHERE qr_code_url IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
```

### Check QR Code URL:
- Copy a `qr_code_url` from the database
- Paste it in browser
- Should see the QR code image

## 📋 Features

### Automatic QR Code Generation:
- ✅ Generated when contest is created
- ✅ Contains participation URL: `https://yourapp.com/participate/{contest_id}`
- ✅ High quality (500x500 pixels)
- ✅ Error correction level: High

### QR Code Storage:
- ✅ Stored in Supabase Storage (S3-compatible)
- ✅ Public URLs for easy sharing
- ✅ Organized in `qr-codes/` folder
- ✅ File naming: `contest-{id}-{timestamp}.png`

### QR Code Modal:
- ✅ View QR code
- ✅ Download QR code as PNG
- ✅ Copy participation URL
- ✅ Instructions for use

## 🔧 Troubleshooting

### Issue: "Bucket not found"
**Solution**: Create the bucket in Supabase Dashboard (Step 1)

### Issue: "Permission denied"
**Solution**: Run the storage policies SQL (Step 3)

### Issue: QR code not uploading
**Check**:
1. Bucket exists and is public
2. Storage policies are set
3. Browser console for errors

### Issue: qr_code_url is null
**Solution**: 
- Run Step 2 SQL to add the column
- Create a new contest (old contests won't have QR codes)

## 📊 Database Schema

```sql
-- contests table now has:
CREATE TABLE contests (
  contest_id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  theme VARCHAR(150),
  description TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status VARCHAR(50),
  qr_code_url VARCHAR(500),  -- ✅ NEW COLUMN
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🎨 QR Code Specifications

- **Format**: PNG
- **Size**: 500x500 pixels
- **Margin**: 2 modules
- **Colors**: Black on white
- **Error Correction**: High (30%)
- **Content**: Participation URL

## 🚀 Next Steps

After setup:
1. ✅ Create a test contest
2. ✅ Verify QR code is generated
3. ✅ Click QR button to view
4. ✅ Download and test QR code
5. ✅ Scan with phone to verify URL

## 📝 Summary

**What was added**:
- ✅ QR code generation on contest creation
- ✅ Upload to Supabase Storage
- ✅ Public URL storage in database
- ✅ QR code modal displays stored image
- ✅ Download functionality

**What you need to do**:
1. Create storage bucket (1 minute)
2. Add database column (1 minute)
3. Set storage policies (1 minute)
4. Test by creating a contest (1 minute)

**Total time**: ~5 minutes

---
**Status**: Ready to use after completing setup steps above
