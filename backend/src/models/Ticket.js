import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  seatNumber: { type: String },
  price: { type: Number, required: true },
  qrCodeData: { type: String, required: true }, // store base64 or JWT token string
  status: { type: String, enum: ['active', 'used', 'cancelled'], default: 'active' },
}, { timestamps: true });

export default mongoose.model('Ticket', ticketSchema);
