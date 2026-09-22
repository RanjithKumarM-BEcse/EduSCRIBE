import { Router } from 'express';
import { googleLogin, testLogin } from '../controllers/auth.controller.js';

const router = Router();

router.post('/google', googleLogin);
router.post('/test-login', testLogin);

export default router;
