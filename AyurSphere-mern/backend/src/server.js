import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 4000;

const start = async () => {
  console.log('MONGODB_URI BEFORE CONNECT:', process.env.MONGODB_URI);
  await connectDB(process.env.MONGODB_URI);
  app.listen(PORT, () => console.log(`🚀 API ready on port ${PORT}`));
};

start();
