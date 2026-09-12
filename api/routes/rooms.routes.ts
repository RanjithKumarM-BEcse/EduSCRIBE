import { Router } from 'express';
import { createRoom, getMyRooms, joinRoom } from '../controllers/rooms.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.use(authMiddleware);

router.post('/', createRoom);
router.get('/', getMyRooms);
router.post('/join', joinRoom);

export default router;
