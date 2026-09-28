import { Router } from 'express';
import { getAdminAnalytics } from '../controllers/analyticsController';

const router = Router();

router.get('/admin', getAdminAnalytics);

export default router;
