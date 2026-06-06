// src/routes/admin.js
import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect, role } from '../middleware/auth.js';
import Bus from '../models/Bus.js';
import Driver from '../models/Driver.js';
import Route from '../models/Route.js';
import Stop from '../models/Stop.js';
import User from '../models/User.js';
import Ticket from '../models/Ticket.js';
import mongoose from 'mongoose';

const router = express.Router();

// Apply admin protection to all routes
router.use(protect, role(['admin']));

// @desc    Get system analytics summary
// @route   GET /api/v1/admin/analytics
// @access  Admin
router.get(
  '/analytics',
  asyncHandler(async (req, res) => {
    const totalBuses = await Bus.countDocuments();
    const activeBuses = await Bus.countDocuments({ status: 'online' });
    const onlineDrivers = await Driver.countDocuments({ status: 'online' });
    const totalPassengers = await User.countDocuments({ role: 'passenger' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyPassengers = await Ticket.countDocuments({ createdAt: { $gte: today } });
    const revenue = await Ticket.aggregate([
      { $group: { _id: null, total: { $sum: '$price' } } },
    ]);
    const totalRevenue = revenue[0] ? revenue[0].total : 0;
    res.json({ totalBuses, activeBuses, onlineDrivers, totalPassengers, dailyPassengers, totalRevenue });
  })
);

// ---------- Bus Management ----------
router.get(
  '/buses',
  asyncHandler(async (req, res) => {
    const buses = await Bus.find().populate('driverId', 'licenseNumber');
    res.json(buses);
  })
);

router.post(
  '/buses',
  asyncHandler(async (req, res) => {
    const { plateNumber, capacity, driverId } = req.body;
    const bus = await Bus.create({ plateNumber, capacity, driverId });
    res.status(201).json(bus);
  })
);

router.put(
  '/buses/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const bus = await Bus.findByIdAndUpdate(id, req.body, { new: true });
    if (!bus) {
      res.status(404);
      throw new Error('Bus not found');
    }
    res.json(bus);
  })
);

router.delete(
  '/buses/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const bus = await Bus.findByIdAndDelete(id);
    if (!bus) {
      res.status(404);
      throw new Error('Bus not found');
    }
    res.json({ message: 'Bus removed' });
  })
);

// ---------- Route Management ----------
router.get(
  '/routes',
  asyncHandler(async (req, res) => {
    const routes = await Route.find().populate('stops');
    res.json(routes);
  })
);

router.post(
  '/routes',
  asyncHandler(async (req, res) => {
    const { name, stops, pathCoordinates, assignedBusId } = req.body;
    const route = await Route.create({ name, stops, pathCoordinates, assignedBusId });
    res.status(201).json(route);
  })
);

router.put(
  '/routes/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const route = await Route.findByIdAndUpdate(id, req.body, { new: true });
    if (!route) {
      res.status(404);
      throw new Error('Route not found');
    }
    res.json(route);
  })
);

router.delete(
  '/routes/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const route = await Route.findByIdAndDelete(id);
    if (!route) {
      res.status(404);
      throw new Error('Route not found');
    }
    res.json({ message: 'Route removed' });
  })
);

// ---------- Driver Management ----------
router.get(
  '/drivers',
  asyncHandler(async (req, res) => {
    const drivers = await Driver.find().populate('user', 'email phone');
    res.json(drivers);
  })
);

router.patch(
  '/drivers/:id/verify',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const driver = await Driver.findById(id);
    if (!driver) {
      res.status(404);
      throw new Error('Driver not found');
    }
    driver.verified = true;
    await driver.save();
    res.json({ message: 'Driver verified', driver });
  })
);

router.patch(
  '/drivers/:id/status',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const driver = await Driver.findByIdAndUpdate(id, { status }, { new: true });
    if (!driver) {
      res.status(404);
      throw new Error('Driver not found');
    }
    res.json(driver);
  })
);

router.delete(
  '/drivers/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    await Driver.findByIdAndDelete(id);
    res.json({ message: 'Driver removed' });
  })
);

// ---------- Passenger Management ----------
router.get(
  '/passengers',
  asyncHandler(async (req, res) => {
    const passengers = await User.find({ role: 'passenger' }).select('-passwordHash');
    res.json(passengers);
  })
);

router.delete(
  '/passengers/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: 'Passenger removed' });
  })
);

// ---------- Reports (stub) ----------
router.get(
  '/reports/daily',
  asyncHandler(async (req, res) => {
    // Placeholder – in production this would generate a PDF/Excel file.
    res.json({ message: 'Daily report generation stub' });
  })
);
router.get(
  '/reports/weekly',
  asyncHandler(async (req, res) => {
    res.json({ message: 'Weekly report generation stub' });
  })
);
router.get(
  '/reports/monthly',
  asyncHandler(async (req, res) => {
    res.json({ message: 'Monthly report generation stub' });
  })
);

export default router;
