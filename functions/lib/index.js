"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onSearchCreated = exports.deleteUser = exports.createUser = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin
admin.initializeApp();
// Cloud Function to create a user (admin only)
exports.createUser = functions.https.onCall(async (data, context) => {
    var _a, _b, _c;
    // Verify the caller is an admin
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const callerUid = context.auth.uid;
    const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();
    if (!callerDoc.exists || ((_a = callerDoc.data()) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can create users');
    }
    const { email, password, role, performerId } = data;
    if (!email || !password || !role) {
        throw new functions.https.HttpsError('invalid-argument', 'Email, password, and role are required');
    }
    try {
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
        await admin.firestore().collection('users').doc(userRecord.uid).set(userData);
        return {
            success: true,
            uid: userRecord.uid,
            email: userRecord.email
        };
    }
    catch (error) {
        console.error('Error creating user:', error);
        // Handle specific Firebase Auth errors with user-friendly messages
        const errorCode = error.code || ((_b = error.errorInfo) === null || _b === void 0 ? void 0 : _b.code);
        if (errorCode === 'auth/email-already-exists') {
            throw new functions.https.HttpsError('already-exists', 'The email address is already in use by another account.');
        }
        if (errorCode === 'auth/invalid-email') {
            throw new functions.https.HttpsError('invalid-argument', 'The email address is invalid.');
        }
        if (errorCode === 'auth/invalid-password') {
            throw new functions.https.HttpsError('invalid-argument', 'The password must be at least 6 characters long.');
        }
        if (errorCode === 'auth/weak-password') {
            throw new functions.https.HttpsError('invalid-argument', 'The password is too weak. Please use a stronger password.');
        }
        // For other errors, provide a generic but helpful message
        const errorMessage = error.message || ((_c = error.errorInfo) === null || _c === void 0 ? void 0 : _c.message) || 'Failed to create user';
        throw new functions.https.HttpsError('internal', errorMessage);
    }
});
// Cloud Function to delete a user (admin only) - deletes both Firestore and Firebase Auth
exports.deleteUser = functions.https.onCall(async (data, context) => {
    var _a;
    // Verify the caller is an admin
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const callerUid = context.auth.uid;
    const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();
    if (!callerDoc.exists || ((_a = callerDoc.data()) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can delete users');
    }
    const { uid } = data;
    if (!uid) {
        throw new functions.https.HttpsError('invalid-argument', 'User UID is required');
    }
    try {
        // Delete user document from Firestore
        const userRef = admin.firestore().collection('users').doc(uid);
        const userDoc = await userRef.get();
        if (userDoc.exists) {
            await userRef.delete();
        }
        // Delete Firebase Auth user
        try {
            await admin.auth().deleteUser(uid);
        }
        catch (authError) {
            // If user doesn't exist in Auth, that's okay - continue
            if (authError.code !== 'auth/user-not-found') {
                throw authError;
            }
        }
        return {
            success: true,
            uid: uid
        };
    }
    catch (error) {
        console.error('Error deleting user:', error);
        const errorMessage = error.message || 'Failed to delete user';
        throw new functions.https.HttpsError('internal', errorMessage);
    }
});
// Cloud Function to send FCM notification when a search is created
exports.onSearchCreated = functions.firestore
    .document('searches/{searchId}')
    .onCreate(async (snap, context) => {
    var _a;
    const searchData = snap.data();
    const performerId = searchData.performerId;
    const query = searchData.query;
    if (!performerId) {
        console.error('No performerId in search data');
        return;
    }
    try {
        // Get performer's user document to find FCM token
        const usersSnapshot = await admin.firestore()
            .collection('users')
            .where('performerId', '==', performerId)
            .limit(1)
            .get();
        if (usersSnapshot.empty) {
            console.log(`No user found for performerId: ${performerId}`);
            return;
        }
        const userDoc = usersSnapshot.docs[0];
        const userData = userDoc.data();
        const fcmToken = userData.fcmToken;
        console.log(`Processing search for performerId: ${performerId}, userId: ${userDoc.id}`);
        console.log(`FCM token exists: ${!!fcmToken}`);
        if (!fcmToken) {
            console.log(`No FCM token found for user: ${userDoc.id}, performerId: ${performerId}`);
            return;
        }
        // Prepare notification message
        const message = {
            notification: {
                title: 'Googly : Search Received',
                body: `"${query}"`
            },
            data: {
                query: query,
                performerId: performerId,
                searchId: context.params.searchId,
                timestamp: ((_a = searchData.timestamp) === null || _a === void 0 ? void 0 : _a.toMillis().toString()) || Date.now().toString()
            },
            token: fcmToken,
            android: {
                priority: 'high'
            },
            apns: {
                headers: {
                    'apns-priority': '10'
                }
            }
        };
        // Send notification
        console.log('Sending FCM notification...', {
            token: fcmToken.substring(0, 20) + '...',
            query: query,
            performerId: performerId
        });
        const response = await admin.messaging().send(message);
        console.log('Successfully sent notification:', response);
    }
    catch (error) {
        console.error('Error sending FCM notification:', error);
        console.error('Error details:', {
            code: error.code,
            message: error.message,
            stack: error.stack
        });
    }
});
//# sourceMappingURL=index.js.map