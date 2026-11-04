import type { AdminRole, PermissionModule, TeamMember } from '../types/api.ts';
import client from './client.ts';

export type RoleWrite = { name: string; description: string; permissions: string[] };

export type MemberWrite = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roleId: string;
  department: string;
  status?: TeamMember['status'];
};

export const accessApi = {
  roles: () => client.get<{ items: AdminRole[]; modules: PermissionModule[] }>('/admin/access/roles'),
  createRole: (body: RoleWrite) => client.post<{ message: string; item: { id: string } }>('/admin/access/roles', body),
  updateRole: (id: string, body: RoleWrite) => client.patch<{ message: string }>(`/admin/access/roles/${id}`, body),
  deleteRole: (id: string) => client.delete<{ message: string }>(`/admin/access/roles/${id}`),
  team: () => client.get<{ items: TeamMember[] }>('/admin/access/team'),
  inviteMember: (body: MemberWrite) => client.post<{ message: string }>('/admin/access/team', body),
  updateMember: (id: string, body: Partial<MemberWrite>) =>
    client.patch<{ message: string }>(`/admin/access/team/${id}`, body),
  removeMember: (id: string) => client.delete<{ message: string }>(`/admin/access/team/${id}`),
};
