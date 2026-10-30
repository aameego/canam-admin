import type { Coupon, CouponType, ListParams, PageResult } from '../types/api.ts';
import client from './client.ts';

export type CouponWrite = {
  code: string;
  type: CouponType;
  value: number;
  minSubtotal?: number;
  maxDiscount?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
  usageLimit?: number | null;
  isActive?: boolean;
  productIds?: string[];
  categoryIds?: string[];
};

export const couponsApi = {
  list: (params: ListParams = {}) => client.get<PageResult<Coupon>>('/admin/coupons', { params }),
  get: (id: string) => client.get<{ item: Coupon }>(`/admin/coupons/${id}`),
  create: (body: CouponWrite) => client.post<{ item: Coupon }>('/admin/coupons', body),
  update: (id: string, body: Partial<CouponWrite>) =>
    client.patch<{ item: Coupon }>(`/admin/coupons/${id}`, body),
  deactivate: (id: string) => client.delete<{ item: Coupon }>(`/admin/coupons/${id}`),
};
