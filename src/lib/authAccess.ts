import type { User } from '../types/api.ts';

export const ADMIN_ACCESS_DENIED = 'This account does not have admin access.';

export const canAccessAdmin = (user: { role?: string } | null | undefined): boolean =>
  user?.role === 'admin';

export const validateAdminLogin = (
  email: string,
  password: string,
): { ok: true; email: string; password: string } | { ok: false; error: string } => {
  if (!email.trim() || !password) {
    return { ok: false, error: 'Email and password are required.' };
  }
  return { ok: true, email: email.trim(), password };
};

export const validateForgotPasswordEmail = (
  email: string,
): { ok: true; email: string } | { ok: false; error: string } => {
  if (!email.trim()) return { ok: false, error: 'Email is required.' };
  return { ok: true, email: email.trim() };
};

export const validateResetPasswordForm = (
  token: string,
  password: string,
  confirm: string,
): { ok: true } | { ok: false; error: string } => {
  if (!token) return { ok: false, error: 'Reset link is invalid or has expired.' };
  if (password.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' };
  if (password !== confirm) return { ok: false, error: 'Passwords do not match.' };
  return { ok: true };
};

export const mapCurrentUser = (payload: {
  _id?: string;
  id?: string;
  email?: string;
  contactName?: string;
  phone?: string;
  businessName?: string;
  businessType?: string;
  role?: string;
}): User => ({
  id: payload.id ?? payload._id ?? '',
  email: payload.email ?? '',
  contactName: payload.contactName ?? '',
  phone: payload.phone ?? '',
  businessName: payload.businessName ?? '',
  businessType: payload.businessType ?? '',
  role: payload.role === 'admin' ? 'admin' : 'customer',
});
