const { requireDependency } = require('../utils/require-dependency');
const jwt = requireDependency('jsonwebtoken');
const bcrypt = requireDependency('bcryptjs');
const crypto = require('crypto');
const { UnauthorizedError } = require('../errors/app-error');
const { getAuthContext } = require('../context');
const { getPasswordResetTokenModel } = require('../models/password-reset-token.model');

async function login(email, password, rememberMe = false) {
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

  return generateTokens(
    {
      userId: user.get('id'),
      email: user.get('email'),
      roleId: user.get('roleId'),
      roleName: (role?.get('name')) || 'Unknown',
    },
    rememberMe ? '30d' : undefined,
  );
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

async function forgotPassword(email, appUrl) {
  const { userModel, sendEmail } = getAuthContext();

  const user = await userModel.findOne({ where: { email } });
  if (!user) {
    return; // no enumeration — silently return
  }

  const PasswordResetToken = getPasswordResetTokenModel();

  // Invalidate any existing unused tokens for this user
  await PasswordResetToken.update(
    { usedAt: new Date() },
    { where: { userId: user.get('id'), usedAt: null } },
  );

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await PasswordResetToken.create({
    userId: user.get('id'),
    tokenHash,
    expiresAt,
  });

  const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;

  if (sendEmail) {
    await sendEmail({
      to: email,
      subject: 'Reset your password',
      html: `
        <p>Hello,</p>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link expires in 1 hour.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
      `,
      text: `Reset your password: ${resetUrl}\n\nThis link expires in 1 hour.`,
    });
  }
}

async function resetPassword(rawToken, newPassword) {
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const { userModel } = getAuthContext();
  const PasswordResetToken = getPasswordResetTokenModel();

  const record = await PasswordResetToken.findOne({
    where: {
      tokenHash,
      usedAt: null,
    },
  });

  if (!record || record.get('expiresAt') < new Date()) {
    throw new UnauthorizedError('Invalid or expired reset token');
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await userModel.update(
    { passwordHash },
    { where: { id: record.get('userId') } },
  );

  await record.update({ usedAt: new Date() });
}

function generateTokens(payload, refreshExpiresIn) {
  const { jwt: jwtConfig } = getAuthContext();

  const accessToken = jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });

  const refreshToken = jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: refreshExpiresIn || jwtConfig.refreshExpiresIn,
  });

  return { accessToken, refreshToken };
}

module.exports = {
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
};
