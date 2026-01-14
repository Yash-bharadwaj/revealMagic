# Quick Setup Guide - Copy & Paste Your Keys

## ✅ What You Already Have
- Firebase config (apiKey, projectId, etc.) ✅
- VAPID key (web push certificate) ✅
- messagingSenderId ✅
- Service Account JSON file ✅ (for Cloud Functions)

## ✅ Everything You Need is Ready!

---

## 📋 Step-by-Step: Create Your .env Files

### Step 1: Create `.env.local` file
In your project root, create a file named `.env.local` and paste this:

```env
# Firebase Web App Configuration
# Copy values from Firebase Console > Project Settings > General > Your apps
VITE_FIREBASE_API_KEY=your-firebase-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Firebase Cloud Messaging - Web Push Certificate (VAPID Key)
# Get from Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
VITE_FCM_VAPID_KEY=your-vapid-key-here
```

### Step 2: Create `.env.production` file
Create a file named `.env.production` and paste the **SAME content** as above.

### Step 3: Service Account File
✅ The `service-account-key.json` file is already created in your project root. This is used by Cloud Functions to send FCM notifications.

---

## 📝 Important Notes

1. **Firestore Collections**: You don't need to create `searches`, `performers`, or `users` collections manually. They will be created automatically when your code writes to them for the first time.

2. **VITE_ Prefix**: All variables starting with `VITE_` are exposed to your React app. This is required for Vite to make them available in your frontend code.

3. **Service Account for Cloud Functions**: The `service-account-key.json` file is used by Cloud Functions to authenticate and send FCM notifications. This is the modern, recommended approach (better than Server Key).

4. **Security**: Never commit `.env` files or `service-account-key.json` to Git. They're already in `.gitignore`.

5. **Template File**: `ENV_TEMPLATE.txt` contains all the values formatted nicely for easy copy-paste.

---

## ✅ Next Steps After Creating .env Files

1. ✅ Create `.env.local` file (copy from `ENV_TEMPLATE.txt`)
2. ✅ Create `.env.production` file (same content as `.env.local`)
3. ✅ Service Account JSON file is ready (`service-account-key.json`)
4. 🎉 You're ready to integrate Firebase into your code!

---

## 🎯 Checklist

- [x] Firebase config values collected
- [x] VAPID key collected
- [x] Service Account JSON file created
- [ ] `.env.local` file created (copy from `ENV_TEMPLATE.txt`)
- [ ] `.env.production` file created (same as `.env.local`)

---

## 🔐 Service Account File

The `service-account-key.json` file should be downloaded from Firebase Console:
1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate new private key"
3. Save the downloaded JSON file as `service-account-key.json` in your project root
4. **Never commit this file to Git** (already in `.gitignore`)
