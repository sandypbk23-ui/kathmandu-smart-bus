import { Server as SocketIOServer } from 'socket.io';
import { Bus } from './models/Bus.js';
import { PickupRequest } from './models/PickupRequest.js';
import { Notification } from './models/Notification.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Socket.IO with CORS settings (already in server.js)
export const initSocket = (io) => {
  // Map of driverId -> socket.id for quick lookup
  const driverSockets = new Map();

  // When a driver connects, they must emit 'driverJoin' with their driverId
  io.on('connection', (socket) => {
    console.log('🟢 Socket connected:', socket.id);

    // Driver identification
    socket.on('driverJoin', (payload) => {
      const { driverId } = payload;
      if (driverId) {
        driverSockets.set(driverId, socket.id);
        console.log(`Driver ${driverId} associated with socket ${socket.id}`);
      }
    });

    // Passenger joins a route room to receive live bus locations
    socket.on('joinRoute', ({ routeId }) => {
      if (routeId) {
        socket.join(`route_${routeId}`);
        console.log(`Socket ${socket.id} joined route_${routeId}`);
      }
    });

    // Driver emits current GPS location
    socket.on('driverLocation', async ({ driverId, busId, lat, lng, bearing }) => {
      try {
        // Update bus location in DB
        await Bus.findByIdAndUpdate(busId, {
          currentLocation: { type: 'Point', coordinates: [lng, lat] },
          bearing,
        });
        // Broadcast to passengers subscribed to the bus's route
        const bus = await Bus.findById(busId).populate('route');
        if (bus && bus.route) {
          io.to(`route_${bus.route._id}`).emit('busLocationUpdate', {
            busId,
            lat,
            lng,
            bearing,
          });
        }
      } catch (err) {
        console.error('Error updating driver location:', err);
      }
    });

    // Passenger creates a pickup request
    socket.on('createPickup', async ({ passengerId, pickupStopId, destStopId }) => {
      try {
        const request = await PickupRequest.create({
          passenger: passengerId,
          pickupStop: pickupStopId,
          destinationStop: destStopId,
          status: 'PENDING',
        });
        // Find nearby drivers (simple example: all drivers online)
        // In a real system you'd query geo index for proximity.
        const onlineDrivers = await Driver.find({ status: 'ONLINE' });
        onlineDrivers.forEach((driver) => {
          const driverSocketId = driverSockets.get(driver._id.toString());
          if (driverSocketId) {
            io.to(driverSocketId).emit('newPickupRequest', {
              requestId: request._id,
              passengerId,
              pickupStopId,
              destStopId,
            });
          }
        });
      } catch (err) {
        console.error('Error creating pickup request:', err);
      }
    });

    // Driver accepts or rejects a request
    socket.on('respondPickup', async ({ driverId, requestId, accept }) => {
      try {
        const request = await PickupRequest.findById(requestId);
        if (!request) return;
        if (accept) {
          request.status = 'ACCEPTED';
          request.driver = driverId;
          await request.save();
          // Notify passenger
          const passengerSocketRooms = Array.from(io.sockets.adapter.rooms.entries())
            .filter(([room]) => room.startsWith('passenger_'))
            .map(([, sockets]) => sockets);
          // Simplified: emit to all (real impl would target specific passenger socket)
          io.emit('pickupResponse', {
            requestId,
            status: 'ACCEPTED',
            driverId,
          });
        } else {
          request.status = 'REJECTED';
          await request.save();
          io.emit('pickupResponse', {
            requestId,
            status: 'REJECTED',
            driverId,
          });
        }
      } catch (err) {
        console.error('Error handling pickup response:', err);
      }
    });

    // General notifications (e.g., service alerts)
    socket.on('sendNotification', async ({ userId, type, message, data }) => {
      try {
        const notif = await Notification.create({ user: userId, type, message, data, read: false });
        // Find socket(s) belonging to the user – assume each user joins a private room
        io.to(`user_${userId}`).emit('notification', notif);
      } catch (err) {
        console.error('Error sending notification:', err);
      }
    });

    // Cleanup on disconnect
    socket.on('disconnect', () => {
      // Remove driver association if present
      for (const [driverId, sockId] of driverSockets.entries()) {
        if (sockId === socket.id) {
          driverSockets.delete(driverId);
          console.log(`Driver ${driverId} disconnected and removed from map`);
        }
      }
    });
  });
};
