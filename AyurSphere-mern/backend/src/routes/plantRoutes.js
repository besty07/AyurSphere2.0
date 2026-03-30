import { Router } from 'express';
import { createPlant, listPlants } from '../controllers/plantController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', listPlants);

router.post('/', authMiddleware, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin role required' });
  }
  return next();
}, createPlant);

export default router;
