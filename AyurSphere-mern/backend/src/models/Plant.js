import mongoose from 'mongoose';

const plantSchema = new mongoose.Schema(
  {
    plantName: { type: String, required: true, trim: true },
    scientificName: { type: String, trim: true },
    description: { type: String, default: '' },
    uses: { type: String, default: '' },
    imagePath: { type: String, default: '' },
    category: { type: String, default: 'Herb' },
  },
  { timestamps: true }
);

export const Plant = mongoose.model('Plant', plantSchema);
