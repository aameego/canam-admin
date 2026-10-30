import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { adminQueryKeys } from './queryKeys.ts';

describe('adminQueryKeys', () => {
  it('namespaces every admin resource under admin', () => {
    assert.deepEqual(adminQueryKeys.me, ['admin', 'me']);
    assert.deepEqual(adminQueryKeys.categories, ['admin', 'categories']);
    assert.deepEqual(adminQueryKeys.products({ page: 2, q: 'napkins' }), [
      'admin',
      'products',
      { page: 2, q: 'napkins' },
    ]);
    assert.deepEqual(adminQueryKeys.product('abc'), ['admin', 'products', 'abc']);
    assert.deepEqual(adminQueryKeys.customers({ status: 'pending', page: 1 }), [
      'admin',
      'customers',
      { status: 'pending', page: 1 },
    ]);
    assert.deepEqual(adminQueryKeys.customer('cust-1'), ['admin', 'customers', 'cust-1']);
    assert.deepEqual(adminQueryKeys.orders({ page: 1 }), ['admin', 'orders', { page: 1 }]);
    assert.deepEqual(adminQueryKeys.order('ord-1'), ['admin', 'orders', 'ord-1']);
    assert.deepEqual(adminQueryKeys.coupons({ page: 1 }), ['admin', 'coupons', { page: 1 }]);
    assert.deepEqual(adminQueryKeys.coupon('c1'), ['admin', 'coupons', 'c1']);
  });

  it('lets catalog mutations invalidate the whole products tree', () => {
    assert.equal(adminQueryKeys.products({ page: 1 })[0], adminQueryKeys.productsRoot[0]);
    assert.equal(adminQueryKeys.products({ page: 1 })[1], adminQueryKeys.productsRoot[1]);
    assert.equal(adminQueryKeys.customers({ page: 1 })[1], adminQueryKeys.customersRoot[1]);
  });
});
