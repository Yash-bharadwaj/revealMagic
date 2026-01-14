# User Setup Guide - Fix "No Performer ID" Error

## Problem
User can log in but sees: "No performer ID assigned to your account"

## Solution: Set Up User in Firestore

Your user exists in Firebase Authentication, but the Firestore user document is missing or incomplete.

### Step 1: Get User's Firebase Auth UID

1. Go to Firebase Console → Authentication → Users
2. Find the user: `someyash2000@gmail.com`
3. Click on the user
4. Copy the **UID** (it's a long string like `abc123xyz...`)

### Step 2: Create/Update User Document in Firestore

1. Go to Firebase Console → Firestore Database → Data
2. Click on `users` collection (create it if it doesn't exist)
3. Click "Add document"
4. Set Document ID = **The UID you copied** (important!)
5. Add these fields:

#### If this is an ADMIN user:
```json
{
  "email": "someyash2000@gmail.com",
  "role": "admin",
  "createdAt": [Click "timestamp" and select "now"]
}
```

#### If this is a PERFORMER user:
First, create a performer, then link them:

**A. Create Performer:**
1. Go to Admin Dashboard (if you have admin access)
2. Click "Add Performer"
3. Enter name and username
4. Copy the generated Performer ID

**B. Create User Document:**
```json
{
  "email": "someyash2000@gmail.com",
  "role": "performer",
  "performerId": "[paste-performer-id-here]",
  "createdAt": [Click "timestamp" and select "now"]
}
```

### Step 3: Verify

1. Log out and log back in
2. If admin → Should redirect to `/admin`
3. If performer → Should see Dashboard with search link

## Quick Fix via Admin Dashboard (If You Have Admin Access)

1. Log in as admin
2. Go to Admin Dashboard
3. Click "Users" tab
4. Check if your user appears
5. If not, click "Create User" and create your account
6. Then create a performer and link it

## Manual Firestore Setup (If No Admin Access)

If you don't have admin access yet, you need to manually create the user document:

1. **Get your UID from Firebase Console → Authentication**
2. **Go to Firestore → users collection**
3. **Create document with ID = your UID**
4. **Add fields:**
   - `email`: "someyash2000@gmail.com"
   - `role`: "admin" (if you want admin access) or "performer"
   - `createdAt`: timestamp (click "timestamp" → "now")

5. **If performer, also add:**
   - `performerId`: "[performer-id-from-admin]"

## After Setup

Once the user document exists with the correct structure:
- ✅ Login will work
- ✅ Dashboard will load (or redirect to admin if role is admin)
- ✅ All features will be accessible

## Troubleshooting

**Still seeing the error?**
- Check browser console for errors
- Verify user document ID matches Firebase Auth UID exactly
- Make sure `role` field is set (either "admin" or "performer")
- For performers, ensure `performerId` field exists

**Want to make yourself admin?**
- Set `role: "admin"` in your user document
- Log out and log back in
- You'll be redirected to Admin Dashboard
