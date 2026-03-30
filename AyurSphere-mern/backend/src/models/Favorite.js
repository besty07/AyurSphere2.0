import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plant: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
  },
  { timestamps: { createdAt: 'addedAt', updatedAt: 'updatedAt' } }
);

favoriteSchema.index({ user: 1, plant: 1 }, { unique: true });

export const Favorite = mongoose.model('Favorite', favoriteSchema);
