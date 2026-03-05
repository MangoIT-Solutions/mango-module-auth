import jwt, { type SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UnauthorizedError } from '../errors/app-error';
import { getAuthContext } from '../context';

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

export async function login(email: string, password: string): Promise<AuthTokens> {
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

  return generateTokens({
    userId: user.get('id') as string,
    email: user.get('email') as string,
    roleId: user.get('roleId') as string,
    roleName: (role?.get('name') as string) || 'Unknown',
  });
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

function generateTokens(payload: JwtPayload): AuthTokens {
  const { jwt: jwtConfig } = getAuthContext();

  const accessToken = jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn as SignOptions['expiresIn'],
  });

  const refreshToken = jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn as SignOptions['expiresIn'],
  });

  return { accessToken, refreshToken };
}
