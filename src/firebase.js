/* ==========================================================
   safeCIZ — Firebase Realtime & Cloud Integration
   100% Free Tier Setup (Firestore, Realtime DB, Storage & FCM)
   ========================================================== */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, push } from 'firebase/database';
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// (Replace with your actual keys from Firebase Console: https://console.firebase.google.com)
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD-mockSafeCIZApiKey2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "safeciz-sos-default.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DB_URL || "https://safeciz-sos-default-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "safeciz-sos-default",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "safeciz-sos-default.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1029384756",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1029384756:web:abcdef123456"
};

let app, database, firestore, storage;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  firestore = getFirestore(app);
  storage = getStorage(app);
  console.log('🛡️ safeCIZ: Firebase Cloud Module Initialized');
} catch (error) {
  console.warn('⚠️ safeCIZ: Running in Local Fallback Mode (Add Firebase Keys in .env to connect live cloud)');
}

export { app, database, firestore, storage };

/**
 * Broadcast an SOS incident to Firebase Realtime Database
 */
export async function streamSOSIncident(incidentData) {
  if (database) {
    try {
      const incidentsRef = ref(database, 'sos_incidents/' + incidentData.id);
      await set(incidentsRef, {
        ...incidentData,
        timestamp: Date.now()
      });
      return true;
    } catch (e) {
      console.error('Firebase DB Error:', e);
    }
  }
  return false;
}

/**
 * Listen for Realtime SOS alerts in Admin Dashboard
 */
export function subscribeToLiveIncidents(callback) {
  if (database) {
    try {
      const incidentsRef = ref(database, 'sos_incidents');
      return onValue(incidentsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          callback(Object.values(data));
        }
      });
    } catch (e) {
      console.warn('Realtime subscription fallback');
    }
  }
}
