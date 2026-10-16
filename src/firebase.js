/* ==========================================================
   safeCIZ — Official Firebase Cloud Configuration
   Connected to live Firebase Cloud Project: safeciz
   ========================================================== */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, push } from 'firebase/database';
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: "AIzaSyAqPbrICI7B5O0vIfB96aY_W8CqaDSVQ-I",
  authDomain: "safeciz.firebaseapp.com",
  databaseURL: "https://safeciz-default-rtdb.firebaseio.com",
  projectId: "safeciz",
  storageBucket: "safeciz.firebasestorage.app",
  messagingSenderId: "704900296869",
  appId: "1:704900296869:web:bb167f15b035515ae05d4c",
  measurementId: "G-7NL0D97XYW"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

console.log('🛡️ safeCIZ: Live Firebase Cloud Connected successfully to [safeciz]!');

export { app, database, firestore, storage };

/**
 * Broadcast an SOS incident to Firebase Realtime Database
 */
export async function streamSOSIncident(incidentData) {
  try {
    const incidentsRef = ref(database, 'sos_incidents/' + incidentData.id);
    await set(incidentsRef, {
      ...incidentData,
      timestamp: Date.now()
    });
    return true;
  } catch (e) {
    console.error('Firebase DB Error:', e);
    return false;
  }
}

/**
 * Listen for Realtime SOS alerts in Admin Dashboard
 */
export function subscribeToLiveIncidents(callback) {
  try {
    const incidentsRef = ref(database, 'sos_incidents');
    return onValue(incidentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback(Object.values(data));
      }
    });
  } catch (e) {
    console.warn('Realtime subscription error:', e);
  }
}
