import { ACCOUNT_STATUSES, type AccountStatus, type OrderStatus, type ProductStatus } from '../types/api.ts';

export const LIST_SEARCH_MAX = 200;

export const parsePageParam = (value: string | null): number => {
  const page = Number(value || 1);
  return Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
};

export const parseProductStatusFilter = (value: string | null): ProductStatus | 'all' => {
  if (value === 'active' || value === 'inactive' || value === 'draft') return value;
  return 'all';
};

export const parseAccountStatusFilter = (value: string | null): AccountStatus | 'all' =>
  (ACCOUNT_STATUSES as readonly (string | null)[]).includes(value) ? (value as AccountStatus) : 'all';

export const parseOrderStatusFilter = (value: string | null): OrderStatus | 'all' => {
  if (
    value === 'pending' ||
    value === 'confirmed' ||
    value === 'processing' ||
    value === 'shipped' ||
    value === 'delivered' ||
    value === 'cancelled'
  ) {
    return value;
  }
  return 'all';
};

export const parseCouponStatusFilter = (value: string | null): 'active' | 'inactive' | 'all' => {
  if (value === 'active' || value === 'inactive') return value;
  return 'all';
};

export const parseRangeFilter = (value: string | null): '30d' | '' => (value === '30d' ? '30d' : '');

const cloneParams = (params: URLSearchParams) => new URLSearchParams(params);

export const applyListSearch = (params: URLSearchParams, search: string): URLSearchParams => {
  const next = cloneParams(params);
  const trimmed = search.trim().slice(0, LIST_SEARCH_MAX);
  if (trimmed) next.set('q', trimmed);
  else next.delete('q');
  next.set('page', '1');
  return next;
};

export const applyListFilter = (params: URLSearchParams, key: string, value: string): URLSearchParams => {
  const next = cloneParams(params);
  if (!value || value === 'all') next.delete(key);
  else next.set(key, value);
  next.set('page', '1');
  if (key === 'status' && value !== 'pending') next.delete('range');
  return next;
};

export const applyListPage = (params: URLSearchParams, page: number): URLSearchParams => {
  const next = cloneParams(params);
  next.set('page', String(page));
  return next;
};
