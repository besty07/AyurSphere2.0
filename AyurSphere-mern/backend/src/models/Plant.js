import mongoose from 'mongoose';

const plantSchema = new mongoose.Schema(
  {
    plantName: { type: String, required: true, trim: true },
    scientificName: { type: String, trim: true },
    description: { type: String, default: '' },
    uses: { type: String, default: '' },
    imagePath: { type: String, default: '' },
    category: { type: String, default: 'Herb' },

    /* ── Extended detail fields ── */
    aka: { type: String, default: '' },
    overview: [{ type: String }],
    diseases: [{ type: String }],
    partsUsed: [
      {
        part: { type: String },
        properties: { type: String },
        uses: { type: String },
      },
    ],
    usageMethods: [
      {
        emoji: { type: String },
        name: { type: String },
        desc: { type: String },
      },
    ],
    ayurvedicProfile: {
      rasa: { type: String, default: '' },
      virya: { type: String, default: '' },
      vipaka: { type: String, default: '' },
      dosha: { type: String, default: '' },
    },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Approved' },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Plant = mongoose.model('Plant', plantSchema);
