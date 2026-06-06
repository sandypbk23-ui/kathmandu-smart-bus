// src/routes/driver.js
import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect, role } from '../middleware/auth.js';
import Driver from '../models/Driver.js';
import Bus from '../models/Bus.js';
import PickupRequest from '../models/PickupRequest.js';
import Notification from '../models/Notification.js';
import mongoose from 'mongoose';

const router = express.Router();

// @desc    Get driver dashboard summary
// @route   GET /api/v1/driver/dashboard
// @access  Driver
router.get(
  '/dashboard',
  protect,
  role(['driver']),
  asyncHandler(async (req, res) => {
    const driver = await Driver.findOne({ user: req.user.id }).populate('vehicleId');
    if (!driver) {
      res.status(404);
      throw new Error('Driver profile not found');
    }
    const upcomingRequests = await PickupRequest.find({ driver: driver._id, status: 'pending' })
      .populate('pickupStop', 'name location')
      .populate('destinationStop', 'name location');
    res.json({ driver, upcomingRequests });
  })
);

// @desc    Accept a passenger pickup request
// @route   POST /api/v1/driver/accept-request/:id
// @access  Driver
router.post(
  '/accept-request/:id',
  protect,
  role(['driver']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const driver = await Driver.findOne({ user: req.user.id });
    if (!driver) {
      res.status(404);
      throw new Error('Driver not found');
    }
    const request = await PickupRequest.findById(id);
    if (!request) {
      res.status(404);
      throw new Error('Pickup request not found');
    }
    if (request.status !== 'pending') {
      res.status(400);
      throw new Error('Request is not pending');
    }
    request.driver = driver._id;
    request.status = 'accepted';
    await request.save();
    // Notify passenger via Notification collection (stub)
    await Notification.create({
      user: request.passenger,
      type: 'REQUEST_ACCEPTED',
      payload: { requestId: request._id, driverId: driver._id },
    });
    res.json({ message: 'Request accepted', request });
  })
);

// @desc    Update driver status (online/offline/breakdown)
// @route   PATCH /api/v1/driver/status
// @access  Driver
router.patch(
  '/status',
  protect,
  role(['driver']),
  asyncHandler(async (req, res) => {
    const { status, location } = req.body; // status enum, location [lng, lat]
    const driver = await Driver.findOne({ user: req.user.id });
    if (!driver) {
      res.status(404);
      throw new Error('Driver not found');
    }
    if (status) driver.status = status;
    if (location && Array.isArray(location) && location.length === 2) {
      driver.location = { type: 'Point', coordinates: location };
    }
    await driver.save();
    res.json({ message: 'Driver status updated', driver });
  })
);

export default router;
