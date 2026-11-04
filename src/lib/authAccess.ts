import type { User } from '../types/api.ts';
import { validateEmailField, validatePasswordField } from './fields.ts';

export const ADMIN_ACCESS_DENIED = 'This account does not have admin access.';

export const canAccessAdmin = (user: { role?: string } | null | undefined): boolean =>
  user?.role === 'admin';

/** True when the admin's role grants at least one of the given permissions. */
export const can = (user: { permissions?: string[] } | null | undefined, ...anyOf: string[]): boolean =>
  anyOf.some((key) => user?.permissions?.includes(key));

export const validateAdminLogin = (
  email: string,
  password: string,
): { ok: true; email: string; password: string } | { ok: false; error: string } => {
  const parsedEmail = validateEmailField(email);
  if (!parsedEmail.ok) return parsedEmail;
  if (!password) return { ok: false, error: 'Email and password are required.' };
  return { ok: true, email: parsedEmail.email, password };
};

export const validateForgotPasswordEmail = (
  email: string,
): { ok: true; email: string } | { ok: false; error: string } => validateEmailField(email);

export const RESET_LINK_INVALID = 'Reset link is invalid or has expired.';

export type ResetLinkState = 'checking' | 'ready' | 'invalid' | 'done';

/** Whether the reset form may be used. A 400 from the link check or the reset itself means the link is dead. */
export const resetLinkState = (input: {
  token: string;
  check: 'pending' | 'success' | 'error';
  checkErrorStatus?: number;
  submitError?: string;
  done: boolean;
}): ResetLinkState => {
  if (input.done) return 'done';
  if (!input.token.trim()) return 'invalid';
  if (input.submitError === RESET_LINK_INVALID) return 'invalid';
  if (input.check === 'pending') return 'checking';
  if (input.check === 'error' && input.checkErrorStatus === 400) return 'invalid';
  return 'ready';
};

export const validateResetPasswordForm = (
  token: string,
  password: string,
  confirm: string,
): { ok: true } | { ok: false; error: string } => {
  if (!token.trim()) return { ok: false, error: RESET_LINK_INVALID };
  const parsed = validatePasswordField(password, true);
  if (!parsed.ok) return parsed;
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
  adminRoleName?: string;
  permissions?: string[];
}): User => ({
  id: payload.id ?? payload._id ?? '',
  email: payload.email ?? '',
  contactName: payload.contactName ?? '',
  phone: payload.phone ?? '',
  businessName: payload.businessName ?? '',
  businessType: payload.businessType ?? '',
  role: payload.role === 'admin' ? 'admin' : 'customer',
  adminRoleName: payload.adminRoleName ?? '',
  permissions: payload.permissions ?? [],
});
