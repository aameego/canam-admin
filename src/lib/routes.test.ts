import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CATALOG_PATHS, GUEST_PATHS, routes } from '../routes.ts';
import { ADMIN_NAV_ITEMS, adminPageTitle } from './adminChrome.ts';

describe('admin routes', () => {
  it('builds guest, catalog, customer, and coming-next paths', () => {
    assert.deepEqual([...GUEST_PATHS], ['/login', '/reset-password']);
    assert.deepEqual([...CATALOG_PATHS], ['/products', '/products/new', '/categories']);
    assert.equal(routes.customer('abc'), '/customers/abc');
    assert.equal(routes.customerEdit('abc'), '/customers/abc/edit');
    assert.equal(routes.product('sku-1'), '/products/sku-1');
    assert.equal(routes.productEdit('sku-1'), '/products/sku-1/edit');
    assert.equal(routes.order('o1'), '/orders/o1');
    assert.equal(routes.coupon('c1'), '/coupons/c1');
    assert.equal(routes.couponNew, '/coupons/new');
    assert.equal(routes.couponEdit('c1'), '/coupons/c1/edit');
  });

  it('only lists sidebar destinations that are built', () => {
    assert.deepEqual(
      ADMIN_NAV_ITEMS.map((item) => item.label),
      ['Dashboard', 'Customers', 'Products', 'Orders', 'Coupons'],
    );
    assert.equal(ADMIN_NAV_ITEMS[0]?.end, true);
    assert.equal(adminPageTitle('/orders'), 'Orders');
    assert.equal(adminPageTitle('/coupons'), 'Coupons');
  });

  it('titles unknown addresses as page not found instead of the dashboard', () => {
    assert.equal(adminPageTitle('/'), 'Dashboard');
    assert.equal(adminPageTitle('/xyz-not-exist'), 'Page not found');
    assert.equal(adminPageTitle('/content'), 'Page not found');
    assert.equal(adminPageTitle('/reports'), 'Page not found');
  });
});
