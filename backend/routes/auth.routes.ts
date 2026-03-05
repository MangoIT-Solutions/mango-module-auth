import { Router } from 'express';
import * as authController from '../controllers/auth.controller';

export function createAuthRouter() {
  const router = Router();

  router.post('/login', authController.login);
  router.post('/refresh', authController.refreshToken);
  router.post('/logout', authController.logout);

  return router;
}
