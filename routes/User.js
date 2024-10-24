import express from 'express';
import { getUser, registerUser, loginUser } from '../controllers/UserController.js';
import { Auth, refreshTokenHandler } from '../controllers/AuthController.js';

const router = express.Router();

router.post('/api/user/register', registerUser);
router.post('/api/user/login', loginUser);
router.get('/api/user', Auth, getUser);
router.post('/api/user/refresh', refreshTokenHandler);

export default router;
