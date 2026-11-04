import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import BusyOverlay from '../components/BusyOverlay.tsx';
import { IconPencil, IconTrash } from '../components/icons.tsx';
import { useRemoveMember, useRoles, useSaveMember, useTeam } from '../hooks/useAccess.ts';
import type { MemberWrite } from '../api/access.ts';
import { adminIconBtnClass } from '../lib/adminChrome.ts';
import { getErrorMessage } from '../lib/getErrorMessage.ts';
import { formatOrderDate } from '../lib/orders.ts';
import { routes } from '../routes.ts';
import type { AdminRole, TeamMember } from '../types/api.ts';

const fieldClass =
  'w-full rounded-[6px] border border-line bg-white px-3 py-2.5 font-body text-[14px] text-ink outline-none focus:border-navy disabled:bg-canvas disabled:text-muted';
const labelClass = 'font-display text-[11px] font-bold uppercase tracking-wide text-navy';
const cardClass = 'rounded-lg border border-line bg-white p-4 sm:p-5';
const outlineBtnClass =
  'inline-flex h-9 cursor-pointer items-center rounded-[6px] border border-navy px-3 font-display text-[12px] font-bold text-navy hover:bg-navy hover:text-white';

/** Super Admin is solid navy as in Figma; other roles cycle through light tints. */
const ROLE_TINTS = [
  'border-sky-200 bg-sky-50 text-sky-800',
  'border-line bg-canvas text-ink',
  'border-emerald-200 bg-emerald-50 text-emerald-800',
  'border-amber-200 bg-amber-50 text-amber-800',
  'border-violet-200 bg-violet-50 text-violet-800',
];

const roleBadgeClass = (roles: AdminRole[], roleId: string) => {
  const role = roles.find((r) => r.id === roleId);
  if (!role) return 'border-canam-red/30 bg-white text-canam-red';
  if (role.isSystem) return 'border-navy bg-navy text-white';
  const index = roles.filter((r) => !r.isSystem).findIndex((r) => r.id === roleId);
  return ROLE_TINTS[index % ROLE_TINTS.length];
};

