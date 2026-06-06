// src/routes/passenger.js
import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect, role } from '../middleware/auth.js';
import Bus from '../models/Bus.js';
import Route from '../models/Route.js';
import Ticket from '../models/Ticket.js';
import PickupRequest from '../models/PickupRequest.js';
import mongoose from 'mongoose';

const router = express.Router();

// @desc    Get nearby buses (within radius km)
// @route   GET /api/v1/passenger/nearby?lat=..&lng=..&radius=5
// @access  Passenger
router.get(
  '/nearby',
  protect,
  role(['passenger']),
  asyncHandler(async (req, res) => {
    const { lat, lng, radius = 5 } = req.query;
    if (!lat || !lng) {
      res.status(400);
      throw new Error('lat and lng query params required');
    }
    const nearby = await Bus.find({
      currentLocation: {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
          $maxDistance: radius * 1000, // meters
        },
      },
    }).limit(20);
    res.json(nearby);
  })
);

// @desc    Create a pickup request (one‑click)
// @route   POST /api/v1/passenger/pickup-request
// @access  Passenger
router.post(
  '/pickup-request',
  protect,
  role(['passenger']),
  asyncHandler(async (req, res) => {
    const { pickupStopId, destinationStopId } = req.body;
    if (!pickupStopId) {
      res.status(400);
      throw new Error('pickupStopId required');
    }
    const request = await PickupRequest.create({
      passenger: req.user.id,
      pickupStop: mongoose.Types.ObjectId(pickupStopId),
      destinationStop: destinationStopId ? mongoose.Types.ObjectId(destinationStopId) : undefined,
    });
    // In real implementation a driver matching algorithm runs here.
    res.status(201).json({ message: 'Pickup request created', request });
  })
);

// @desc    Get passenger's tickets
// @route   GET /api/v1/passenger/tickets
// @access  Passenger
router.get(
  '/tickets',
  protect,
  role(['passenger']),
  asyncHandler(async (req, res) => {
    const tickets = await Ticket.find({ userId: req.user.id })
      .populate('busId', 'plateNumber')
      .populate('routeId', 'name');
    res.json(tickets);
  })
);

export default router;
