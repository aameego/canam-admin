import type { Category, ListParams, PageResult, Product, ProductStatus } from '../types/api.ts';
import client from './client.ts';

export type ProductWrite = {
  title: string;
  sku: string;
  categoryId: string;
  description?: string;
  specs?: string;
  status?: ProductStatus;
  image?: string;
  piecesPerCarton?: number | null;
  priceCarton?: number | null;
  priceUnit?: number | null;
  price: number;
  moq?: number | null;
  customBranding?: boolean;
  bulkTiers?: Product['bulkTiers'];
  volume?: string | null;
  volumeUnit?: string | null;
  material?: string | null;
  dimension?: string | null;
  packSize?: string | null;
};

export type ProductListResult = PageResult<Product> & {
  counts: { all: number; active: number; inactive: number; draft: number };
};

export const productsApi = {
  list: (params: ListParams = {}) => client.get<ProductListResult>('/products', { params }),
  get: (id: string) => client.get<{ item: Product }>(`/products/${id}`),
  create: (body: ProductWrite) => client.post<{ item: Product }>('/products', body),
  update: (id: string, body: Partial<ProductWrite>) =>
    client.patch<{ item: Product }>(`/products/${id}`, body),
  updateStatus: (id: string, status: ProductStatus) =>
    client.patch<{ item: Product }>(`/products/${id}/status`, { status }),
  duplicate: (id: string) => client.post<{ item: Product }>(`/products/${id}/duplicate`),
  remove: (id: string) => client.delete<{ ok: boolean }>(`/products/${id}`),
  exportCsv: (params: ListParams = {}) =>
    client.get<Blob>('/products/export', { params, responseType: 'blob' }),
};

export const categoriesApi = {
  list: () => client.get<{ categories: Category[] }>('/categories'),
  create: (body: { name: string; code?: string; slug?: string; isActive?: boolean }) =>
    client.post<{ category: Category }>('/categories', body),
  update: (id: string, body: Partial<{ name: string; code: string; slug: string; isActive: boolean }>) =>
    client.patch<{ category: Category }>(`/categories/${id}`, body),
  remove: (id: string) => client.delete<{ ok: boolean }>(`/categories/${id}`),
};
