import { Router } from 'express';
import { getPayments, processPayment } from '../controllers/paymentController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.get('/', authenticateJwt, getPayments);
router.post('/:id/process', authenticateJwt, processPayment);

export default router;
