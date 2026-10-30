import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  BUSINESS_TYPES,
  CUSTOMER_DETAIL_TABS,
  CUSTOMER_STATUS_FILTERS,
  customerToForm,
  EMPTY_CUSTOMER_FORM,
  money,
  statusBadgeClass,
  statusLabel,
  validateCustomerForm,
} from './customers.ts';

describe('statusLabel', () => {
  it('uses operator-facing status names', () => {
    assert.equal(statusLabel('approved'), 'Approved');
    assert.equal(statusLabel('pending'), 'Pending');
    assert.equal(statusLabel('rejected'), 'Rejected');
  });
});

describe('statusBadgeClass', () => {
  it('gives pending a distinct warning treatment', () => {
    assert.equal(statusBadgeClass('pending').includes('f59e0b'), true);
    assert.equal(statusBadgeClass('approved').includes('10b981'), true);
    assert.equal(statusBadgeClass('rejected').includes('canam-red'), true);
  });
});

describe('money', () => {
  it('formats Canadian dollars', () => {
    const formatted = money(12);
    assert.equal(formatted.includes('12'), true);
    assert.match(formatted, /\$|CAD/);
  });
});

describe('customer directory and form', () => {
  it('lists every account-status filter and detail tab', () => {
    assert.deepEqual(
      CUSTOMER_STATUS_FILTERS.map((filter) => filter.id),
      ['all', 'approved', 'pending', 'rejected'],
    );
    assert.deepEqual(
      CUSTOMER_DETAIL_TABS.map((tab) => tab.id),
      ['profile', 'orders', 'addresses', 'activity'],
    );
    assert.ok(BUSINESS_TYPES.includes('Restaurant/Cafe'));
  });

  it('requires contact fields and an 8-character password on create', () => {
    const missing = validateCustomerForm(EMPTY_CUSTOMER_FORM, false);
    assert.equal(missing.ok, false);
    const shortPassword = validateCustomerForm(
      {
        businessName: 'Cafe',
        contactName: 'Pat',
        email: 'pat@cafe.com',
        phone: '555',
        businessType: '',
        password: 'short',
      },
      false,
    );
    assert.equal(shortPassword.ok, false);
    const created = validateCustomerForm(
      {
        businessName: ' Cafe ',
        contactName: ' Pat ',
        email: ' pat@cafe.com ',
        phone: ' 555 ',
        businessType: 'Restaurant/Cafe',
        password: 'secret123',
      },
      false,
    );
    assert.equal(created.ok, true);
    if (created.ok) {
      assert.equal(created.body.businessName, 'Cafe');
      assert.equal(created.body.password, 'secret123');
    }
  });

  it('lets edit keep the current password when the field is blank', () => {
    const mapped = customerToForm({
      businessName: 'Cafe',
      contactName: 'Pat',
      email: 'pat@cafe.com',
      phone: '555',
      businessType: 'Restaurant/Cafe',
    });
    assert.equal(mapped.password, '');
    const saved = validateCustomerForm(mapped, true);
    assert.equal(saved.ok, true);
    if (saved.ok) assert.equal(saved.body.password, undefined);
  });
});
