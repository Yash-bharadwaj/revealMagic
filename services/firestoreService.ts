import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp,
  QuerySnapshot,
  DocumentData,
  increment
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { SearchEvent, Performer } from '../types';

type Listener = (event: SearchEvent) => void;
type PerformerListener = (performers: Performer[]) => void;

class FirestoreService {
  private searchListeners: Map<string, () => void> = new Map();
  private performerListeners: Set<PerformerListener> = new Set();

  // Subscribe to real-time search events for a specific performer
  subscribe(performerId: string, callback: Listener): () => void {
    const searchesRef = collection(db, 'searches');
    // Note: This query requires a composite index (created in firestore.indexes.json)
    const q = query(
      searchesRef,
      where('performerId', '==', performerId),
      orderBy('timestamp', 'desc'),
      limit(30)
    );

    let isFirstSnapshot = true;

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        // On first snapshot, all documents come through as 'added'
        // We skip the initial snapshot to avoid duplicates with getHistory
        if (isFirstSnapshot) {
          isFirstSnapshot = false;
          return;
        }

        // Only process new additions after initial load
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            const event: SearchEvent = {
              id: change.doc.id,
              performerId: data.performerId,
              query: data.query,
              timestamp: data.timestamp?.toMillis() || Date.now(),
              deviceName: data.deviceName,
              location: data.location
            };
            callback(event);
          }
        });
      },
      (error) => {
        console.error('Error listening to searches:', error);
        // Check if it's an index error
        if (error.code === 'failed-precondition') {
          console.error('Firestore index missing. Please create the composite index for searches collection.');
        }
      }
    );

    // Store unsubscribe function
    const key = `${performerId}-${Date.now()}`;
    this.searchListeners.set(key, unsubscribe);

    // Return cleanup function
    return () => {
      unsubscribe();
      this.searchListeners.delete(key);
    };
  }

  // Subscribe to all performers (for admin dashboard)
  subscribePerformers(callback: PerformerListener): () => void {
    const performersRef = collection(db, 'performers');
    const q = query(performersRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const performers: Performer[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            username: data.username,
            status: data.status,
            createdAt: data.createdAt?.toMillis() || Date.now(),
            totalSearches: data.totalSearches || 0,
            lastActive: data.lastActive?.toMillis()
          };
        });
        callback(performers);
      },
      (error) => {
        console.error('Error listening to performers:', error);
      }
    );

    this.performerListeners.add(callback);

    return () => {
      unsubscribe();
      this.performerListeners.delete(callback);
    };
  }

  // Submit a search event
  async submitSearch(performerId: string, query: string): Promise<void> {
    try {
      const searchesRef = collection(db, 'searches');
      const deviceName = navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser';
      
      const docRef = await addDoc(searchesRef, {
        performerId,
        query: query.trim(),
        timestamp: Timestamp.now(),
        deviceName
      });

      console.log(`Search submitted: ${query.trim()} for performer ${performerId} (doc ID: ${docRef.id})`);
      console.log('This should trigger Cloud Function onSearchCreated to send push notification');

      // Update performer stats
      await this.updatePerformerStats(performerId);
    } catch (error) {
      console.error('Error submitting search:', error);
      throw error;
    }
  }

  // Get search history for a performer (top 30)
  async getHistory(performerId: string): Promise<SearchEvent[]> {
    try {
      const searchesRef = collection(db, 'searches');
      const q = query(
        searchesRef,
        where('performerId', '==', performerId),
        orderBy('timestamp', 'desc'),
        limit(30)
      );

      const snapshot = await getDocs(q);
      const events = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          performerId: data.performerId,
          query: data.query,
          timestamp: data.timestamp?.toMillis() || Date.now(),
          deviceName: data.deviceName,
          location: data.location
        };
      });
      
      console.log(`Loaded ${events.length} search events for performer ${performerId}`);
      return events;
    } catch (error: any) {
      console.error('Error getting history:', error);
      // Check if it's an index error
      if (error.code === 'failed-precondition') {
        console.error('Firestore index missing. Please create the composite index for searches collection (performerId + timestamp).');
      }
      return [];
    }
  }

  // Delete old searches, keeping only top 30
  async cleanupOldSearches(performerId: string): Promise<void> {
    try {
      const searchesRef = collection(db, 'searches');
      // Get all searches for this performer, ordered by timestamp desc
      const q = query(
        searchesRef,
        where('performerId', '==', performerId),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      const allDocs = snapshot.docs;
      
      // If we have more than 30, delete the rest
      if (allDocs.length > 30) {
        const docsToDelete = allDocs.slice(30);
        const deletePromises = docsToDelete.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        console.log(`Deleted ${docsToDelete.length} old search events for performer ${performerId}`);
      }
    } catch (error: any) {
      console.error('Error cleaning up old searches:', error);
      // Don't throw - this is a cleanup operation, shouldn't break the flow
    }
  }

  // Get global stats (for admin dashboard)
  async getGlobalStats() {
    try {
      const searchesRef = collection(db, 'searches');
      const performersRef = collection(db, 'performers');

      const [searchesSnapshot, performersSnapshot] = await Promise.all([
        getDocs(searchesRef),
        getDocs(performersRef)
      ]);

      const activePerformers = performersSnapshot.docs.filter(
        (doc) => doc.data().status === 'active'
      ).length;

      const recentSearches = searchesSnapshot.docs
        .slice(0, 5)
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            performerId: data.performerId,
            query: data.query,
            timestamp: data.timestamp?.toMillis() || Date.now(),
            deviceName: data.deviceName
          };
        });

      return {
        totalSearches: searchesSnapshot.size,
        activePerformers,
        recentActivity: recentSearches
      };
    } catch (error) {
      console.error('Error getting global stats:', error);
      return {
        totalSearches: 0,
        activePerformers: 0,
        recentActivity: []
      };
    }
  }

  // Add a new performer
  async addPerformer(performer: Omit<Performer, 'id' | 'createdAt' | 'totalSearches' | 'status'>, customId?: string): Promise<Performer> {
    try {
      // If customId is provided, validate it doesn't exist and use it
      if (customId) {
        // Validate customId format (alphanumeric, hyphen, underscore only)
        if (!/^[a-zA-Z0-9_-]+$/.test(customId)) {
          throw new Error('Custom ID can only contain letters, numbers, hyphens, and underscores');
        }

        // Check if performer with this ID already exists
        const existingDoc = await getDoc(doc(db, 'performers', customId));
        if (existingDoc.exists()) {
          throw new Error(`Performer with ID "${customId}" already exists`);
        }

        // Create performer with custom ID
        const performerRef = doc(db, 'performers', customId);
        await setDoc(performerRef, {
          name: performer.name,
          username: performer.username,
          status: 'active',
          createdAt: Timestamp.now(),
          totalSearches: 0
        });

        return {
          id: customId,
          name: performer.name,
          username: performer.username,
          status: 'active',
          createdAt: Date.now(),
          totalSearches: 0
        };
      } else {
        // Use auto-generated ID
        const performersRef = collection(db, 'performers');
        const docRef = await addDoc(performersRef, {
          name: performer.name,
          username: performer.username,
          status: 'active',
          createdAt: Timestamp.now(),
          totalSearches: 0
        });

        return {
          id: docRef.id,
          name: performer.name,
          username: performer.username,
          status: 'active',
          createdAt: Date.now(),
          totalSearches: 0
        };
      }
    } catch (error) {
      console.error('Error adding performer:', error);
      throw error;
    }
  }

  // Delete a performer and the linked user (including Firebase Auth user)
  async deletePerformer(id: string): Promise<void> {
    try {
      // Find the linked user document if it exists
      const usersRef = collection(db, 'users');
      const userQuery = query(usersRef, where('performerId', '==', id));
      const userSnapshot = await getDocs(userQuery);
      
      // Delete Firebase Auth users via Cloud Function, then Firestore docs
      for (const userDoc of userSnapshot.docs) {
        const userId = userDoc.id;
        try {
          // Try to delete Firebase Auth user via Cloud Function
          const { httpsCallable } = await import('firebase/functions');
          const { functions } = await import('../firebase/config');
          const deleteUserFunction = httpsCallable(functions, 'deleteUser');
          await deleteUserFunction({ uid: userId });
        } catch (error: any) {
          // If Cloud Function fails, log but continue - we'll still delete Firestore doc
          console.warn('Failed to delete Firebase Auth user via Cloud Function:', error);
        }
        
        // Always delete Firestore document (Cloud Function also does this, but ensure it happens)
        try {
          await deleteDoc(userDoc.ref);
        } catch (docError) {
          console.warn('Failed to delete Firestore user document:', docError);
        }
      }
      
      // Delete the performer document
      const performerRef = doc(db, 'performers', id);
      await deleteDoc(performerRef);
    } catch (error) {
      console.error('Error deleting performer:', error);
      throw error;
    }
  }

  // Update performer stats (increment search count and update lastActive)
  private async updatePerformerStats(performerId: string): Promise<void> {
    try {
      const performerRef = doc(db, 'performers', performerId);
      await updateDoc(performerRef, {
        totalSearches: increment(1),
        lastActive: Timestamp.now()
      });
    } catch (error) {
      // If performer doesn't exist, that's okay - we'll just log it
      console.warn('Performer not found for stats update:', performerId);
    }
  }

  // Get user document by Firebase Auth UID
  async getUser(uid: string) {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          id: userSnap.id,
          email: data.email,
          performerId: data.performerId,
          role: data.role,
          fcmToken: data.fcmToken,
          createdAt: data.createdAt?.toMillis()
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  // Get performer by ID
  async getPerformer(id: string): Promise<Performer | null> {
    try {
      const performerRef = doc(db, 'performers', id);
      const performerSnap = await getDoc(performerRef);
      
      if (performerSnap.exists()) {
        const data = performerSnap.data();
        return {
          id: performerSnap.id,
          name: data.name,
          username: data.username,
          status: data.status,
          createdAt: data.createdAt?.toMillis() || Date.now(),
          totalSearches: data.totalSearches || 0,
          lastActive: data.lastActive?.toMillis()
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting performer:', error);
      return null;
    }
  }

  // Update user FCM token
  async updateUserFCMToken(uid: string, fcmToken: string | null): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        fcmToken: fcmToken || null
      });
      console.log(`FCM token ${fcmToken ? 'saved' : 'removed'} for user ${uid}`);
      
      // Verify the token was saved
      if (fcmToken) {
        const userDoc = await getDoc(userRef);
        const savedToken = userDoc.data()?.fcmToken;
        if (savedToken === fcmToken) {
          console.log('FCM token verified in Firestore');
        } else {
          console.warn('FCM token mismatch after save');
        }
      }
    } catch (error) {
      console.error('Error updating FCM token:', error);
      throw error;
    }
  }

  // Create user via Cloud Function or local API server (development only)
  async createUser(email: string, password: string, role: 'performer' | 'admin', performerId?: string): Promise<{ success: boolean; uid: string; email: string }> {
    // Try Cloud Function first
    try {
      const { httpsCallable } = await import('firebase/functions');
      const { functions } = await import('../firebase/config');
      const createUserFunction = httpsCallable(functions, 'createUser');
      
      const result = await createUserFunction({ email, password, role, performerId });
      return result.data as { success: boolean; uid: string; email: string };
    } catch (error: any) {
      console.error('createUser error:', error);
      
      // Handle Firebase Functions HttpsError with user-friendly messages
      if (error.code === 'functions/not-found') {
        throw new Error('Cloud Function not found. Please ensure the function is deployed.');
      }
      
      if (error.code === 'functions/unauthenticated') {
        throw new Error('You must be logged in as an admin to create users.');
      }
      
      if (error.code === 'functions/permission-denied') {
        throw new Error('Only administrators can create users.');
      }
      
      if (error.code === 'functions/already-exists' || error.code === 'already-exists') {
        throw new Error('The email address is already in use by another account.');
      }
      
      if (error.code === 'functions/invalid-argument') {
        throw new Error(error.message || 'Invalid input. Please check your email and password.');
      }
      
      // Check error details for already-exists
      if (error.details?.code === 'already-exists' || error.details?.message?.includes('already in use')) {
        throw new Error('The email address is already in use by another account.');
      }
      
      // Extract error message from HttpsError
      const errorMessage = error.message || error.details?.message || '';
      if (errorMessage) {
        // Check if it's a user-friendly message from our Cloud Function
        if (errorMessage.includes('already in use') || 
            errorMessage.includes('email address') || 
            errorMessage.includes('already-exists') ||
            errorMessage.includes('already exists')) {
          throw new Error('The email address is already in use by another account.');
        }
      }
      
      // Only try local API server in development
      const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
      
      if (isDevelopment) {
        console.warn('Cloud Function failed, trying local API server...', error.message);
        
        try {
          const response = await fetch('http://localhost:3001/api/create-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, role, performerId }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create user');
          }

          const result = await response.json();
          return {
            success: result.success,
            uid: result.uid,
            email: result.email
          };
        } catch (localError: any) {
          // If local server also fails, provide helpful error
          if (localError.message?.includes('fetch failed') || localError.message?.includes('ECONNREFUSED')) {
            throw new Error(
              'Cloud Function failed and local API server is not running.\n\n' +
              'Please start the local server with: npm run server\n\n' +
              'Or use the script: npm run create-user ' + email + ' "' + password + '" ' + role + ' ' + (performerId || '')
            );
          }
          throw new Error(localError.message || 'Failed to create user');
        }
      } else {
        // In production, throw the original error with a user-friendly message
        throw new Error(error.message || 'Failed to create user. Please try again or contact support.');
      }
    }
  }

  // Get all users (admin only)
  async getAllUsers() {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email,
          role: data.role,
          performerId: data.performerId,
          createdAt: data.createdAt?.toMillis()
        };
      });
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  // Update user's performer ID
  async updateUserPerformerId(uid: string, performerId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        performerId: performerId
      });
    } catch (error) {
      console.error('Error updating user performer ID:', error);
      throw error;
    }
  }
}

export const firestoreService = new FirestoreService();
