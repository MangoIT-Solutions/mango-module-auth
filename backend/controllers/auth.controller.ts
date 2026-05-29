import type { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, rememberMe } = req.body;
    const result = await authService.login(email, password, rememberMe === true);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      res.status(400).json({ success: false, error: { message: 'Email is required' } });
      return;
    }
    const appUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
    await authService.forgotPassword(email.trim().toLowerCase(), appUrl);
    // Always respond with success to avoid email enumeration
    res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token, newPassword } = req.body;
    if (!token || typeof token !== 'string') {
      res.status(400).json({ success: false, error: { message: 'Token is required' } });
      return;
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      res.status(400).json({ success: false, error: { message: 'Password must be at least 8 characters' } });
      return;
    }
    await authService.resetPassword(token, newPassword);
    res.json({ success: true, message: 'Password has been reset successfully.' });
  } catch (error) {
    next(error);
  }
}
