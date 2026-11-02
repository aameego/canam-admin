import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ADMIN_ACCESS_DENIED,
  canAccessAdmin,
  mapCurrentUser,
  RESET_LINK_INVALID,
  resetLinkState,
  validateAdminLogin,
  validateForgotPasswordEmail,
  validateResetPasswordForm,
} from './authAccess.ts';

describe('canAccessAdmin', () => {
  it('allows admin and rejects everyone else', () => {
    assert.equal(canAccessAdmin({ role: 'admin' }), true);
    assert.equal(canAccessAdmin({ role: 'customer' }), false);
    assert.equal(canAccessAdmin({ role: 'Admin' }), false);
    assert.equal(canAccessAdmin({}), false);
    assert.equal(canAccessAdmin(null), false);
    assert.equal(canAccessAdmin(undefined), false);
  });
});

describe('mapCurrentUser', () => {
  it('maps backend _id and defaults missing role to customer', () => {
    const user = mapCurrentUser({ _id: 'abc', email: 'a@b.com', contactName: 'Pat' });
    assert.equal(user.id, 'abc');
    assert.equal(user.role, 'customer');
    const admin = mapCurrentUser({ id: 'z', role: 'admin', email: 'admin@can-am.ca' });
    assert.equal(admin.id, 'z');
    assert.equal(admin.role, 'admin');
    const empty = mapCurrentUser({});
    assert.equal(empty.id, '');
    assert.equal(empty.role, 'customer');
  });
});

describe('auth forms', () => {
  it('requires email and password to sign in', () => {
    assert.equal(validateAdminLogin('', 'x').ok, false);
    assert.equal(validateAdminLogin('not-an-email', 'secret').ok, false);
    assert.equal(validateAdminLogin('a@b.com', '').ok, false);
    const ok = validateAdminLogin('  A@B.com  ', 'secret');
    assert.equal(ok.ok, true);
    if (ok.ok) assert.equal(ok.email, 'a@b.com');
  });

  it('requires a valid email for forgot-password', () => {
    assert.equal(validateForgotPasswordEmail('   ').ok, false);
    assert.equal(validateForgotPasswordEmail('admin').ok, false);
    const ok = validateForgotPasswordEmail('  a@b.com ');
    assert.equal(ok.ok, true);
    if (ok.ok) assert.equal(ok.email, 'a@b.com');
  });

  it('rejects a missing token, short password, or mismatch on reset', () => {
    assert.equal(validateResetPasswordForm('   ', 'longenough', 'longenough').ok, false);
    assert.equal(validateResetPasswordForm('tok', 'short', 'short').ok, false);
    assert.equal(validateResetPasswordForm('tok', 'longenough', 'different1').ok, false);
    assert.equal(validateResetPasswordForm('tok', 'longenough', 'longenough').ok, true);
    assert.equal(validateResetPasswordForm('tok', 'a'.repeat(129), 'a'.repeat(129)).ok, false);
  });
});

describe('ADMIN_ACCESS_DENIED', () => {
  it('is a stable operator-facing message', () => {
    assert.equal(ADMIN_ACCESS_DENIED.includes('admin access'), true);
  });
});

describe('resetLinkState', () => {
  const base = { token: 'abc', check: 'success' as const, done: false };

  it('blocks the form without a token or when the server says the link is dead', () => {
    assert.equal(resetLinkState({ ...base, token: '  ' }), 'invalid');
    assert.equal(resetLinkState({ ...base, check: 'error', checkErrorStatus: 400 }), 'invalid');
    assert.equal(resetLinkState({ ...base, submitError: RESET_LINK_INVALID }), 'invalid');
  });

  it('waits for the check, then allows the form', () => {
    assert.equal(resetLinkState({ ...base, check: 'pending' }), 'checking');
    assert.equal(resetLinkState(base), 'ready');
    assert.equal(resetLinkState({ ...base, submitError: 'Passwords do not match.' }), 'ready');
  });

  it('lets the user try when the check itself failed for network reasons', () => {
    assert.equal(resetLinkState({ ...base, check: 'error' }), 'ready');
    assert.equal(resetLinkState({ ...base, check: 'error', checkErrorStatus: 500 }), 'ready');
  });

  it('closes the form once the password is updated', () => {
    assert.equal(resetLinkState({ ...base, done: true }), 'done');
  });
});
