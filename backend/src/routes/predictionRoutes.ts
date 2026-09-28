import { Router } from 'express';
import { getPrediction } from '../controllers/predictionController';

const router = Router();

router.post('/waiting-time', getPrediction);

export default router;
