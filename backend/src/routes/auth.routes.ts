import { Router } from 'express';
import { syncUser, checkAuth } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/sync', authenticate, syncUser);
router.get('/me', authenticate, checkAuth);

export default router;
