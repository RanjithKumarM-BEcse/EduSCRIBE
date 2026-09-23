import { Router } from 'express';
import { createRoom, getMyRooms, joinRoom, getRoomData, addLecture, removeLecture } from '../controllers/rooms.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.use(authMiddleware);

router.post('/', createRoom);
router.get('/', getMyRooms);
router.post('/join', joinRoom);

router.get('/:roomCode', getRoomData);
router.post('/:roomCode/lectures', addLecture);
router.delete('/:roomCode/lectures/:lectureId', removeLecture);

export default router;
