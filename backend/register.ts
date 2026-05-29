import type { Router } from 'express';
import type { AuthRoleModel, AuthUserModel, EmailOptions, JwtConfig } from './context';
import { createAuthRouter } from './routes/auth.routes';
import { setAuthContext } from './context';
import { initPasswordResetTokenModel } from './models/password-reset-token.model';

export interface RegisterOptions {
  app: Router;
  userModel: AuthUserModel;
  roleModel: AuthRoleModel;
  jwt: JwtConfig;
  sendEmail?: (opts: EmailOptions) => Promise<void>;
}

export function register({ app, userModel, roleModel, jwt, sendEmail }: RegisterOptions) {
  if (!app) {
    throw new Error('Auth module requires an Express router instance');
  }
  if (!userModel) {
    throw new Error('Auth module requires a User model');
  }
  if (!roleModel) {
    throw new Error('Auth module requires a Role model');
  }
  if (!jwt?.secret || !jwt?.refreshSecret) {
    throw new Error('Auth module requires jwt.secret and jwt.refreshSecret');
  }

  const sequelize = (userModel as any).sequelize;
  if (sequelize) initPasswordResetTokenModel(sequelize);

  setAuthContext({ userModel, roleModel, jwt, sendEmail });
  app.use('/auth', createAuthRouter());
}

export * from './context';
