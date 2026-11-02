import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/orders.ts';
import { adminQueryKeys } from '../lib/queryKeys.ts';
import type { ListParams, OrderStatus } from '../types/api.ts';

export const useOrders = (params: ListParams = {}) =>
  useQuery({
    queryKey: adminQueryKeys.orders(params),
    queryFn: async () => (await ordersApi.list(params)).data,
    placeholderData: keepPreviousData,
  });

export const useOrderSummary = () =>
  useQuery({
    queryKey: [...adminQueryKeys.ordersRoot, 'summary'] as const,
    queryFn: async () => (await ordersApi.summary()).data,
  });

export const useOrder = (id: string | undefined) =>
  useQuery({
    queryKey: adminQueryKeys.order(id),
    queryFn: async () => (await ordersApi.get(id as string)).data.order,
    enabled: Boolean(id),
  });

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { status?: OrderStatus; notes?: string } }) =>
      ordersApi.update(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.ordersRoot });
    },
  });
};
