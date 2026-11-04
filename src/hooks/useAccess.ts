import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { accessApi, type MemberWrite, type RoleWrite } from '../api/access.ts';
import { adminQueryKeys } from '../lib/queryKeys.ts';

export const useRoles = () =>
  useQuery({
    queryKey: adminQueryKeys.roles,
    queryFn: async () => (await accessApi.roles()).data,
  });

export const useTeam = () =>
  useQuery({
    queryKey: adminQueryKeys.team,
    queryFn: async () => (await accessApi.team()).data.items,
  });

/** Roles and team counts depend on each other, so every write refreshes both (and /me, in case it was you). */
const useAccessMutation = <T, R>(fn: (input: T) => Promise<R>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.accessRoot });
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.me });
    },
  });
};

export const useSaveRole = () =>
  useAccessMutation(({ id, body }: { id?: string; body: RoleWrite }) =>
    id ? accessApi.updateRole(id, body) : accessApi.createRole(body),
  );

export const useDeleteRole = () => useAccessMutation((id: string) => accessApi.deleteRole(id));

export const useSaveMember = () =>
  useAccessMutation(({ id, body }: { id?: string; body: MemberWrite }) =>
    id ? accessApi.updateMember(id, body) : accessApi.inviteMember(body),
  );

export const useRemoveMember = () => useAccessMutation((id: string) => accessApi.removeMember(id));
