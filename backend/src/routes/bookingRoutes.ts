import { Router } from 'express';
import { createBooking, getBookings, getBookingById, cancelBooking } from '../controllers/bookingController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.post('/', authenticateJwt, createBooking);
router.get('/', authenticateJwt, getBookings);
router.get('/:id', authenticateJwt, getBookingById);
router.post('/:id/cancel', authenticateJwt, cancelBooking);

export default router;
