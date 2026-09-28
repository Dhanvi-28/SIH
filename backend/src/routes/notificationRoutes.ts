import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.get('/', authenticateJwt, getNotifications);
router.post('/:id/read', authenticateJwt, markAsRead);
router.post('/read-all', authenticateJwt, markAllAsRead);

export default router;
