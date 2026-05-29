const authService = require('../services/auth.service');

async function login(req, res, next) {
  try {
    const { email, password, rememberMe } = req.body;
    const result = await authService.login(email, password, !!rememberMe);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function refreshToken(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function logout(_req, res, next) {
  try {
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required' });
      return;
    }
    const appUrl = `${req.protocol}://${req.get('host')}`;
    await authService.forgotPassword(email, appUrl);
    res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      res.status(400).json({ success: false, message: 'Token and password are required' });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
      return;
    }
    await authService.resetPassword(token, password);
    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
};
