import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    email: { type: String, trim: true },
    mobile: { type: String, trim: true },
    age: { type: Number },
    gender: { type: String },
    address: { type: String },
    medicalHistory: { type: String },
    profilePicture: { type: String }
  },
  { timestamps: { createdAt: 'createdAt' } }
);

export const User = mongoose.model('User', userSchema);
