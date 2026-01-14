#!/usr/bin/env node

/**
 * Utility script to link an existing user to a performer
 * Usage: node scripts/linkUserToPerformer.js <userEmail> <performerId>
 * 
 * Example:
 *   node scripts/linkUserToPerformer.js user@example.com abc123xyz
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin with service account
const serviceAccountPath = join(__dirname, '..', 'service-account-key.json');

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

const db = admin.firestore();

async function linkUserToPerformer(userEmail, performerId) {
  try {
    console.log(`Linking user ${userEmail} to performer ${performerId}...`);

    // Get user by email from Firebase Auth
    const userRecord = await admin.auth().getUserByEmail(userEmail);
    const uid = userRecord.uid;

    // Check if performer exists
    const performerDoc = await db.collection('performers').doc(performerId).get();
    if (!performerDoc.exists) {
      throw new Error(`Performer with ID "${performerId}" does not exist`);
    }

    // Get or create user document in Firestore
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    const updateData = {
      performerId: performerId
    };

    if (userDoc.exists) {
      // Update existing user document
      await userRef.update(updateData);
      console.log(`✓ Updated existing user document`);
    } else {
      // Create new user document
      await userRef.set({
        email: userEmail,
        role: 'performer',
        performerId: performerId,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✓ Created new user document`);
    }

    console.log('\n✅ User linked to performer successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:     ${userEmail}`);
    console.log(`UID:       ${uid}`);
    console.log(`Performer: ${performerId}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return { success: true, uid, performerId };
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`\n❌ Error: User with email "${userEmail}" not found in Firebase Auth`);
      console.error('Make sure the user exists in Firebase Authentication first');
    } else {
      console.error('\n❌ Error:', error.message);
    }
    throw error;
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: node scripts/linkUserToPerformer.js <userEmail> <performerId>');
  console.error('');
  console.error('Arguments:');
  console.error('  userEmail   - Email address of existing user');
  console.error('  performerId - Performer ID to link to user');
  console.error('');
  console.error('Example:');
  console.error('  node scripts/linkUserToPerformer.js user@example.com abc123xyz');
  process.exit(1);
}

const [userEmail, performerId] = args;

linkUserToPerformer(userEmail, performerId)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    process.exit(1);
  });
