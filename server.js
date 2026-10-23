/**
 * safeCIZ Socket.IO Real-Time Emergency & Location Dispatch Server
 * Built with official Socket.IO v4 standards (https://socket.io/docs/v4/)
 */

import http from 'http';
import { Server } from 'socket.io';

const PORT = process.env.PORT || 3001;

// Create standard HTTP server
const httpServer = http.createServer((req, res) => {
  // Simple health check endpoint
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({
      status: 'online',
      service: 'safeCIZ Socket.IO Dispatch Server',
      activeIncidents: activeIncidents.size,
      connectedClients: io.engine.clientsCount,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

// Initialize Socket.IO Server with CORS
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: false
  },
  pingTimeout: 20000,
  pingInterval: 10000
});

// In-Memory Live State
const activeIncidents = new Map();
const connectedDevices = new Map();

io.on('connection', (socket) => {
  console.log(`[Socket.IO] New client connected: ${socket.id}`);

  // Handshake registration
  socket.on('register', (data) => {
    connectedDevices.set(socket.id, {
      id: socket.id,
      role: data?.role || 'citizen',
      name: data?.name || 'Anonymous',
      phone: data?.phone || '',
      connectedAt: new Date().toISOString()
    });
    console.log(`[Socket.IO] Client registered as ${data?.role}: ${data?.name} (${socket.id})`);
    
    // Immediately send current active incidents to newly joined client
    socket.emit('active_incidents', Array.from(activeIncidents.values()));
  });

  // Client requests active incidents
  socket.on('get:active_incidents', () => {
    socket.emit('active_incidents', Array.from(activeIncidents.values()));
  });

  /**
   * 1. Emergency SOS Triggered (High Priority)
   * Victim phone emits real GPS coordinates
   */
  socket.on('sos:trigger', (payload) => {
    console.log(`[Socket.IO 🚨 SOS TRIGGERED]`, payload);
    const incidentId = payload.id || `sos-${Date.now()}`;
    const incidentData = {
      id: incidentId,
      victimName: payload.victimName || 'নাগরিক (Citizen)',
      phone: payload.phone || '',
      bloodGroup: payload.bloodGroup || 'Unknown',
      lat: Number(payload.lat),
      lng: Number(payload.lng),
      accuracy: payload.accuracy || 5.0,
      speed: payload.speed || '০ কিমি/ঘণ্টা',
      locationName: payload.locationName || `GPS: ${Number(payload.lat).toFixed(4)}, ${Number(payload.lng).toFixed(4)}`,
      status: 'ACTIVE',
      assignedTo: payload.assignedTo || 'নিকটস্থ পেট্রোল টিম খোঁজা হচ্ছে...',
      startedAt: 'এখনই',
      timestamp: Date.now()
    };

    activeIncidents.set(incidentId, incidentData);

    // Broadcast immediately to ALL connected web dashboard admins & police units
    io.emit('sos:broadcast', incidentData);
  });

  /**
   * 2. Real-Time Moving GPS Location Stream (Victim or Police)
   * Emitted every 5-10 meters as position changes
   */
  socket.on('location:update', (payload) => {
    const { id, type, lat, lng, speed, heading, accuracy } = payload;
    
    // If it's an active incident, update its live position
    if (activeIncidents.has(id)) {
      const inc = activeIncidents.get(id);
      inc.lat = Number(lat);
      inc.lng = Number(lng);
      inc.speed = speed ? `${(speed * 3.6).toFixed(1)} কিমি/ঘণ্টা` : inc.speed;
      inc.accuracy = accuracy;
      inc.lastUpdate = Date.now();
      activeIncidents.set(id, inc);
    }

    // Stream live movement coordinates to everyone (60fps Leaflet/Flutter Map marker updates)
    io.emit('location:stream', {
      id,
      type: type || 'victim', // 'victim' or 'police'
      lat: Number(lat),
      lng: Number(lng),
      speed,
      heading,
      accuracy,
      timestamp: Date.now()
    });
  });

  /**
   * 3. Police Unit Dispatched
   */
  socket.on('police:dispatch', (payload) => {
    console.log(`[Socket.IO 🚓 POLICE DISPATCH]`, payload);
    const { incidentId, officerName, policeLat, policeLng, eta } = payload;
    if (activeIncidents.has(incidentId)) {
      const inc = activeIncidents.get(incidentId);
      inc.assignedTo = officerName || 'ধানমন্ডি পেট্রোল টিম #০৩';
      activeIncidents.set(incidentId, inc);
    }
    io.emit('police:dispatched', payload);
  });

  /**
   * 4. Emergency Resolved / Cancelled
   */
  socket.on('sos:resolve', (payload) => {
    console.log(`[Socket.IO ✓ SOS RESOLVED]`, payload);
    const incidentId = payload.incidentId || payload.id;
    if (activeIncidents.has(incidentId)) {
      activeIncidents.delete(incidentId);
    }
    io.emit('sos:resolved', { incidentId });
  });

  // Client Disconnected
  socket.on('disconnect', () => {
    connectedDevices.delete(socket.id);
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Start Server
httpServer.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 safeCIZ Socket.IO Real-Time Dispatch Server Online`);
  console.log(`📡 Listening on: http://localhost:${PORT}`);
  console.log(`📚 Socket.IO v4 Protocol Active with High-Accuracy GPS`);
  console.log(`=======================================================`);
});
