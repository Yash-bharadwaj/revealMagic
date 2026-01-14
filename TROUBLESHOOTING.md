# Troubleshooting Guide

## ✅ Fixed Issues

### 1. TypeScript Compilation Error
**Problem**: `Type 'Int32Array' is not generic` error when building functions

**Solution**: Added `skipLibCheck: true` to `functions/tsconfig.json` to skip type checking in node_modules

**Status**: ✅ Fixed - Build now works

### 2. Firebase CLI Not Found
**Problem**: `zsh: command not found: firebase`

**Solution**: Installed Firebase CLI globally with `npm install -g firebase-tools`

**Status**: ✅ Fixed - Firebase CLI is now available

## Next Steps

### 1. Login to Firebase
```bash
firebase login
```
This will open a browser window for you to authenticate.

### 2. Build Functions
```bash
cd functions
npm run build
cd ..
```

### 3. Deploy Functions
```bash
firebase deploy --only functions
```

### 4. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 5. Build and Deploy Frontend
```bash
npm run build
firebase deploy --only hosting
```

## Common Issues

### Functions Build Fails
- Make sure you're in the `functions` directory
- Run `npm install` in the functions directory first
- Check that TypeScript is installed: `npm install typescript --save-dev`

### Firebase Login Issues
- Make sure you're using the correct Google account
- Try `firebase logout` then `firebase login` again

### Deployment Errors
- Verify your project ID in `.firebaserc` matches your Firebase project
- Check that you have the correct permissions in Firebase Console
- Make sure all environment variables are set

### TypeScript Errors in Functions
- The `skipLibCheck: true` option should prevent most dependency type errors
- If you see errors in your own code, check the TypeScript version compatibility

## Verification

After deployment, verify:
1. Functions are deployed: Check Firebase Console → Functions
2. Rules are deployed: Check Firebase Console → Firestore → Rules
3. Hosting is live: Visit your Firebase Hosting URL
4. Test user creation: Log in as admin and try creating a user
