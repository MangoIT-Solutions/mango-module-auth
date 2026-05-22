const authController = require('../controllers/auth.controller');
const { requireDependency } = require('../utils/require-dependency');

function createAuthRouter() {
  const { Router } = requireDependency('express');
  const router = Router();

  router.post('/login', authController.login);
  router.post('/refresh', authController.refreshToken);
  router.post('/logout', authController.logout);

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
    return;
  }

  throw new Error('Auth module requires an Express router instance');
}

module.exports = {
  createAuthRouter,
  registerAuthRoutes,
};
