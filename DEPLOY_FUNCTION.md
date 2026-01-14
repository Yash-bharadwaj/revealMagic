# Deploy Cloud Function for Push Notifications

## Quick Steps

1. **Make sure you have Firebase CLI installed:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase (if not already):**
   ```bash
   firebase login
   ```

3. **Navigate to functions directory and install dependencies:**
   ```bash
   cd functions
   npm install
   ```

4. **Build and deploy the function:**
   ```bash
   npm run deploy
   ```
   
   Or from project root:
   ```bash
   firebase deploy --only functions
   ```

5. **Verify deployment:**
   - Go to Firebase Console > Functions
   - You should see `onSearchCreated` function deployed
   - Status should be "Active"

## Verify VAPID Key

Make sure your `.env.local` (or Vercel environment variables) has the VAPID key from Firebase Console:

1. Copy the VAPID key from Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
2. It should match: `BL13fUDOEit61E3t4eYcTZfMKu1birMJtZWTymiZOpfcL95mmTORS S2S4LIXBrTbAIDK M-6OpyGh7n4lf9FaBIQ`
3. Set it as: `VITE_FCM_VAPID_KEY=BL13fUDOEit61E3t4eYcTZfMKu1birMJtZWTymiZOpfcL95mmTORS S2S4LIXBrTbAIDK M-6OpyGh7n4lf9FaBIQ`

## After Deployment

1. Test by submitting a search from the search page
2. Check browser console for logs
3. Check Firebase Console > Functions > onSearchCreated > Logs for any errors
4. Make sure push alerts are enabled in the dashboard
