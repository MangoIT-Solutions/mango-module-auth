let authContext = null;

function setAuthContext(context) {
  authContext = context;
}

function getAuthContext() {
  if (!authContext) {
    throw new Error('Auth context has not been initialized');
  }

  return authContext;
}

module.exports = {
  setAuthContext,
  getAuthContext,
};
