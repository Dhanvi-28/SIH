import { Router } from 'express';
import { getCenters, getCenterById } from '../controllers/centerController';

const router = Router();

router.get('/', getCenters);
router.get('/:id', getCenterById);

export default router;
