import 'dotenv/config';
import { connectDB } from '../config/db.js';
import { Plant } from '../models/Plant.js';
import { Product } from '../models/Product.js';

const run = async () => {
  await connectDB(process.env.MONGODB_URI);
  
  // 1. Update Ashwagandha Products with specific images
  const ash = await Plant.findOne({ plantName: /Ashwagandha/i });
  if (ash) {
    await Product.updateOne({ plantId: ash._id, type: 'Powder' }, { image: '/images/ashwagandha-powder.png', name: 'Ashwagandha Powder', description: 'Pure herb powder for traditional use', price: 199 });
    await Product.updateOne({ plantId: ash._id, type: 'Tablets' }, { image: '/images/ashwagandha-tablets.png', name: 'Ashwagandha Tablets', description: 'Convenient tablet form', price: 299 });
    await Product.updateOne({ plantId: ash._id, type: 'Tincture' }, { image: '/images/ashwagandha-tincture.png', name: 'Ashwagandha Tincture', description: 'Liquid extract form', price: 399 });
    await Product.updateOne({ plantId: ash._id, type: 'Capsules' }, { image: '/images/ashwagandha-capsules.png', name: 'Ashwagandha Capsules', description: 'Easy to consume capsules', price: 349 });
    console.log("✅ Ashwagandha products updated with custom images and prices.");
    
    // Set unique usage for Ashwagandha
    await Plant.updateOne({ _id: ash._id }, {
      usageMethods: [
        { name: 'Warm Milk (Kshirpak)', desc: 'Mix 1/2 tsp of ashwagandha powder in warm milk with a pinch of nutmeg before bed for better sleep.', emoji: '🥛' },
        { name: 'Ghee Suspension', desc: 'Mix powder with clarified butter to enhance absorption into nerve tissues.', emoji: '🧈' },
        { name: 'Daily Tablets', desc: 'Take 1 tablet twice a day with warm water post meals for stress relief.', emoji: '💊' }
      ]
    });
  }

  // 2. Update unique usages for other plants
  await Plant.updateOne({ plantName: /Tulsi/i }, {
    usageMethods: [
      { name: 'Herbal Tea (Kadha)', desc: 'Boil 5-6 fresh Tulsi leaves in water with ginger and black pepper for immunity.', emoji: '☕' },
      { name: 'Direct Chewing', desc: 'Chew 3-4 leaves every morning on an empty stomach to purify blood.', emoji: '🌿' },
      { name: 'Steam Inhalation', desc: 'Add few drops of Tulsi extract in hot water and inhale steam for cold relief.', emoji: '♨️' }
    ]
  });

  await Plant.updateOne({ plantName: /Neem/i }, {
    usageMethods: [
      { name: 'Neem Water Bath', desc: 'Boil neem leaves in water and use it for bathing to treat skin conditions.', emoji: '🛁' },
      { name: 'Neem Paste', desc: 'Crush fresh leaves and apply on acne or insect bites for quick relief.', emoji: '🟢' },
      { name: 'Neem Twig (Datun)', desc: 'Chew a small neem twig every morning for excellent oral hygiene.', emoji: '🪥' }
    ]
  });

  await Plant.updateOne({ plantName: /Turmeric/i }, {
    usageMethods: [
      { name: 'Golden Milk', desc: 'Add 1/2 tsp turmeric powder with black pepper in warm milk for joint repair.', emoji: '🥛' },
      { name: 'Wound Healing', desc: 'Apply turmeric powder directly to minor cuts to stop bleeding and prevent infection.', emoji: '🩹' },
      { name: 'Face Mask', desc: 'Mix with sandalwood paste and rose water for glowing skin and acne removal.', emoji: '✨' }
    ]
  });

  console.log("✅ Unique plant usage data updated.");
  process.exit(0);
};

run().catch(console.error);
