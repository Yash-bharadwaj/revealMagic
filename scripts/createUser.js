#!/usr/bin/env node

/**
 * Utility script to create users programmatically
 * Usage: node scripts/createUser.js <email> <password> <role> [performerId]
 * 
 * Example:
 *   node scripts/createUser.js user@example.com password123 performer
 *   node scripts/createUser.js admin@example.com password123 admin
 *   node scripts/createUser.js performer@example.com password123 performer performer-id-123
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

async function createUser(email, password, role, performerId = null) {
  try {
    // Validate role
    if (role !== 'admin' && role !== 'performer') {
      throw new Error('Role must be either "admin" or "performer"');
    }

    // Validate performerId if role is performer
    if (role === 'performer' && performerId) {
      // Check if performer exists
      const performerDoc = await db.collection('performers').doc(performerId).get();
      if (!performerDoc.exists) {
        throw new Error(`Performer with ID "${performerId}" does not exist`);
      }
    }

    console.log(`Creating user: ${email} (${role})...`);

    // Create Firebase Auth user
    const userRecord = await admin.auth().createUser({
      email,
      password,
      emailVerified: false
    });

    console.log(`✓ Firebase Auth user created: ${userRecord.uid}`);

    // Create user document in Firestore
    const userData = {
      email,
      role,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (performerId) {
      userData.performerId = performerId;
    }

    await db.collection('users').doc(userRecord.uid).set(userData);

    console.log(`✓ Firestore user document created`);

    // Summary
    console.log('\n✅ User created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:     ${email}`);
    console.log(`UID:       ${userRecord.uid}`);
    console.log(`Role:      ${role}`);
    if (performerId) {
      console.log(`Performer: ${performerId}`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return {
      success: true,
      uid: userRecord.uid,
      email: userRecord.email
    };
  } catch (error) {
    console.error('\n❌ Error creating user:', error.message);
    
    // If user was created in Auth but Firestore failed, try to clean up
    if (error.code === 'auth/email-already-exists') {
      console.error('User with this email already exists in Firebase Auth');
    } else if (error.message.includes('Firestore')) {
      console.error('User may have been created in Firebase Auth but Firestore document creation failed');
    }
    
    throw error;
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length < 3) {
  console.error('Usage: node scripts/createUser.js <email> <password> <role> [performerId]');
  console.error('');
  console.error('Arguments:');
  console.error('  email       - User email address');
  console.error('  password    - User password (min 6 characters)');
  console.error('  role        - User role: "admin" or "performer"');
  console.error('  performerId - (Optional) Performer ID to link to user');
  console.error('');
  console.error('Examples:');
  console.error('  node scripts/createUser.js user@example.com password123 performer');
  console.error('  node scripts/createUser.js admin@example.com password123 admin');
  console.error('  node scripts/createUser.js performer@example.com password123 performer abc123xyz');
  process.exit(1);
}

const [email, password, role, performerId] = args;

// Validate password length
if (password.length < 6) {
  console.error('❌ Error: Password must be at least 6 characters long');
  process.exit(1);
}

createUser(email, password, role, performerId || null)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    process.exit(1);
  });
