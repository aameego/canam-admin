import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { couponsApi, type CouponWrite } from '../api/coupons.ts';
import { adminQueryKeys } from '../lib/queryKeys.ts';
import type { ListParams } from '../types/api.ts';

export const useCoupons = (params: ListParams = {}) =>
  useQuery({
    queryKey: adminQueryKeys.coupons(params),
    queryFn: async () => (await couponsApi.list(params)).data,
  });

export const useCoupon = (id: string | undefined) =>
  useQuery({
    queryKey: adminQueryKeys.coupon(id),
    queryFn: async () => (await couponsApi.get(id as string)).data.item,
    enabled: Boolean(id),
  });

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CouponWrite) => couponsApi.create(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.couponsRoot });
    },
  });
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<CouponWrite> }) =>
      couponsApi.update(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.couponsRoot });
    },
  });
};

export const useDeactivateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => couponsApi.deactivate(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.couponsRoot });
    },
  });
};
