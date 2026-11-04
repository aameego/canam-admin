import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BusyOverlay from '../components/BusyOverlay.tsx';
import { useDeleteRole, useRoles, useSaveRole } from '../hooks/useAccess.ts';
import { getErrorMessage } from '../lib/getErrorMessage.ts';
import { routes } from '../routes.ts';
import type { PermissionModule } from '../types/api.ts';

const fieldClass =
  'w-full rounded-[6px] border border-line bg-white px-3 py-2.5 font-body text-[14px] text-ink outline-none focus:border-navy disabled:bg-canvas disabled:text-muted';
const labelClass = 'font-display text-[11px] font-bold uppercase tracking-wide text-navy';
const cardClass = 'rounded-lg border border-line bg-white p-4 sm:p-5';

export default function RoleFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const roles = useRoles();
  const save = useSaveRole();
  const remove = useDeleteRole();
  const role = id ? roles.data?.items.find((r) => r.id === id) : undefined;
  const locked = Boolean(role?.isSystem);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [granted, setGranted] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');

  useEffect(() => {
    if (!role) return;
    setName(role.name);
    setDescription(role.description);
    setGranted(new Set(role.permissions));
  }, [role]);

  if (roles.isLoading) {
    return (
      <div className={`relative min-h-48 ${cardClass}`}>
        <BusyOverlay label="Loading role…" />
      </div>
    );
  }
  if (id && !role) {
    return (
      <section className={cardClass}>
        <p className="font-body text-[14px] text-muted">
          {roles.isError ? getErrorMessage(roles.error, 'Could not load roles.') : 'This role no longer exists.'}
        </p>
        <Link to={routes.settings} className="mt-4 inline-block font-display text-[13px] font-bold text-navy underline">
          Back to Settings
        </Link>
      </section>
    );
  }

  const toggle = (keys: string[], on: boolean) =>
    setGranted((prev) => {
      const next = new Set(prev);
      for (const key of keys) {
        if (on) next.add(key);
        else next.delete(key);
      }
      return next;
    });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    save.mutate(
      { id, body: { name, description, permissions: [...granted] } },
      {
        onSuccess: () => navigate(routes.settings),
        onError: (err) => setError(getErrorMessage(err, 'Could not save this role.')),
      },
    );
  };

  const onDelete = () => {
    if (!role || !window.confirm(`Delete the ${role.name} role?`)) return;
    setError('');
    remove.mutate(role.id, {
      onSuccess: () => navigate(routes.settings),
      onError: (err) => setError(getErrorMessage(err, 'Could not delete this role.')),
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex min-w-0 max-w-[880px] flex-col gap-4 lg:gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to={routes.settings} className="font-display text-[18px] text-navy" aria-label="Back to Settings">
            ←
          </Link>
          <h2 className="font-display text-[18px] font-extrabold text-navy">
            {role ? `${locked ? 'View' : 'Edit'} Role: ${role.name}` : 'Create Role'}
          </h2>
        </div>
        {!locked ? (
          <div className="flex gap-3">
            <Link
              to={routes.settings}
              className="flex h-10 items-center rounded-[6px] border border-navy px-4 font-display text-[13px] font-bold text-navy hover:bg-canvas"
            >
              Discard
            </Link>
            <button
              type="submit"
              disabled={save.isPending}
              className="h-10 cursor-pointer rounded-[6px] bg-canam-red px-4 font-display text-[13px] font-bold text-white hover:bg-canam-red/90 disabled:opacity-70"
            >
              {save.isPending ? 'Saving…' : role ? 'Save Changes' : 'Create Role'}
            </button>
          </div>
        ) : null}
      </div>

      {locked ? (
        <p className="rounded-[6px] border border-line bg-white px-4 py-3 font-body text-[13px] text-muted">
          Super Admin always has every permission and can't be edited.
        </p>
      ) : null}
      {error ? (
        <p className="font-body text-[13px] text-canam-red" role="alert">
          {error}
        </p>
      ) : null}

      <div className={cardClass}>
        <h3 className="font-display text-[15px] font-extrabold text-navy">Role Details</h3>
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="roleName">
              Role name
            </label>
            <input
              id="roleName"
              className={fieldClass}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Sales Manager"
              disabled={locked}
              required
              maxLength={50}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="roleDescription">
              Role description
            </label>
            <textarea
              id="roleDescription"
              className={`${fieldClass} min-h-20`}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What this role is for"
              disabled={locked}
              maxLength={200}
            />
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <h3 className="font-display text-[15px] font-extrabold text-navy">Permissions Matrix</h3>
        <p className="mt-0.5 font-body text-[12px] text-muted">Assign granular action triggers for this role</p>
        <div className="mt-4 flex flex-col gap-3">
          {(roles.data?.modules ?? []).map((group) => (
            <ModuleCard key={group.module} group={group} granted={granted} locked={locked} onToggle={toggle} />
          ))}
        </div>
      </div>

      {role && !locked ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onDelete}
            disabled={remove.isPending}
            className="h-10 cursor-pointer rounded-[6px] border border-canam-red/30 px-4 font-display text-[13px] font-bold text-canam-red hover:bg-canam-red hover:text-white disabled:opacity-70"
          >
            {remove.isPending ? 'Deleting…' : 'Delete role'}
          </button>
        </div>
      ) : null}
    </form>
  );
}

function ModuleCard({
  group,
  granted,
  locked,
  onToggle,
}: {
  group: PermissionModule;
  granted: Set<string>;
  locked: boolean;
  onToggle: (keys: string[], on: boolean) => void;
}) {
  const keys = group.permissions.map((p) => p.key);
  const all = keys.every((key) => granted.has(key));
  return (
    <details open className="overflow-hidden rounded-[6px] border border-line">
      <summary className="flex cursor-pointer items-center justify-between gap-3 bg-canvas px-4 py-2.5">
        <span className="font-display text-[14px] font-bold text-navy">{group.module} Module</span>
        <label className="flex items-center gap-2 font-body text-[12px] text-muted" onClick={(event) => event.stopPropagation()}>
          <input
            type="checkbox"
            className="size-4 accent-navy"
            checked={all}
            disabled={locked}
            onChange={(event) => onToggle(keys, event.target.checked)}
          />
          Select All
        </label>
      </summary>
      {group.permissions.map((permission) => {
        const on = granted.has(permission.key);
        return (
          <div key={permission.key} className="flex items-center justify-between gap-3 border-t border-line px-4 py-2.5 pl-8">
            <span id={`perm-${permission.key}`} className="font-body text-[13px] text-ink">
              {permission.label}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={on}
              aria-labelledby={`perm-${permission.key}`}
              disabled={locked}
              onClick={() => onToggle([permission.key], !on)}
              className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                on ? 'bg-emerald-500' : 'bg-line'
              }`}
            >
              <span
                className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-[left] ${on ? 'left-[22px]' : 'left-0.5'}`}
              />
            </button>
          </div>
        );
      })}
    </details>
  );
}
