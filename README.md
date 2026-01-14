# revealMagic

Real-time search tool for magicians built with React, TypeScript, Vite, and Firebase.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- Firebase project setup

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Copy `ENV_TEMPLATE.txt` to `.env.local`
   - Fill in your Firebase configuration values

3. Run the development server:
   ```bash
   npm run dev
   ```

## 📦 Deploy to Vercel

### Step 1: Push to GitHub (Already Done ✅)
Your code is already pushed to: `https://github.com/Yash-bharadwaj/revealMagic.git`

### Step 2: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your repository: `Yash-bharadwaj/revealMagic`
4. Vercel will auto-detect Vite settings
5. **Configure Environment Variables:**
   - Click **"Environment Variables"** section
   - Add all variables from `ENV_TEMPLATE.txt`:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`
     - `VITE_FIREBASE_MEASUREMENT_ID`
     - `VITE_FCM_VAPID_KEY`
     - `GEMINI_API_KEY` (if used)
   - Add them for **Production**, **Preview**, and **Development** environments
6. Click **"Deploy"**
7. Your app will be live at `https://your-project-name.vercel.app`

### Step 3: Configure Firebase for Production

1. **Update Authorized Domains:**
   - Go to Firebase Console > Authentication > Settings > Authorized domains
   - Add your Vercel domain (e.g., `your-project.vercel.app`)

2. **Verify Firestore Rules:**
   - Check `firestore.rules` for production security rules

## 📁 Project Structure

```
reveal-magician-tool/
├── components/       # React components
├── pages/           # Page components
├── services/        # Firebase services
├── contexts/        # React contexts
├── hooks/           # Custom hooks
├── functions/       # Firebase Cloud Functions
└── public/          # Static assets
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run server` - Run local API server (development only)

## 📝 Important Notes

- The `server.js` file is for local development only and won't run on Vercel
- All environment variables must be prefixed with `VITE_` to be accessible in React
- Service account keys should NEVER be committed to git (already in `.gitignore`)
- Firebase Cloud Functions need to be deployed separately via Firebase CLI

## 🔐 Security

- Never commit `.env` files or service account keys
- All sensitive values are in `.gitignore`
- Use Vercel environment variables for production secrets
