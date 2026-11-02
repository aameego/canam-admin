import type { ListParams, Order, OrderListResult, OrderStatus, OrderSummary } from '../types/api.ts';
import client from './client.ts';

export const ordersApi = {
  list: (params: ListParams = {}) => client.get<OrderListResult>('/admin/orders', { params }),
  summary: () => client.get<OrderSummary>('/admin/orders/summary'),
  get: (id: string) => client.get<{ order: Order }>(`/admin/orders/${id}`),
  update: (id: string, body: { status?: OrderStatus; notes?: string }) =>
    client.patch<{ order: Order }>(`/admin/orders/${id}`, body),
};
