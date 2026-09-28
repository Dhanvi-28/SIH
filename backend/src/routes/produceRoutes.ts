import { Router } from 'express';
import { getProduces } from '../controllers/produceController';

const router = Router();

router.get('/', getProduces);

export default router;
