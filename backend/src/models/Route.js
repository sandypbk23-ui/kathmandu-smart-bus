import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  stops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Stop', required: true }],
  pathCoordinates: {
    type: [{ type: Number }], // flat array [lng, lat, lng, lat, ...]
    default: []
  },
  assignedBusId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
}, { timestamps: true });

export default mongoose.model('Route', routeSchema);
