import { Router } from 'express';
import {
  getQueueByToken,
  markArrival,
  callFarmer,
  startProcessing,
  completeQueue,
  markNoShow,
} from '../controllers/queueController';

const router = Router();

router.get('/:token', getQueueByToken);
router.post('/:token/arrive', markArrival);
router.post('/:token/call', callFarmer);
router.post('/:token/start', startProcessing);
router.post('/:token/complete', completeQueue);
router.post('/:token/no-show', markNoShow);

export default router;
