import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import authRoutes from './routes/authRoutes.js';
import plantRoutes from './routes/plantRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import voiceRoutes from './routes/voiceRoutes.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Serve uploaded static files
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/voice', voiceRoutes);

app.use((req, res) => res.status(404).json({ message: 'Not found' }));

export default app;
