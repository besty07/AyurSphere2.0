import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const promote = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for promotion...');

    const result = await User.updateOne(
      { username: 'sanke' },
      { $set: { role: 'admin' } }
    );

    if (result.matchedCount === 0) {
      console.log('User "sanke" not found. Operation skipped.');
    } else {
      console.log('Success! User "sanke" has been promoted to Admin privileges.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Promotion failed:', err);
    process.exit(1);
  }
};

promote();
