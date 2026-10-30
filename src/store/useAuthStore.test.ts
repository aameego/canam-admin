import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { useAuthStore } from './useAuthStore.ts';

const adminUser = {
  id: '1',
  email: 'admin@can-am.ca',
  contactName: 'Pat',
  phone: '',
  businessName: 'CAN-AM',
  businessType: '',
  role: 'admin' as const,
};

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: true });
  });

  it('starts loading with no session', () => {
    assert.equal(useAuthStore.getState().user, null);
    assert.equal(useAuthStore.getState().isAuthenticated, false);
    assert.equal(useAuthStore.getState().isLoading, true);
  });

  it('setUser marks the operator signed in', () => {
    useAuthStore.getState().setUser(adminUser);
    assert.equal(useAuthStore.getState().isAuthenticated, true);
    assert.equal(useAuthStore.getState().isLoading, false);
    assert.equal(useAuthStore.getState().user?.email, 'admin@can-am.ca');
  });

  it('clearAuth drops the session without leaving the gate loading', () => {
    useAuthStore.getState().setUser(adminUser);
    useAuthStore.getState().clearAuth();
    assert.equal(useAuthStore.getState().user, null);
    assert.equal(useAuthStore.getState().isAuthenticated, false);
    assert.equal(useAuthStore.getState().isLoading, false);
  });
});
