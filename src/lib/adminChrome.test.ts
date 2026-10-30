import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ADMIN_CONTENT_CLASS,
  ADMIN_MAIN_CLASS,
  ADMIN_SHELL_CLASS,
  ADMIN_SIDEBAR_CLASS,
  ADMIN_SIDEBAR_MIN_WIDTH,
  ADMIN_TABLE_MIN_WIDTH,
  adminCardActionClass,
  adminFilterChipClass,
  adminIconBtnClass,
  adminPageTitle,
  adminPaginationBtnClass,
  adminShellLocksSidebar,
  adminUsesPersistentSidebar,
  adminUsesTableLayout,
  COMING_NEXT_COPY,
  customerStatusHref,
  dashboardCustomerStats,
} from './adminChrome.ts';
import { ADMIN_CONTENT_ID } from './pagination.ts';

describe('adminPageTitle', () => {
  it('names list, pending queue, detail, and form screens', () => {
    assert.equal(adminPageTitle('/customers'), 'Customers');
    assert.equal(adminPageTitle('/customers', '?status=pending'), 'Pending Approvals');
    assert.equal(adminPageTitle('/customers/abc'), 'Customer Details');
    assert.equal(adminPageTitle('/customers/new'), 'Add customer');
    assert.equal(adminPageTitle('/customers/abc/edit'), 'Edit customer');
    assert.equal(adminPageTitle('/products'), 'Products');
    assert.equal(adminPageTitle('/products/new'), 'Add product');
    assert.equal(adminPageTitle('/products/abc'), 'Product details');
    assert.equal(adminPageTitle('/products/abc/edit'), 'Edit product');
    assert.equal(adminPageTitle('/categories'), 'Categories');
    assert.equal(adminPageTitle('/orders'), 'Orders');
    assert.equal(adminPageTitle('/coupons'), 'Coupons');
  });

  it('falls back to Dashboard', () => {
    assert.equal(adminPageTitle('/'), 'Dashboard');
    assert.equal(COMING_NEXT_COPY, 'This screen is not built yet.');
  });
});

describe('admin layout breakpoints', () => {
  it('keeps the drawer below lg and a persistent sidebar from 1024px', () => {
    assert.equal(adminUsesPersistentSidebar(ADMIN_SIDEBAR_MIN_WIDTH - 1), false);
    assert.equal(adminUsesPersistentSidebar(ADMIN_SIDEBAR_MIN_WIDTH), true);
  });

  it('uses cards until xl so the registry table is not clipped beside the sidebar', () => {
    assert.equal(adminUsesTableLayout(1024), false);
    assert.equal(adminUsesTableLayout(ADMIN_TABLE_MIN_WIDTH - 1), false);
    assert.equal(adminUsesTableLayout(ADMIN_TABLE_MIN_WIDTH), true);
  });

  it('locks the shell to the viewport so the sidebar does not scroll with the page', () => {
    assert.equal(adminShellLocksSidebar(ADMIN_SHELL_CLASS), true);
    assert.ok(ADMIN_SIDEBAR_CLASS.includes('h-full'));
    assert.ok(ADMIN_MAIN_CLASS.includes('overflow-hidden'));
    assert.ok(ADMIN_CONTENT_CLASS.includes('overflow-auto'));
    assert.equal(ADMIN_CONTENT_ID, 'admin-content');
    assert.equal(adminShellLocksSidebar('flex min-h-dvh'), false);
  });
});

describe('admin action buttons', () => {
  it('uses a pointer cursor and navy hover on default icon actions', () => {
    const className = adminIconBtnClass();
    assert.match(className, /cursor-pointer/);
    assert.match(className, /hover:bg-navy/);
    assert.match(className, /hover:text-white/);
    assert.match(className, /hover:border-navy/);
    assert.match(className, /disabled:cursor-not-allowed/);
  });

  it('uses a pointer cursor and red hover on destructive icon actions', () => {
    const className = adminIconBtnClass('danger');
    assert.match(className, /cursor-pointer/);
    assert.match(className, /text-canam-red/);
    assert.match(className, /hover:bg-canam-red/);
    assert.match(className, /hover:text-white/);
  });

  it('uses a pointer cursor and hover on labeled card actions', () => {
    assert.match(adminCardActionClass(), /cursor-pointer/);
    assert.match(adminCardActionClass(), /hover:bg-navy/);
    assert.match(adminCardActionClass('danger'), /cursor-pointer/);
    assert.match(adminCardActionClass('danger'), /hover:bg-canam-red/);
    assert.match(adminCardActionClass('primary'), /cursor-pointer/);
    assert.match(adminCardActionClass('primary'), /hover:bg-navy\/90/);
  });

  it('uses a pointer cursor and hover on inactive filter chips and page buttons', () => {
    assert.match(adminFilterChipClass(false), /cursor-pointer/);
    assert.match(adminFilterChipClass(false), /hover:border-navy/);
    assert.match(adminFilterChipClass(true), /cursor-pointer/);
    assert.match(adminPaginationBtnClass(false), /cursor-pointer/);
    assert.match(adminPaginationBtnClass(false), /hover:bg-canvas/);
    assert.match(adminPaginationBtnClass(true), /cursor-pointer/);
    assert.match(adminPaginationBtnClass(false, true), /hover:bg-navy\/90/);
  });
});

describe('dashboardCustomerStats', () => {
  it('links each count to the matching customer filter', () => {
    const stats = dashboardCustomerStats({ all: 8, approved: 7, pending: 1, rejected: 0 });
    assert.deepEqual(
      stats.map((item) => [item.label, item.value, item.href]),
      [
        ['Total customers', 8, customerStatusHref('all')],
        ['Pending approvals', 1, customerStatusHref('pending')],
        ['Approved', 7, customerStatusHref('approved')],
        ['Blocked', 0, customerStatusHref('rejected')],
      ],
    );
    assert.equal(customerStatusHref('all'), '/customers');
    assert.equal(customerStatusHref('pending'), '/customers?status=pending');
  });
});
