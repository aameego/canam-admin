import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { authApi } from '../api/auth.ts';
import { ADMIN_ACCESS_DENIED, canAccessAdmin, mapCurrentUser } from '../lib/authAccess.ts';
import { adminQueryKeys } from '../lib/queryKeys.ts';
import { useAuthStore } from '../store/useAuthStore.ts';

export const useCurrentAdmin = () => {
  const { setUser, clearAuth, setLoading } = useAuthStore();

  const query = useQuery({
    queryKey: adminQueryKeys.me,
    queryFn: async () => {
      const res = await authApi.me();
      return mapCurrentUser(res.data.user);
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (query.isSuccess && query.data) {
      if (!canAccessAdmin(query.data)) {
        clearAuth();
        return;
      }
      setUser(query.data);
    }
    if (query.isError) clearAuth();
  }, [query.isSuccess, query.isError, query.data, setUser, clearAuth]);

  useEffect(() => {
    if (query.isLoading) setLoading(true);
  }, [query.isLoading, setLoading]);

  return query;
};

export const useAdminLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      await authApi.login(email, password);
      const me = await authApi.me();
      const user = mapCurrentUser(me.data.user);
      if (!canAccessAdmin(user)) {
        await authApi.logout();
        throw new Error(ADMIN_ACCESS_DENIED);
      }
      return user;
    },
    onSuccess: (user) => {
      useAuthStore.getState().setUser(user);
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.me });
    },
  });
};

export const useForgotPassword = () =>
  useMutation({
    mutationFn: async (email: string) => {
      const res = await authApi.forgotPassword(email);
      return res.data.message;
    },
  });

export const useResetPassword = () =>
  useMutation({
    mutationFn: async ({ token, password }: { token: string; password: string }) => {
      const res = await authApi.resetPassword(token, password);
      return res.data.message;
    },
  });

export const useAdminLogout = () => {
  const { clearAuth } = useAuthStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearAuth();
      queryClient.clear();
    },
  });
};
