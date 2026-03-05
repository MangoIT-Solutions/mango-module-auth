import type { Router } from 'express';
import type { AuthRoleModel, AuthUserModel, JwtConfig } from './context';
import { createAuthRouter } from './routes/auth.routes';
import { setAuthContext } from './context';

export interface RegisterOptions {
  app: Router;
  userModel: AuthUserModel;
  roleModel: AuthRoleModel;
  jwt: JwtConfig;
}

export function register({ app, userModel, roleModel, jwt }: RegisterOptions) {
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

  setAuthContext({ userModel, roleModel, jwt });
  app.use('/auth', createAuthRouter());
}

export * from './context';
