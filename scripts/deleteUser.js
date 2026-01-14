#!/usr/bin/env node

/**
 * Utility script to delete a user account (Firebase Auth + Firestore)
 * Usage: node scripts/deleteUser.js <userEmail>
 * 
 * Example:
 *   node scripts/deleteUser.js user@example.com
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

async function deleteUser(userEmail) {
  try {
    console.log(`Deleting user: ${userEmail}...`);

    // Get user by email from Firebase Auth
    const userRecord = await admin.auth().getUserByEmail(userEmail);
    const uid = userRecord.uid;

    console.log(`✓ Found user in Firebase Auth: ${uid}`);

    // Delete user document from Firestore
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      await userRef.delete();
      console.log(`✓ Deleted user document from Firestore`);
    } else {
      console.log(`⚠ User document not found in Firestore`);
    }

    // Delete Firebase Auth user
    await admin.auth().deleteUser(uid);
    console.log(`✓ Deleted user from Firebase Auth`);

    console.log('\n✅ User deleted successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email: ${userEmail}`);
    console.log(`UID:   ${uid}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return { success: true, uid };
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`\n❌ Error: User with email "${userEmail}" not found in Firebase Auth`);
    } else {
      console.error('\n❌ Error:', error.message);
    }
    throw error;
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length < 1) {
  console.error('Usage: node scripts/deleteUser.js <userEmail>');
  console.error('');
  console.error('Arguments:');
  console.error('  userEmail - Email address of user to delete');
  console.error('');
  console.error('Example:');
  console.error('  node scripts/deleteUser.js user@example.com');
  process.exit(1);
}

const [userEmail] = args;

deleteUser(userEmail)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    process.exit(1);
  });
