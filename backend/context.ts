import type { Model, ModelStatic } from 'sequelize';

export interface JwtConfig {
  secret: string;
  refreshSecret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

export interface AuthUserAttributes {
  id: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
  roleId: string;
}

export interface AuthRoleAttributes {
  id: string;
  name: string;
}

export type AuthUserModel = ModelStatic<Model<AuthUserAttributes>>;
export type AuthRoleModel = ModelStatic<Model<AuthRoleAttributes>>;

export interface AuthContext {
  userModel: AuthUserModel;
  roleModel: AuthRoleModel;
  jwt: JwtConfig;
}

let authContext: AuthContext | null = null;

export function setAuthContext(context: AuthContext) {
  authContext = context;
}

export function getAuthContext(): AuthContext {
  if (!authContext) {
    throw new Error('Auth context has not been initialized');
  }

  return authContext;
}
