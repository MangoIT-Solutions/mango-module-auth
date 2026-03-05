const authController = require('../controllers/auth.controller');

function registerAuthRoutes(app) {
  if (!app?.post) {
    throw new Error('Auth module requires an Express router instance');
  }

  app.post('/auth/login', authController.login);
  app.post('/auth/refresh', authController.refreshToken);
  app.post('/auth/logout', authController.logout);
}

module.exports = {
  registerAuthRoutes,
};
