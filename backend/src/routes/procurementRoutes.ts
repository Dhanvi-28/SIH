import { Router } from 'express';
import {
  getProcurements,
  getProcurementById,
  submitInspection,
  recordWeighing,
  acceptProcurement,
  rejectProcurement,
} from '../controllers/procurementController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.get('/', authenticateJwt, getProcurements);
router.get('/:id', authenticateJwt, getProcurementById);
router.post('/:id/inspection', authenticateJwt, submitInspection);
router.post('/:id/weigh', authenticateJwt, recordWeighing);
router.post('/:id/accept', authenticateJwt, acceptProcurement);
router.post('/:id/reject', authenticateJwt, rejectProcurement);

export default router;
