# @mangoit-solutions/module-auth

Reusable authentication module for Mango module-based apps. Includes:
- Express auth routes (`/auth/login`, `/auth/refresh`, `/auth/logout`)
- React AuthProvider + LoginPage + ProtectedRoute

## Peer Dependencies

The following packages must be installed in your host application:

**Backend:**
- `express` >= 4.0.0
- `sequelize` >= 6.0.0
- `jsonwebtoken` >= 9.0.0
- `bcryptjs` >= 2.4.0

**Frontend:**
- `react` >= 18.0.0
- `react-dom` >= 18.0.0
- `react-router-dom` >= 6.0.0

Install them in your host app:

```bash
npm install express sequelize jsonwebtoken bcryptjs react react-dom react-router-dom
```

## Backend usage

```js
const { register: registerAuth } = require('@mangoit-solutions/module-auth');

registerAuth({
  app: apiRouter,
  userModel: sequelize.models.User,
  roleModel: sequelize.models.Role,
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
});
```

### Local development (file: installs)

If you install this package via a `file:` link (symlink), Node resolves dependencies from the module folder. Run the following once so `jsonwebtoken`/`bcryptjs` are available:

```bash
cd mango-module-auth
npm install
```

> Note: `userModel` and `roleModel` should be initialized by the users/roles modules (or equivalent models).

## Frontend usage

```tsx
import { AuthProvider, LoginPage, ProtectedRoute } from '@mangoit-solutions/module-auth/frontend';

function App() {
  return (
    <AuthProvider>
      <LoginPage onSuccess={() => console.log('Logged in')} />
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>
    </AuthProvider>
  );
}
```

Auth tokens are stored in `localStorage` as `accessToken` and `refreshToken`.
