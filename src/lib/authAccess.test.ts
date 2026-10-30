import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ADMIN_ACCESS_DENIED,
  canAccessAdmin,
  mapCurrentUser,
  validateAdminLogin,
  validateForgotPasswordEmail,
  validateResetPasswordForm,
} from './authAccess.ts';

describe('canAccessAdmin', () => {
  it('allows admin and rejects everyone else', () => {
    assert.equal(canAccessAdmin({ role: 'admin' }), true);
    assert.equal(canAccessAdmin({ role: 'customer' }), false);
    assert.equal(canAccessAdmin(null), false);
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
  });
});

describe('auth forms', () => {
  it('requires email and password to sign in', () => {
    assert.equal(validateAdminLogin('', 'x').ok, false);
    assert.equal(validateAdminLogin('a@b.com', '').ok, false);
    const ok = validateAdminLogin('  a@b.com  ', 'secret');
    assert.equal(ok.ok, true);
    if (ok.ok) assert.equal(ok.email, 'a@b.com');
  });

  it('requires an email for forgot-password', () => {
    assert.equal(validateForgotPasswordEmail('   ').ok, false);
    const ok = validateForgotPasswordEmail('  a@b.com ');
    assert.equal(ok.ok, true);
    if (ok.ok) assert.equal(ok.email, 'a@b.com');
  });

  it('rejects a missing token, short password, or mismatch on reset', () => {
    assert.equal(validateResetPasswordForm('', 'longenough', 'longenough').ok, false);
    assert.equal(validateResetPasswordForm('tok', 'short', 'short').ok, false);
    assert.equal(validateResetPasswordForm('tok', 'longenough', 'different1').ok, false);
    assert.equal(validateResetPasswordForm('tok', 'longenough', 'longenough').ok, true);
  });
});

describe('ADMIN_ACCESS_DENIED', () => {
  it('is a stable operator-facing message', () => {
    assert.equal(ADMIN_ACCESS_DENIED.includes('admin access'), true);
  });
});
