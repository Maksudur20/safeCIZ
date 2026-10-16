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
 * Resolve / dismiss an SOS incident in Firebase
 */
export async function resolveSOSIncidentInFirebase(incidentId) {
  try {
    const incRef = ref(database, 'sos_incidents/' + incidentId);
    await set(incRef, null); // Delete from active incidents
    return true;
  } catch (e) {
    console.error('Firebase DB Resolve Error:', e);
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
      } else {
        callback([]);
      }
    });
  } catch (e) {
    console.warn('Realtime subscription error:', e);
  }
}

/**
 * Listen for Realtime e-KYC applications from Mobile App
 */
export function subscribeToKYCQueue(callback) {
  try {
    const kycRef = ref(database, 'kyc_applications');
    return onValue(kycRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback(Object.values(data));
      } else {
        callback([]);
      }
    });
  } catch (e) {
    console.warn('KYC subscription error:', e);
  }
}

/**
 * Update KYC Application status (APPROVED or REJECTED) in Firebase Cloud
 */
export async function updateKYCStatusInFirebase(kycId, phone, status) {
  try {
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
    // 1. Update KYC application record
    await set(ref(database, 'kyc_applications/' + kycId + '/status'), status);
    // 2. Update citizen user account record so mobile app immediately detects approval
    if (cleanPhone) {
      await set(ref(database, 'users/' + cleanPhone + '/status'), status);
    }
    return true;
  } catch (e) {
    console.error('Error updating KYC status in Firebase:', e);
    return false;
  }
}

/**
 * Clear all KYC applications from Firebase Realtime Database
 */
export async function clearAllKYCFromFirebase() {
  try {
    await set(ref(database, 'kyc_applications'), null);
    return true;
  } catch (e) {
    console.error('Error clearing KYC from Firebase:', e);
    return false;
  }
}

/**
 * Save new Police Officer to Firebase Cloud
 */
export async function savePoliceOfficerToFirebase(officer) {
  try {
    const username = officer.username;
    await set(ref(database, 'police_officers/' + username), officer);
    return true;
  } catch (e) {
    console.error('Error saving officer to Firebase:', e);
    return false;
  }
}

/**
 * Listen for Realtime Police Officers Roster from Firebase Cloud
 */
export function subscribeToPoliceRoster(callback) {
  try {
    const rosterRef = ref(database, 'police_officers');
    return onValue(rosterRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback(Object.values(data));
      }
    });
  } catch (e) {
    console.warn('Police roster subscription error:', e);
  }
}
