import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const PickupRequestSchema = new Schema(
  {
    passenger: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    driver: { type: Schema.Types.ObjectId, ref: 'Driver' }, // assigned driver
    pickupStop: { type: Schema.Types.ObjectId, ref: 'Stop', required: true },
    destinationStop: { type: Schema.Types.ObjectId, ref: 'Stop' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    eta: { type: Number }, // estimated minutes to arrival
    notes: { type: String },
  },
  { timestamps: true }
);

export default model('PickupRequest', PickupRequestSchema);
