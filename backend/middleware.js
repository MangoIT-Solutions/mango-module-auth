const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT and attach user to request.
 * Expects JWT_SECRET or uses 'secret' default.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { message: 'Authentication required' }
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid or expired token' }
    });
  }
};

/**
 * Middleware factory to check for specific permissions.
 * Stub implementation: currently allows all authenticated users.
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    // In a real implementation, you would check req.user.role/permissions
    next();
  };
};

module.exports = {
  authMiddleware,
  requirePermission
};
