import type {
  AccountStatus,
  CustomerDetail,
  CustomerListParams,
  CustomerListResult,
  CustomerWrite,
} from '../types/api.ts';
import client from './client.ts';

export type { CustomerListParams };

export const customersApi = {
  list: (params: CustomerListParams = {}) => client.get<CustomerListResult>('/admin/customers', { params }),
  get: (id: string, params: { orderPage?: number; orderLimit?: number } = {}) =>
    client.get<{ customer: CustomerDetail }>(`/admin/customers/${id}`, { params }),
  create: (body: CustomerWrite) => client.post<{ customer: { id: string } }>('/admin/customers', body),
  update: (id: string, body: Partial<CustomerWrite>) => client.patch(`/admin/customers/${id}`, body),
  updateStatus: (id: string, accountStatus: AccountStatus) =>
    client.patch(`/admin/customers/${id}/status`, { accountStatus }),
  exportCsv: (params: CustomerListParams = {}) =>
    client.get<Blob>('/admin/customers/export', { params, responseType: 'blob' }),
};
