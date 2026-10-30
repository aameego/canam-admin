import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customersApi, type CustomerListParams } from '../api/customers.ts';
import { adminQueryKeys } from '../lib/queryKeys.ts';
import type { AccountStatus, CustomerWrite } from '../types/api.ts';

export const useCustomers = (params: CustomerListParams) =>
  useQuery({
    queryKey: adminQueryKeys.customers(params),
    queryFn: async () => (await customersApi.list(params)).data,
    placeholderData: keepPreviousData,
  });

export const useCustomer = (id: string | undefined) =>
  useQuery({
    queryKey: adminQueryKeys.customer(id),
    queryFn: async () => (await customersApi.get(id as string)).data.customer,
    enabled: Boolean(id),
  });

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CustomerWrite) => customersApi.create(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.customersRoot });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<CustomerWrite> }) => customersApi.update(id, body),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.customersRoot });
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.customer(vars.id) });
    },
  });
};

export const useUpdateCustomerStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, accountStatus }: { id: string; accountStatus: AccountStatus }) =>
      customersApi.updateStatus(id, accountStatus),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.customersRoot });
    },
  });
};

export const useExportCustomers = () =>
  useMutation({
    mutationFn: async (params: CustomerListParams) => (await customersApi.exportCsv(params)).data,
  });
