import 'dotenv/config';
import { connectDB } from '../config/db.js';
import { Plant } from '../models/Plant.js';
import { Product } from '../models/Product.js';

const run = async () => {
  await connectDB(process.env.MONGODB_URI);
  const plants = await Plant.find().limit(2);
  console.log("PLANTS:", JSON.stringify(plants, null, 2));

  const prods = await Product.find().limit(4);
  console.log("PRODUCTS:", JSON.stringify(prods, null, 2));
  
  process.exit(0);
};

run();
