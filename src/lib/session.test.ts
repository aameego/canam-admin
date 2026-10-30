import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  guestSessionGate,
  isAuthRequestUrl,
  protectedSessionGate,
  shouldAttemptTokenRefresh,
  shouldRedirectToLogin,
} from './session.ts';

describe('shouldRedirectToLogin', () => {
  it('sends expired admin sessions back to login instead of staying on a product page', () => {
    assert.equal(shouldRedirectToLogin('/products'), true);
    assert.equal(shouldRedirectToLogin('/products?page=1'), true);
    assert.equal(shouldRedirectToLogin('/login'), false);
    assert.equal(shouldRedirectToLogin('/login/'), false);
    assert.equal(shouldRedirectToLogin('/reset-password'), false);
    assert.equal(shouldRedirectToLogin('/reset-password?token=abc'), false);
  });
});

describe('token refresh gate', () => {
  it('retries once on 401 unless the request is already an auth call', () => {
    assert.equal(shouldAttemptTokenRefresh(401, '/products', false), true);
    assert.equal(shouldAttemptTokenRefresh(401, '/products', true), false);
    assert.equal(shouldAttemptTokenRefresh(403, '/products', false), false);
    assert.equal(isAuthRequestUrl('/auth/login-email'), true);
    assert.equal(isAuthRequestUrl('/auth/refresh-token'), true);
    assert.equal(isAuthRequestUrl('/auth/logout'), true);
    assert.equal(shouldAttemptTokenRefresh(401, '/auth/refresh-token', false), false);
    assert.equal(shouldAttemptTokenRefresh(401, '/auth/me', false), true);
  });
});

describe('session gates', () => {
  it('shows loading, then allows or redirects', () => {
    assert.equal(protectedSessionGate(true, false), 'loading');
    assert.equal(protectedSessionGate(false, false), 'redirect-login');
    assert.equal(protectedSessionGate(false, true), 'allow');
    assert.equal(guestSessionGate(true, false), 'loading');
    assert.equal(guestSessionGate(false, true), 'redirect-home');
    assert.equal(guestSessionGate(false, false), 'allow');
  });
});
