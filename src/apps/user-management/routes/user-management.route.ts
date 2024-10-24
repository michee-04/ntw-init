import { Router } from 'express';
import { UserManagementController } from '../controllers';

const router = Router();

router.post('/register', UserManagementController.registerUser);

router.get('/verify', UserManagementController.verifyAccount);

export default router;
