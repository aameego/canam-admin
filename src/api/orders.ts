import type { ListParams, Order, OrderStatus, PageResult } from '../types/api.ts';
import client from './client.ts';

export const ordersApi = {
  list: (params: ListParams = {}) => client.get<PageResult<Order>>('/admin/orders', { params }),
  get: (id: string) => client.get<{ order: Order }>(`/admin/orders/${id}`),
  update: (id: string, body: { status?: OrderStatus; notes?: string }) =>
    client.patch<{ order: Order }>(`/admin/orders/${id}`, body),
};
