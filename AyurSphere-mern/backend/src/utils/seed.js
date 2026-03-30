import 'dotenv/config';
import { connectDB } from '../config/db.js';
import { Plant } from '../models/Plant.js';

const samplePlants = [
  {
    plantName: 'Tulsi',
    scientificName: 'Ocimum sanctum',
    description: 'Aromatic plant revered for immunity and respiratory support.',
    uses: 'Immunity, Stress relief, Respiratory',
    imagePath: 'https://images.unsplash.com/photo-1585238342052-771c6e5c74e5?auto=format&fit=crop&w=600&q=80',
    category: 'Immunity',
  },
  {
    plantName: 'Ashwagandha',
    scientificName: 'Withania somnifera',
    description: 'Adaptogenic herb used for energy and stress balance.',
    uses: 'Adaptogen, Stress relief, Stamina',
    imagePath: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600&q=80',
    category: 'Adaptogen',
  },
  {
    plantName: 'Turmeric',
    scientificName: 'Curcuma longa',
    description: 'Rhizome rich in curcumin, known for anti-inflammatory action.',
    uses: 'Anti-inflammatory, Digestive, Skin care',
    imagePath: 'https://images.unsplash.com/photo-1615485290382-4412c998c3c4?auto=format&fit=crop&w=600&q=80',
    category: 'Anti-inflammatory',
  },
];

const run = async () => {
  await connectDB(process.env.MONGODB_URI);
  const count = await Plant.countDocuments();
  if (count === 0) {
    await Plant.insertMany(samplePlants);
    console.log('🌱 Seeded sample plants');
  } else {
    console.log('🌿 Plants already exist, skipping seed');
  }
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
