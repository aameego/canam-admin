import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  BUSINESS_TYPES,
  CUSTOMER_DETAIL_TABS,
  CUSTOMER_STATUS_FILTERS,
  customerStatusActions,
  customerToForm,
  EMPTY_CUSTOMER_FORM,
  isBusinessType,
  money,
  parseCustomerStatusAction,
  statusBadgeClass,
  statusLabel,
  validateCustomerForm,
} from './customers.ts';

describe('statusLabel', () => {
  it('uses operator-facing status names', () => {
    assert.equal(statusLabel('approved'), 'Approved');
    assert.equal(statusLabel('pending'), 'Pending');
    assert.equal(statusLabel('rejected'), 'Rejected');
    assert.equal(statusLabel('blocked'), 'Blocked');
  });
});

describe('statusBadgeClass', () => {
  it('gives pending a distinct warning treatment', () => {
    assert.equal(statusBadgeClass('pending').includes('f59e0b'), true);
    assert.equal(statusBadgeClass('approved').includes('10b981'), true);
    assert.equal(statusBadgeClass('rejected').includes('canam-red'), true);
    assert.equal(statusBadgeClass('blocked').includes('canam-red'), true);
  });
});

describe('money', () => {
  it('formats Canadian dollars including zero', () => {
    const formatted = money(12);
    assert.equal(formatted.includes('12'), true);
    assert.match(formatted, /\$|CAD/);
    assert.match(money(0), /0/);
    assert.match(money(Number.NaN), /0/);
    assert.match(money(Number.POSITIVE_INFINITY), /0/);
  });
});

describe('customer directory and form', () => {
  it('lists every account-status filter and detail tab', () => {
    assert.deepEqual(
      CUSTOMER_STATUS_FILTERS.map((filter) => filter.id),
      ['all', 'approved', 'pending', 'rejected', 'blocked'],
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
        phone: '4165550101',
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
        email: ' Pat@Cafe.com ',
        phone: ' 416-555-0101 ',
        businessType: 'Restaurant/Cafe',
        password: 'secret123',
      },
      false,
    );
    assert.equal(created.ok, true);
    if (created.ok) {
      assert.equal(created.body.businessName, 'Cafe');
      assert.equal(created.body.email, 'pat@cafe.com');
      assert.equal(created.body.password, 'secret123');
    }
  });

  it('lets edit keep the current password when the field is blank', () => {
    const mapped = customerToForm({
      businessName: 'Cafe',
      contactName: 'Pat',
      email: 'pat@cafe.com',
      phone: '4165550101',
      businessType: 'Restaurant/Cafe',
    });
    assert.equal(mapped.password, '');
    const saved = validateCustomerForm(mapped, true);
    assert.equal(saved.ok, true);
    if (saved.ok) assert.equal(saved.body.password, undefined);
  });

  it('rejects invalid email, short phone, markup, unknown type, and a short edit password', () => {
    const base = {
      businessName: 'Cafe',
      contactName: 'Pat',
      email: 'pat@cafe.com',
      phone: '4165550101',
      businessType: 'Restaurant/Cafe',
      password: 'secret123',
    };
    assert.equal(validateCustomerForm({ ...base, email: 'not-an-email' }, false).ok, false);
    assert.equal(validateCustomerForm({ ...base, phone: '555' }, false).ok, false);
    assert.equal(validateCustomerForm({ ...base, contactName: 'P' }, false).ok, false);
    assert.equal(validateCustomerForm({ ...base, businessName: 'Cafe <b>' }, false).ok, false);
    assert.equal(validateCustomerForm({ ...base, businessType: 'Hacker' }, false).ok, false);
    assert.equal(validateCustomerForm({ ...base, password: 'short' }, true).ok, false);
    assert.equal(validateCustomerForm({ ...base, password: 'a'.repeat(129) }, true).ok, false);
    assert.equal(validateCustomerForm({ ...base, businessType: '' }, false).ok, true);
    assert.equal(isBusinessType('Retail Store'), true);
    assert.equal(isBusinessType('Hacker'), false);
  });

  it('only allows approve, reject, or block as customer status actions', () => {
    assert.deepEqual(parseCustomerStatusAction('approved'), { ok: true, accountStatus: 'approved' });
    assert.deepEqual(parseCustomerStatusAction('rejected'), { ok: true, accountStatus: 'rejected' });
    assert.deepEqual(parseCustomerStatusAction('blocked'), { ok: true, accountStatus: 'blocked' });
    assert.equal(parseCustomerStatusAction('pending').ok, false);
    assert.equal(parseCustomerStatusAction('admin').ok, false);
  });

  it('offers the same status actions everywhere, and always confirms block and reject', () => {
    const summary = (status: Parameters<typeof customerStatusActions>[0]) =>
      customerStatusActions(status).map((action) => [action.next, action.label, Boolean(action.confirm)]);
    assert.deepEqual(summary('pending'), [
      ['approved', 'Approve', false],
      ['rejected', 'Reject application', true],
    ]);
    assert.deepEqual(summary('approved'), [['blocked', 'Block account', true]]);
    assert.deepEqual(summary('blocked'), [['approved', 'Unblock account', false]]);
    assert.deepEqual(summary('rejected'), [['approved', 'Approve', false]]);
    assert.match(customerStatusActions('approved')[0]?.confirm ?? '', /not be able to sign in/);
  });
});
