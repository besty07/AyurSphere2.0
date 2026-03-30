import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import plantRoutes from './routes/plantRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/favorites', favoriteRoutes);

app.use((req, res) => res.status(404).json({ message: 'Not found' }));

export default app;
