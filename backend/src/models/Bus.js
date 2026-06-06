import mongoose from 'mongoose';

const busSchema = new mongoose.Schema({
  plateNumber: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
  },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  status: { type: String, enum: ['online', 'offline', 'breakdown'], default: 'offline' }
}, { timestamps: true });

// Geo index for location queries
busSchema.index({ currentLocation: '2dsphere' });

export default mongoose.model('Bus', busSchema);