export default function SettingsPage() {
  const team = useTeam();
  const roles = useRoles();
  const remove = useRemoveMember();
  const [editing, setEditing] = useState<TeamMember | 'new' | null>(null);
  const [notice, setNotice] = useState('');
  const roleList = roles.data?.items ?? [];

  const onRemove = (member: TeamMember) => {
    if (!window.confirm(`Remove ${member.name} from the team? They will lose admin access.`)) return;
    setNotice('');
    remove.mutate(member.id, {
      onSuccess: () => setNotice(`${member.name} removed.`),
      onError: (err) => setNotice(getErrorMessage(err, 'Could not remove this team member.')),
    });
  };

  return (
    <section className="flex min-w-0 flex-col gap-4 lg:gap-6">
      {notice ? (
        <p className="rounded-[6px] border border-line bg-white px-4 py-3 font-body text-[13px] text-navy" role="status">
          {notice}
        </p>
      ) : null}

      <div className={cardClass}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-[16px] font-extrabold text-navy">Team Members</h2>
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="flex h-10 cursor-pointer items-center rounded-[6px] bg-canam-red px-4 font-display text-[13px] font-bold text-white hover:bg-canam-red/90"
          >
            + Add Employee
          </button>
        </div>
        {team.isError ? (
          <p className="mt-4 font-body text-[13px] text-canam-red" role="alert">
            {getErrorMessage(team.error, 'Could not load the team.')}
          </p>
        ) : null}
        <div className="relative mt-4 overflow-x-auto rounded-[6px] border border-line">
          {team.isLoading ? <BusyOverlay label="Loading team…" /> : null}
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-canvas font-display text-[11px] font-bold uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-2.5">Name / Email</th>
                <th className="px-4 py-2.5">Role</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Last active</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(team.data ?? []).map((member) => (
                <tr key={member.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <p className="font-display text-[14px] font-bold text-navy">
                      {member.name}
                      {member.isYou ? <span className="ml-2 font-body text-[12px] font-normal text-muted">(you)</span> : null}
                    </p>
                    <p className="font-body text-[12px] text-muted">{member.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-xl border px-2.5 py-1 font-display text-[11px] font-bold ${roleBadgeClass(roleList, member.roleId)}`}
                    >
                      {member.roleName}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <MemberStatus member={member} />
                  </td>
                  <td className="px-4 py-3 font-body text-[13px] text-muted">
                    {member.lastActiveAt ? formatOrderDate(member.lastActiveAt) : 'Never'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className={adminIconBtnClass()}
                        aria-label={`Edit ${member.name}`}
                        onClick={() => setEditing(member)}
                      >
                        <IconPencil />
                      </button>
                      <button
                        type="button"
                        className={adminIconBtnClass('danger')}
                        aria-label={`Remove ${member.name}`}
                        disabled={member.isYou || remove.isPending}
                        onClick={() => onRemove(member)}
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={cardClass}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-[16px] font-extrabold text-navy">Manage Roles</h2>
          <Link to={routes.roleNew} className={outlineBtnClass}>
            + Create Role
          </Link>
        </div>
        {roles.isError ? (
          <p className="mt-4 font-body text-[13px] text-canam-red" role="alert">
            {getErrorMessage(roles.error, 'Could not load roles.')}
          </p>
        ) : null}
        <div className="relative mt-4 flex flex-col gap-3">
          {roles.isLoading ? <BusyOverlay label="Loading roles…" /> : null}
          {roleList.map((role) => (
            <div
              key={role.id}
              className="flex flex-col gap-3 rounded-[6px] border border-line bg-canvas px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 font-display text-[14px] font-bold text-navy">
                  {role.name}
                  <span className="rounded-xl border border-line bg-white px-2 py-0.5 font-body text-[11px] font-normal text-muted">
                    {role.memberCount} {role.memberCount === 1 ? 'member' : 'members'}
                  </span>
                </p>
                <p className="mt-0.5 font-body text-[12px] text-muted">{role.description}</p>
              </div>
              <Link to={routes.roleEdit(role.id)} className={`${outlineBtnClass} shrink-0 self-start sm:self-auto`}>
                {role.isSystem ? 'View Permissions' : 'Edit Permissions'}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {roles.data ? <PermissionMatrix roles={roleList} modules={roles.data.modules} /> : null}

      {editing ? (
        <MemberDialog
          member={editing === 'new' ? null : editing}
          roles={roleList}
          onClose={() => setEditing(null)}
          onSaved={(message) => {
            setEditing(null);
            setNotice(message);
          }}
        />
      ) : null}
    </section>
  );
}

function MemberStatus({ member }: { member: TeamMember }) {
  const inactive = member.status === 'inactive';
  return (
    <span className="flex flex-wrap gap-1.5">
      <span
        className={`inline-flex rounded-xl border px-2.5 py-1 font-display text-[11px] font-bold ${
          inactive ? 'border-canam-red/30 bg-red-50 text-canam-red' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
        }`}
      >
        {inactive ? 'Inactive' : 'Active'}
      </span>
      {member.invitePending ? (
        <span className="inline-flex rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-1 font-display text-[11px] font-bold text-amber-800">
          Invited
        </span>
      ) : null}
    </span>
  );
}

function PermissionMatrix({ roles, modules }: { roles: AdminRole[]; modules: { module: string; permissions: { key: string; label: string }[] }[] }) {
  return (
    <div className={cardClass}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-[16px] font-extrabold text-navy">Detailed Permission Matrix</h2>
        <p className="font-body text-[12px] text-muted">Review cross-role permission alignment</p>
      </div>
      <div className="mt-4 overflow-x-auto rounded-[6px] border border-line">
        <table className="w-full min-w-[640px] text-left">
          <thead className="bg-canvas font-display text-[11px] font-bold uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-2.5">Module / Permission</th>
              {roles.map((role) => (
                <th key={role.id} className="px-3 py-2.5 text-center">
                  {role.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map((group) => (
              <MatrixGroup key={group.module} title={group.module} colSpan={roles.length + 1}>
                {group.permissions.map((permission) => (
                  <tr key={permission.key} className="border-t border-line">
                    <td className="px-4 py-2 pl-8 font-body text-[13px] text-ink">{permission.label}</td>
                    {roles.map((role) => (
                      <td key={role.id} className="px-3 py-2 text-center font-display text-[14px]">
                        {role.permissions.includes(permission.key) ? (
                          <span className="text-emerald-600" aria-label="Allowed">✓</span>
                        ) : (
                          <span className="text-line" aria-label="Not allowed">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </MatrixGroup>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MatrixGroup({ title, colSpan, children }: { title: string; colSpan: number; children: ReactNode }) {
  return (
    <>
      <tr className="border-t border-line bg-canvas/60">
        <th colSpan={colSpan} className="px-4 py-2 font-display text-[13px] font-bold text-navy">
          {title}
        </th>
      </tr>
      {children}
    </>
  );
}

const emptyForm = (roles: AdminRole[]): MemberWrite => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  // Default new staff to the least-privileged-looking role, never Super Admin.
  roleId: roles.find((r) => !r.isSystem)?.id ?? '',
  department: '',
  status: 'active',
});

function MemberDialog({
  member,
  roles,
  onClose,
  onSaved,
}: {
  member: TeamMember | null;
  roles: AdminRole[];
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const save = useSaveMember();
  const [error, setError] = useState('');
  const [form, setForm] = useState<MemberWrite>(() =>
    member
      ? {
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          phone: member.phone,
          roleId: member.roleId,
          department: member.department,
          status: member.status,
        }
      : emptyForm(roles),
  );

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  const onChange = (key: keyof MemberWrite) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    const { email: _email, ...edits } = form;
    save.mutate(
      member ? { id: member.id, body: edits as MemberWrite } : { body: form },
      {
        onSuccess: (res) => onSaved(res.data.message),
        onError: (err) => setError(getErrorMessage(err, 'Could not save this team member.')),
      },
    );
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="m-auto w-[min(520px,calc(100vw-32px))] rounded-lg border border-line bg-white p-0 backdrop:bg-navy/50"
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-[20px] font-extrabold text-navy">
            {member ? `Edit ${member.name}` : 'Add New Employee'}
          </h2>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="cursor-pointer rounded-full border border-line px-2 font-display text-[14px] text-muted hover:text-navy"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        {error ? (
          <p className="font-body text-[13px] text-canam-red" role="alert">
            {error}
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" htmlFor="firstName">
            <input id="firstName" className={fieldClass} placeholder="e.g. John" value={form.firstName} onChange={onChange('firstName')} required />
          </Field>
          <Field label="Last name" htmlFor="lastName">
            <input id="lastName" className={fieldClass} placeholder="e.g. Doe" value={form.lastName} onChange={onChange('lastName')} required />
          </Field>
        </div>
        <Field label="Email address" htmlFor="email">
          <input
            id="email"
            type="email"
            className={fieldClass}
            placeholder="employee@canam-wholesale.ca"
            value={form.email}
            onChange={onChange('email')}
            disabled={Boolean(member)}
            required
          />
        </Field>
        <Field label="Phone number" htmlFor="phone">
          <input id="phone" type="tel" className={fieldClass} placeholder="+1 (555) 000-0000" value={form.phone} onChange={onChange('phone')} required />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Role" htmlFor="roleId">
            <select id="roleId" className={fieldClass} value={form.roleId} onChange={onChange('roleId')} disabled={member?.isYou} required>
              <option value="" disabled>
                Choose a role
              </option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </Field>
          {member ? (
            <Field label="Status" htmlFor="status">
              <select id="status" className={fieldClass} value={form.status} onChange={onChange('status')} disabled={member.isYou}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
          ) : null}
        </div>
        <Field label="Department" htmlFor="department">
          <input
            id="department"
            className={fieldClass}
            placeholder="e.g. Western Canada Sales Division"
            value={form.department}
            onChange={onChange('department')}
          />
        </Field>
        {!member ? (
          <p className="font-body text-[12px] text-muted">
            They'll get an email with a link to set their password (valid for 7 days).
          </p>
        ) : null}
        <div className="mt-2 flex justify-end gap-3 border-t border-line pt-4">
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="h-11 cursor-pointer rounded-[6px] border border-navy px-4 font-display text-[13px] font-bold text-navy hover:bg-canvas"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={save.isPending}
            className="h-11 cursor-pointer rounded-[6px] bg-canam-red px-4 font-display text-[13px] font-bold text-white hover:bg-canam-red/90 disabled:opacity-70"
          >
            {save.isPending ? 'Saving…' : member ? 'Save Changes' : 'Send Invitation'}
          </button>
        </div>
      </form>
    </dialog>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={labelClass} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}
