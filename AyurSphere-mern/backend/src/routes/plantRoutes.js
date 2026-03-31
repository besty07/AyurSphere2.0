import { Router } from 'express';
import { createPlant, listPlants, getPlantById, updatePlant, deletePlant } from '../controllers/plantController.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';

const router = Router();

router.get('/', authMiddleware, listPlants);
router.get('/:id', getPlantById);
router.post('/', authMiddleware, createPlant);
router.put('/:id', authMiddleware, adminMiddleware, updatePlant);
router.delete('/:id', authMiddleware, adminMiddleware, deletePlant);

export default router;
