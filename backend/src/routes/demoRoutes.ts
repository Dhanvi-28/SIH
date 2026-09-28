import { Router } from 'express';
import { advanceQueue, toggleCounters, resetRameshToken } from '../controllers/demoController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.post('/advance-queue', authenticateJwt, advanceQueue);
router.post('/toggle-counters', authenticateJwt, toggleCounters);
router.post('/reset-ramesh-token', authenticateJwt, resetRameshToken);

export default router;
