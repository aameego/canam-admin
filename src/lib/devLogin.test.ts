import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DEV_ADMIN_LOGIN, isDevLoginPrefillEnabled } from './devLogin.ts';

describe('DEV_ADMIN_LOGIN', () => {
  it('uses a stable local admin email', () => {
    assert.equal(DEV_ADMIN_LOGIN.email, 'admin@can-am.ca');
    assert.equal(DEV_ADMIN_LOGIN.password.length >= 8, true);
  });
});

describe('isDevLoginPrefillEnabled', () => {
  it('only prefills in development', () => {
    assert.equal(isDevLoginPrefillEnabled(true), true);
    assert.equal(isDevLoginPrefillEnabled(false), false);
  });
});
