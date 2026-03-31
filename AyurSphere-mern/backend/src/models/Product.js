import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    plantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: '' },
    type: { type: String, default: 'Powder', enum: ['Powder', 'Tablets', 'Tincture', 'Capsules', 'Oil', 'Tea', 'Other'] },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Product = mongoose.model('Product', productSchema);
