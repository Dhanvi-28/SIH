import { Router } from 'express';
import { advanceQueue, toggleCounters, resetRameshToken } from '../controllers/demoController';

const router = Router();

router.post('/advance-queue', advanceQueue);
router.post('/toggle-counters', toggleCounters);
router.post('/reset-ramesh-token', resetRameshToken);

export default router;
