import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['passenger', 'driver', 'admin'], default: 'passenger' },
  phone: { type: String },
  verified: { type: Boolean, default: false },
  locale: { type: String, enum: ['en', 'ne'], default: 'en' },
  favorites: [{ type: Schema.Types.ObjectId, ref: 'Route' }],
}, { timestamps: true });

export default model('User', userSchema);
