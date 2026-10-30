import type { CustomerListParams, ListParams } from '../types/api.ts';

export const adminQueryKeys = {
  me: ['admin', 'me'] as const,
  productsRoot: ['admin', 'products'] as const,
  products: (params: ListParams) => ['admin', 'products', params] as const,
  product: (id: string | undefined) => ['admin', 'products', id] as const,
  categories: ['admin', 'categories'] as const,
  customersRoot: ['admin', 'customers'] as const,
  customers: (params: CustomerListParams) => ['admin', 'customers', params] as const,
  customer: (id: string | undefined) => ['admin', 'customers', id] as const,
  ordersRoot: ['admin', 'orders'] as const,
  orders: (params: ListParams) => ['admin', 'orders', params] as const,
  order: (id: string | undefined) => ['admin', 'orders', id] as const,
  couponsRoot: ['admin', 'coupons'] as const,
  coupons: (params: ListParams) => ['admin', 'coupons', params] as const,
  coupon: (id: string | undefined) => ['admin', 'coupons', id] as const,
};
