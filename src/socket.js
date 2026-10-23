/**
 * safeCIZ Socket.IO Real-Time Dispatch & Location Tracking Client
 * Based on Socket.IO v4 Client API (https://socket.io/docs/v4/client-api/)
 */

import { io } from 'socket.io-client';

// Determine Socket.IO server URL dynamically
const getSocketServerUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  const hostname = window.location.hostname || 'localhost';
  const port = 3001;
  const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
  return `${protocol}//${hostname}:${port}`;
};

export let socketInstance = null;
let isConnected = false;

/**
 * Initialize Socket.IO Client connection
 */
export function initSocketClient({
  role = 'admin',
  name = 'safeCIZ Command Center',
  onConnect = null,
  onDisconnect = null,
  onSOSBroadcast = null,
  onLocationStream = null,
  onPoliceDispatched = null,
  onSOSResolved = null,
  onActiveIncidents = null
} = {}) {
  if (socketInstance) {
    return socketInstance;
  }

  const serverUrl = getSocketServerUrl();
  console.log(`[Socket.IO Client] Connecting to: ${serverUrl}`);

  try {
    socketInstance = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 10000,
      autoConnect: true
    });

    socketInstance.on('connect', () => {
      isConnected = true;
      console.log(`[Socket.IO Client] Connected successfully! ID: ${socketInstance.id}`);
      
      // Register with server
      socketInstance.emit('register', { role, name });

      if (onConnect) onConnect(socketInstance.id);
    });

    socketInstance.on('disconnect', (reason) => {
      isConnected = false;
      console.warn(`[Socket.IO Client] Disconnected. Reason: ${reason}`);
      if (onDisconnect) onDisconnect(reason);
    });

    socketInstance.on('connect_error', (error) => {
      console.warn(`[Socket.IO Client] Connection notice (Will retry/fallback to Firebase):`, error.message);
    });

    // Active incidents list received on connection
    socketInstance.on('active_incidents', (incidents) => {
      console.log(`[Socket.IO Client] Received active incidents:`, incidents);
      if (onActiveIncidents) onActiveIncidents(incidents);
    });

    // High Priority: Real-time Emergency SOS Broadcast
    socketInstance.on('sos:broadcast', (incident) => {
      console.log(`[Socket.IO Client 🚨] Incoming SOS Broadcast:`, incident);
      if (onSOSBroadcast) onSOSBroadcast(incident);
    });

    // Real-Time GPS Movement Stream (Victim or Police)
    socketInstance.on('location:stream', (data) => {
      if (onLocationStream) onLocationStream(data);
    });

    // Police Dispatch Event
    socketInstance.on('police:dispatched', (data) => {
      console.log(`[Socket.IO Client 🚓] Police dispatched:`, data);
      if (onPoliceDispatched) onPoliceDispatched(data);
    });

    // SOS Resolved Event
    socketInstance.on('sos:resolved', (data) => {
      console.log(`[Socket.IO Client ✓] SOS Resolved:`, data);
      if (onSOSResolved) onSOSResolved(data);
    });

  } catch (err) {
    console.error(`[Socket.IO Client] Initialization error:`, err);
  }

  return socketInstance;
}

/**
 * Emit SOS Trigger event
 */
export function socketTriggerSOS(incidentData) {
  if (socketInstance && socketInstance.connected) {
    socketInstance.emit('sos:trigger', incidentData);
  }
}

/**
 * Emit Moving GPS Location update
 */
export function socketUpdateLocation(locationData) {
  if (socketInstance && socketInstance.connected) {
    socketInstance.emit('location:update', locationData);
  }
}

/**
 * Emit Police Unit Dispatch
 */
export function socketDispatchPolice(dispatchData) {
  if (socketInstance && socketInstance.connected) {
    socketInstance.emit('police:dispatch', dispatchData);
  }
}

/**
 * Emit SOS Resolved
 */
export function socketResolveSOS(incidentId) {
  if (socketInstance && socketInstance.connected) {
    socketInstance.emit('sos:resolve', { incidentId });
  }
}
