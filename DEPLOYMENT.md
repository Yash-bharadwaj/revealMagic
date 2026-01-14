# Production Deployment Guide

## ✅ Implementation Complete

All mock data has been replaced with production Firebase services. The application is now ready for deployment.

## What Was Implemented

### ✅ Phase 1: Firebase SDK Setup
- Firebase configuration using environment variables
- Initialized Auth, Firestore, and Messaging services

### ✅ Phase 2: Firestore Service
- Real-time listeners for search events
- CRUD operations for searches and performers
- Automatic collection creation on first write

### ✅ Phase 3: Authentication
- Firebase Email/Password authentication
- AuthContext with user state management
- Protected routes (Dashboard, Admin)

### ✅ Phase 4: Pages Updated
- Dashboard: Real-time Firestore integration
- SearchPage: Writes to Firestore
- AdminDashboard: Manages performers in Firestore
- LoginPage: Real Firebase authentication

### ✅ Phase 5: FCM Push Notifications
- Service worker for background notifications
- Foreground notification handling
- FCM token registration and storage

### ✅ Phase 6: Cloud Functions
- Firestore trigger on search creation
- Sends FCM notifications to performers
- Uses Service Account for authentication

### ✅ Phase 7: Security Rules
- Firestore rules for searches, performers, users
- Role-based access control
- Admin-only operations protected

### ✅ Phase 8: Route Protection
- ProtectedRoute component
- AdminRoute component
- Automatic redirects for unauthorized access

### ✅ Phase 9: Cleanup
- Removed MOCK_PERFORMER_ID
- Removed all mockStore references
- Cleaned up demo links

### ✅ Phase 10: Hosting Configuration
- firebase.json configured
- .firebaserc set up
- SPA routing configured

## Pre-Deployment Checklist

### 1. Install Dependencies
```bash
npm install
cd functions && npm install && cd ..
```

### 2. Verify Environment Variables
Ensure `.env.local` and `.env.production` have all required values:
- All `VITE_FIREBASE_*` variables
- `VITE_FCM_VAPID_KEY`

### 3. Create Firestore Index
The composite index for searches is defined in `firestore.indexes.json`. Firebase will prompt you to create it on first deployment, or you can create it manually in the Firebase Console.

### 4. Set Up Initial Data

#### Create Admin User in Firebase Console:
1. Go to Firebase Console → Authentication → Users
2. Click "Add user"
3. Enter admin email and password
4. Note the UID

#### Create User Document in Firestore:
1. Go to Firestore Database
2. Create collection `users`
3. Create document with ID = Firebase Auth UID
4. Add fields:
   ```json
   {
     "email": "admin@example.com",
     "role": "admin",
     "createdAt": [current timestamp]
   }
   ```

#### Create First Performer (via Admin Dashboard):
1. Log in as admin
2. Go to Admin Dashboard
3. Click "Add Entity"
4. Enter performer name and username
5. Note the generated performerId

#### Link Performer to User:
1. Go to Firestore → `users` collection
2. Find the user document for the performer
3. Add field: `performerId: "[performer-id-from-step-above]"`

### 5. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 6. Deploy Cloud Functions
```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

### 7. Build and Deploy Frontend
```bash
npm run build
firebase deploy --only hosting
```

## Post-Deployment

### Test Checklist:
- [ ] Login with admin credentials
- [ ] Create a performer via Admin Dashboard
- [ ] Log in as performer
- [ ] Copy search link from Dashboard
- [ ] Open search link in incognito/private window
- [ ] Submit a search
- [ ] Verify search appears in Dashboard in real-time
- [ ] Verify FCM notification received (if permission granted)
- [ ] Test protected routes (should redirect if not authenticated)
- [ ] Test admin routes (should redirect non-admins)

## Important Notes

1. **Service Account Key**: The `service-account-key.json` file is used by Cloud Functions. Make sure it's in the functions directory or configure the path in your deployment.

2. **FCM Token**: Users need to grant notification permission and the FCM token will be automatically saved to their user document.

3. **Firestore Indexes**: The composite index for `searches` collection (performerId + timestamp) is required. Firebase will prompt you to create it, or create it manually in Firebase Console → Firestore → Indexes.

4. **Environment Variables**: For production, you may want to set environment variables in Firebase Hosting or use a build-time injection method.

## Troubleshooting

### "Permission denied" errors
- Check Firestore security rules are deployed
- Verify user has correct role in Firestore

### FCM notifications not working
- Verify service worker is registered (check browser console)
- Check FCM token is saved in user document
- Verify Cloud Functions are deployed and running
- Check browser notification permissions

### Real-time updates not working
- Verify Firestore composite index is created
- Check browser console for errors
- Verify user has correct performerId

### Cloud Functions errors
- Check functions logs: `firebase functions:log`
- Verify Service Account has proper permissions
- Check that FCM token exists in user document

## Support

For issues or questions, check:
- Firebase Console for errors
- Browser console for client-side errors
- Cloud Functions logs for server-side errors
