import crypto from 'crypto';
import jwt, { type SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { UnauthorizedError } from '../errors/app-error';
import { getAuthContext } from '../context';
import PasswordResetToken from '../models/password-reset-token.model';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  roleId: string;
  roleName: string;
}

export async function login(email: string, password: string, rememberMe = false): Promise<AuthTokens> {
  const { userModel, roleModel } = getAuthContext();

  const user = await userModel.findOne({ where: { email } });
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.get('passwordHash') as string);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (!(user.get('isActive') as boolean)) {
    throw new UnauthorizedError('Account is deactivated');
  }

  const role = await roleModel.findByPk(user.get('roleId') as string);

  return generateTokens(
    {
      userId: user.get('id') as string,
      email: user.get('email') as string,
      roleId: user.get('roleId') as string,
      roleName: (role?.get('name') as string) || 'Unknown',
    },
    rememberMe ? '30d' : undefined,
  );
}

export async function refreshToken(token: string): Promise<AuthTokens> {
  const { jwt: jwtConfig } = getAuthContext();

  try {
    const decoded = jwt.verify(token, jwtConfig.refreshSecret) as JwtPayload;
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

export async function forgotPassword(email: string, appUrl: string): Promise<void> {
  const { userModel, sendEmail } = getAuthContext();

  const user = await userModel.findOne({ where: { email } });

  // Always return silently — never reveal whether email exists
  if (!user || !(user.get('isActive') as boolean)) return;
  if (!sendEmail) return;

  // Invalidate any existing unused tokens for this user
  await PasswordResetToken.destroy({
    where: { userId: user.get('id') as string, usedAt: null },
  });

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await PasswordResetToken.create({
    userId: user.get('id') as string,
    tokenHash,
    expiresAt,
  });

  const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;

  await sendEmail({
    to: user.get('email') as string,
    subject: 'Reset your password',
    html: `
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.</p>
    `,
    text: `Reset your password: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, you can safely ignore this email.`,
  });
}

export async function resetPassword(rawToken: string, newPassword: string): Promise<void> {
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const record = await PasswordResetToken.findOne({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: { [Op.gt]: new Date() },
    },
  });

  if (!record) {
    throw new UnauthorizedError('This reset link is invalid or has expired. Please request a new one.');
  }

  const { userModel } = getAuthContext();
  const user = await userModel.findByPk(record.userId);
  if (!user) {
    throw new UnauthorizedError('This reset link is invalid or has expired. Please request a new one.');
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await user.update({ passwordHash });
  await record.update({ usedAt: new Date() });
}

function generateTokens(payload: JwtPayload, refreshExpiresIn?: string): AuthTokens {
  const { jwt: jwtConfig } = getAuthContext();

  const accessToken = jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn as SignOptions['expiresIn'],
  });

  const refreshToken = jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: (refreshExpiresIn || jwtConfig.refreshExpiresIn) as SignOptions['expiresIn'],
  });

  return { accessToken, refreshToken };
}
