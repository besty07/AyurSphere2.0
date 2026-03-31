import 'dotenv/config';
import { connectDB } from '../config/db.js';
import { Plant } from '../models/Plant.js';
import { Product } from '../models/Product.js';

const productTypes = [
  { type: 'Powder', suffix: 'Powder', priceMulti: 1, desc: 'Pure herb powder for traditional use' },
  { type: 'Tablets', suffix: 'Tablets', priceMulti: 1.5, desc: 'Convenient tablet form' },
  { type: 'Tincture', suffix: 'Tincture', priceMulti: 2, desc: 'Liquid extract form' },
  { type: 'Capsules', suffix: 'Capsules', priceMulti: 1.8, desc: 'Easy to consume capsules' },
];

const run = async () => {
  await connectDB(process.env.MONGODB_URI);
  
  const plants = await Plant.find().limit(5); // get some plants to seed
  
  let productsSeeded = 0;
  
  for (const plant of plants) {
    for (const pType of productTypes) {
      const existing = await Product.findOne({ plantId: plant._id, type: pType.type });
      if (!existing) {
        await Product.create({
          plantId: plant._id,
          name: `${plant.plantName} ${pType.suffix}`,
          description: pType.desc,
          price: Math.floor((199 * pType.priceMulti) / 50) * 50 - 1,
          type: pType.type,
          image: plant.imagePath
        });
        productsSeeded++;
      }
    }
  }
  
  console.log(`📦 Seeded ${productsSeeded} products`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
