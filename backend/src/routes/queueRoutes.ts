import { Router } from 'express';
import {
  getQueueByToken,
  markArrival,
  callFarmer,
  startProcessing,
  completeQueue,
  markNoShow,
} from '../controllers/queueController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

// Public: a farmer scans a printed token at the gate, so lookup stays open.
router.get('/:token', getQueueByToken);

// All state-changing queue operations require an authenticated official/admin.
router.post('/:token/arrive', authenticateJwt, markArrival);
router.post('/:token/call', authenticateJwt, callFarmer);
router.post('/:token/start', authenticateJwt, startProcessing);
router.post('/:token/complete', authenticateJwt, completeQueue);
router.post('/:token/no-show', authenticateJwt, markNoShow);

export default router;
