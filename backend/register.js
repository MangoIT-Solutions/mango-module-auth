const { registerAuthRoutes } = require('./routes/auth.routes');
const { setAuthContext } = require('./context');

function register({ app, userModel, roleModel, jwt }) {
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
  registerAuthRoutes(app);
}

module.exports = {
  register,
};
