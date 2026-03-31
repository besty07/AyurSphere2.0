import 'dotenv/config';
import { connectDB } from '../config/db.js';
import { Plant } from '../models/Plant.js';
import { Product } from '../models/Product.js';

const productTypes = [
  { type: 'Powder', suffix: 'Powder', basePrice: 199, desc: 'Pure herb powder for traditional use', image: '/images/ashwagandha-powder.png' },
  { type: 'Tablets', suffix: 'Tablets', basePrice: 249, desc: 'Convenient tablet form', image: '/images/ashwagandha-tablets.png' },
  { type: 'Tincture', suffix: 'Tincture', basePrice: 349, desc: 'Liquid extract form', image: '/images/ashwagandha-tincture.png' },
  { type: 'Capsules', suffix: 'Capsules', basePrice: 299, desc: 'Easy to consume capsules', image: '/images/ashwagandha-capsules.png' },
];

const run = async () => {
  await connectDB(process.env.MONGODB_URI);
  
  // Wipe all existing products to cleanly apply 4 products per plant
  await Product.deleteMany({});
  console.log('Cleared existing products.');

  const plants = await Plant.find({});
  let productsSeeded = 0;
  
  for (const plant of plants) {
    for (const pType of productTypes) {
      // Add a slight variance to price depending on plant string length to make it look unique but stable
      const variance = (plant.plantName.length % 5) * 20; 
      const finalPrice = pType.basePrice + variance - ((plant.plantName.length % 2 === 0) ? 0 : 50);

      await Product.create({
        plantId: plant._id,
        name: `${plant.plantName} ${pType.suffix}`,
        description: pType.desc,
        price: finalPrice > 99 ? finalPrice : 149,
        type: pType.type,
        image: pType.image
      });
      productsSeeded++;
    }
  }
  
  console.log(`✅ Seeded exactly 4 products for ALL ${plants.length} plants (Total: ${productsSeeded} products) with varied prices and same images.`);
  process.exit(0);
};

run().catch(console.error);
