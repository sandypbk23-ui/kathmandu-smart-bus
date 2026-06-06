import mongoose from 'mongoose';

const stopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  order: { type: Number } // optional ordering within a route
}, { timestamps: true });

stopSchema.index({ location: '2dsphere' });

export default mongoose.model('Stop', stopSchema);
