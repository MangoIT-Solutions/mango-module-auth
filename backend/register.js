const { createAuthRouter } = require('./routes/auth.routes');
const { setAuthContext } = require('./context');
const { initPasswordResetTokenModel } = require('./models/password-reset-token.model');

function register({ app, userModel, roleModel, jwt, models, sendEmail }) {
  if (!app?.use) {
    throw new Error('Auth module requires an Express router instance');
  }

  // Auto-discover models if "models" object is provided
  const finalUserModel = userModel || models?.User;
  const finalRoleModel = roleModel || models?.Role;

  if (!finalUserModel || !finalRoleModel) {
    console.warn('[auth] Warning: User or Role model not provided. Auth routes might fail.');
  }

  // Use sensible defaults from env for JWT
  const finalJwt = {
    secret: jwt?.secret || process.env.JWT_SECRET || 'secret',
    refreshSecret: jwt?.refreshSecret || process.env.JWT_REFRESH_SECRET || 'refresh-secret',
    expiresIn: jwt?.expiresIn || '1h',
    refreshExpiresIn: jwt?.refreshExpiresIn || '7d',
  };

  // Initialize PasswordResetToken model using the same sequelize instance as the user model
  const sequelize = finalUserModel?.sequelize;
  if (sequelize) {
    try {
      initPasswordResetTokenModel(sequelize);
    } catch (err) {
      console.warn('[auth] Could not initialize PasswordResetToken model:', err.message);
    }
  }

  setAuthContext({
    userModel: finalUserModel,
    roleModel: finalRoleModel,
    jwt: finalJwt,
    sendEmail: sendEmail || null,
  });

  app.use('/auth', createAuthRouter());
}

module.exports = {
  register,
};
