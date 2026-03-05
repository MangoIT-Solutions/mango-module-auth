import type { Router } from 'express';
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

export interface RegisterOptions {
  app: Router;
  userModel: AuthUserModel;
  roleModel: AuthRoleModel;
  jwt: JwtConfig;
}

export declare function register(options: RegisterOptions): void;
