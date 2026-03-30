import { Router } from 'express';
import { addFavorite, listFavorites, removeFavorite } from '../controllers/favoriteController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);
router.get('/', listFavorites);
router.post('/', addFavorite);
router.delete('/:plantId', removeFavorite);

export default router;
