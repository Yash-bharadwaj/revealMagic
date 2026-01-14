#!/usr/bin/env node

/**
 * Local API server for user creation (bypasses Cloud Function CORS)
 * Run: npm run server
 */

import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
const serviceAccountPath = join(__dirname, 'service-account-key.json');
try {
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('Error initializing Firebase Admin:', error.message);
  console.error('Make sure service-account-key.json exists in the project root');
  process.exit(1);
}

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Create user endpoint
app.post('/api/create-user', async (req, res) => {
  try {
    const { email, password, role, performerId } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ 
        error: 'Email, password, and role are required' 
      });
    }

    if (role !== 'admin' && role !== 'performer') {
      return res.status(400).json({ 
        error: 'Role must be either "admin" or "performer"' 
      });
    }

    // Validate performerId if provided
    if (performerId) {
      const performerDoc = await admin.firestore()
        .collection('performers')
        .doc(performerId)
        .get();
      
      if (!performerDoc.exists) {
        return res.status(400).json({ 
          error: `Performer with ID "${performerId}" does not exist` 
        });
      }
    }

    // Create Firebase Auth user
    const userRecord = await admin.auth().createUser({
      email,
      password,
      emailVerified: false
    });

    // Create user document in Firestore
    const userData = {
      email,
      role,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (performerId) {
      userData.performerId = performerId;
    }

    await admin.firestore()
      .collection('users')
      .doc(userRecord.uid)
      .set(userData);

    res.json({
      success: true,
      uid: userRecord.uid,
      email: userRecord.email
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to create user' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n✅ Local API server running on http://localhost:${PORT}`);
  console.log(`   Ready to create users without Cloud Function!\n`);
});
