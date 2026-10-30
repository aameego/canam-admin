import { routes } from '../routes.ts';
import type { AccountStatus } from '../types/api.ts';

/** Persistent sidebar from Tailwind `lg`. Figma admin frames are 1440×1024 only. */
export const ADMIN_SIDEBAR_MIN_WIDTH = 1024;

/**
 * Directory table from Tailwind `xl`. Below this, cards are used so the 6-column
 * registry is not clipped beside the 240px sidebar.
 */
export const ADMIN_TABLE_MIN_WIDTH = 1280;

export type AdminCustomerCounts = {
  all: number;
  approved: number;
  pending: number;
  rejected: number;
};

export const adminPageTitle = (pathname: string, search = ''): string => {
  if (pathname.startsWith('/customers')) {
    if (pathname.includes('/new')) return 'Add customer';
    if (pathname.endsWith('/edit')) return 'Edit customer';
    if (pathname !== '/customers') return 'Customer Details';
    if (new URLSearchParams(search).get('status') === 'pending') return 'Pending Approvals';
    return 'Customers';
  }
  if (pathname.startsWith('/products')) {
    if (pathname.includes('/new')) return 'Add product';
    if (pathname.endsWith('/edit')) return 'Edit product';
    if (pathname !== '/products') return 'Product details';
    return 'Products';
  }
  if (pathname.startsWith('/categories')) return 'Categories';
  if (pathname.startsWith('/orders')) return 'Orders';
  if (pathname.startsWith('/coupons')) return 'Coupons';
  if (pathname.startsWith('/content')) return 'Content';
  if (pathname.startsWith('/reports')) return 'Reports';
  return 'Dashboard';
};

export const adminUsesPersistentSidebar = (viewportWidth: number) => viewportWidth >= ADMIN_SIDEBAR_MIN_WIDTH;

export const adminUsesTableLayout = (viewportWidth: number) => viewportWidth >= ADMIN_TABLE_MIN_WIDTH;

/** Outer shell is viewport-tall so the navy sidebar stays put while content scrolls. */
export const ADMIN_SHELL_CLASS = 'flex h-dvh overflow-hidden bg-canvas text-ink';
export const ADMIN_SIDEBAR_CLASS =
  'hidden h-full min-h-0 w-[240px] shrink-0 flex-col bg-navy px-3 py-5 text-white lg:flex lg:rounded-r-lg';
export const ADMIN_DRAWER_CLASS =
  'fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(240px,85vw)] flex-col bg-navy px-3 py-5 text-white lg:hidden';
export const ADMIN_MAIN_CLASS = 'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden';
export const ADMIN_CONTENT_CLASS = 'min-h-0 min-w-0 flex-1 overflow-auto p-4 sm:p-6';

export const adminShellLocksSidebar = (className: string): boolean =>
  className.includes('h-dvh') && className.includes('overflow-hidden');

export const customerStatusHref = (status: AccountStatus | 'all') => {
  if (status === 'all') return routes.customers;
  return `${routes.customers}?status=${status}`;
};

export const ADMIN_NAV_ITEMS = [
  { to: routes.root, label: 'Dashboard', end: true },
  { to: routes.customers, label: 'Customers', end: false },
  { to: routes.products, label: 'Products', end: false },
  { to: routes.orders, label: 'Orders', end: false },
  { to: routes.coupons, label: 'Coupons', end: false },
  { to: '/content', label: 'Content', end: false },
  { to: '/reports', label: 'Reports', end: false },
] as const;

export const COMING_NEXT_COPY = 'This screen is not built yet.';

export const PLACEHOLDER_SCREENS = [
  { path: routes.orders, name: 'Orders' },
  { path: routes.coupons, name: 'Coupons' },
  { path: '/content', name: 'Content' },
  { path: '/reports', name: 'Reports' },
] as const;

export const dashboardCustomerStats = (counts: AdminCustomerCounts) => [
  { label: 'Total customers', value: counts.all, href: customerStatusHref('all') },
  { label: 'Pending approvals', value: counts.pending, href: customerStatusHref('pending') },
  { label: 'Approved', value: counts.approved, href: customerStatusHref('approved') },
  { label: 'Blocked', value: counts.rejected, href: customerStatusHref('rejected') },
];

const ADMIN_CLICKABLE =
  'cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-50';

export type AdminActionTone = 'default' | 'danger' | 'primary';

/** Bordered 36px table actions: view / edit / copy / more / delete. */
export const adminIconBtnClass = (tone: Exclude<AdminActionTone, 'primary'> = 'default') => {
  const base = `flex size-9 items-center justify-center rounded-[6px] border bg-canvas ${ADMIN_CLICKABLE}`;
  if (tone === 'danger') {
    return `${base} border-line text-canam-red hover:border-canam-red hover:bg-canam-red hover:text-white disabled:hover:border-line disabled:hover:bg-canvas disabled:hover:text-canam-red`;
  }
  return `${base} border-line text-navy hover:border-navy hover:bg-navy hover:text-white disabled:hover:border-line disabled:hover:bg-canvas disabled:hover:text-navy`;
};

/** Labeled card actions on mobile product / customer rows. */
export const adminCardActionClass = (tone: AdminActionTone = 'default') => {
  const base = `flex h-11 items-center justify-center rounded-[6px] font-display text-[13px] font-bold ${ADMIN_CLICKABLE}`;
  if (tone === 'primary') {
    return `${base} bg-navy px-3 text-white hover:bg-navy/90`;
  }
  if (tone === 'danger') {
    return `${base} border border-canam-red/30 text-canam-red hover:border-canam-red hover:bg-canam-red hover:text-white disabled:hover:border-canam-red/30 disabled:hover:bg-transparent disabled:hover:text-canam-red`;
  }
  return `${base} border border-line bg-canvas text-navy hover:border-navy hover:bg-navy hover:text-white disabled:hover:border-line disabled:hover:bg-canvas disabled:hover:text-navy`;
};

export const adminFilterChipClass = (active: boolean) => {
  const base = `h-11 shrink-0 snap-start rounded-[20px] border px-4 font-display text-[13px] font-bold ${ADMIN_CLICKABLE}`;
  return active ? `${base} border-navy bg-navy text-white` : `${base} border-line bg-white text-navy hover:border-navy hover:bg-canvas`;
};

export const adminPaginationBtnClass = (active: boolean, emphasize = false) => {
  const base = `h-11 min-w-11 shrink-0 rounded-[6px] px-3 font-display text-[13px] font-bold ${ADMIN_CLICKABLE}`;
  if (active) return `${base} bg-navy text-white`;
  if (emphasize) return `${base} bg-navy text-white hover:bg-navy/90`;
  return `${base} border border-line bg-white text-navy hover:border-navy hover:bg-canvas`;
};
