import { Router } from 'express';
import { createPlant, listPlants, getPlantById } from '../controllers/plantController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', listPlants);
router.get('/:id', getPlantById);
router.post('/', authMiddleware, createPlant);

export default router;
