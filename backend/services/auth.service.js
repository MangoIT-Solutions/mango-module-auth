const { requireDependency } = require('../utils/require-dependency');
const jwt = requireDependency('jsonwebtoken');
const bcrypt = requireDependency('bcryptjs');
const { UnauthorizedError } = require('../errors/app-error');
const { getAuthContext } = require('../context');

async function login(email, password) {
  const { userModel, roleModel } = getAuthContext();
  const user = await userModel.findOne({ where: { email } });
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.get('passwordHash'));
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (!user.get('isActive')) {
    throw new UnauthorizedError('Account is deactivated');
  }

  const role = await roleModel.findByPk(user.get('roleId'));

  return generateTokens({
    userId: user.get('id'),
    email: user.get('email'),
    roleId: user.get('roleId'),
    roleName: (role?.get('name')) || 'Unknown',
  });
}

async function refreshToken(token) {
  const { jwt: jwtConfig } = getAuthContext();
  try {
    const decoded = jwt.verify(token, jwtConfig.refreshSecret);
    return generateTokens({
      userId: decoded.userId,
      email: decoded.email,
      roleId: decoded.roleId,
      roleName: decoded.roleName,
    });
  } catch {
    throw new UnauthorizedError('Invalid refresh token');
  }
}

function generateTokens(payload) {
  const { jwt: jwtConfig } = getAuthContext();

  const accessToken = jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });

  const refreshToken = jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn,
  });

  return { accessToken, refreshToken };
}

module.exports = {
  login,
  refreshToken,
};
