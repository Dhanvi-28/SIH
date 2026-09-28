import { Router } from 'express';
import authRoutes from './authRoutes';
import centerRoutes from './centerRoutes';
import produceRoutes from './produceRoutes';
import slotRoutes from './slotRoutes';
import bookingRoutes from './bookingRoutes';
import queueRoutes from './queueRoutes';
import predictionRoutes from './predictionRoutes';
import procurementRoutes from './procurementRoutes';
import paymentRoutes from './paymentRoutes';
import notificationRoutes from './notificationRoutes';
import analyticsRoutes from './analyticsRoutes';
import demoRoutes from './demoRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/centers', centerRoutes);
router.use('/produce', produceRoutes);
router.use('/slots', slotRoutes);
router.use('/bookings', bookingRoutes);
router.use('/queue', queueRoutes);
router.use('/predictions', predictionRoutes);
router.use('/procurements', procurementRoutes);
router.use('/payments', paymentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/demo', demoRoutes);

export default router;
