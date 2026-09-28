import { Router } from 'express';
import { getSlotRecommendations } from '../controllers/slotController';

const router = Router();

router.get('/recommendations', getSlotRecommendations);

export default router;
