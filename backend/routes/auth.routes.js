const authController = require('../controllers/auth.controller');
const { requireDependency } = require('../utils/require-dependency');

function createAuthRouter() {
  const { Router } = requireDependency('express');
  const router = Router();

  router.post('/login', authController.login);
  router.post('/refresh', authController.refreshToken);
  router.post('/logout', authController.logout);
  router.post('/forgot-password', authController.forgotPassword);
  router.post('/reset-password', authController.resetPassword);

  return router;
}

function registerAuthRoutes(app) {
  if (typeof app?.use === 'function') {
    app.use('/auth', createAuthRouter());
    return;
  }

  if (typeof app?.post === 'function') {
    app.post('/auth/login', authController.login);
    app.post('/auth/refresh', authController.refreshToken);
    app.post('/auth/logout', authController.logout);
    app.post('/auth/forgot-password', authController.forgotPassword);
    app.post('/auth/reset-password', authController.resetPassword);
    return;
  }

  throw new Error('Auth module requires an Express router instance');
}

module.exports = {
  createAuthRouter,
  registerAuthRoutes,
};
