import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  COUPON_STATUS_FILTERS,
  couponToForm,
  EMPTY_COUPON_FORM,
  formatCouponValue,
  validateCouponForm,
} from './coupons.ts';
import type { Coupon } from '../types/api.ts';

const sample: Coupon = {
  id: 'c1',
  code: 'SAVE10',
  type: 'percent',
  value: 10,
  minSubtotal: 50,
  maxDiscount: 15,
  startsAt: null,
  endsAt: null,
  usageLimit: 1,
  usedCount: 0,
  isActive: true,
};

describe('coupon helpers', () => {
  it('lists active/inactive filters and formats values', () => {
    assert.deepEqual(
      COUPON_STATUS_FILTERS.map((filter) => filter.id),
      ['all', 'active', 'inactive'],
    );
    assert.equal(formatCouponValue({ type: 'percent', value: 10 }), '10%');
    assert.equal(formatCouponValue({ type: 'fixed', value: 5 }), '$5.00');
  });

  it('uppercases a valid code and keeps optional blanks as null', () => {
    const parsed = validateCouponForm({
      ...EMPTY_COUPON_FORM,
      code: ' save10 ',
      value: '10',
      usageLimit: '1',
    });
    assert.equal(parsed.ok, true);
    if (parsed.ok) {
      assert.equal(parsed.body.code, 'SAVE10');
      assert.equal(parsed.body.usageLimit, 1);
      assert.equal(parsed.body.maxDiscount, null);
    }
  });

  it('rejects markup, over-100 percent, inverted dates, and a short code', () => {
    assert.equal(validateCouponForm({ ...EMPTY_COUPON_FORM, code: 'A', value: '10' }).ok, false);
    assert.equal(validateCouponForm({ ...EMPTY_COUPON_FORM, code: 'SAVE<1>', value: '10' }).ok, false);
    assert.equal(
      validateCouponForm({ ...EMPTY_COUPON_FORM, code: 'SAVE10', type: 'percent', value: '150' }).ok,
      false,
    );
    assert.equal(
      validateCouponForm({
        ...EMPTY_COUPON_FORM,
        code: 'SAVE10',
        value: '10',
        startsAt: '2026-12-01T10:00',
        endsAt: '2026-11-01T10:00',
      }).ok,
      false,
    );
    const mapped = couponToForm(sample);
    assert.equal(mapped.code, 'SAVE10');
    assert.equal(mapped.usageLimit, '1');
  });
});
