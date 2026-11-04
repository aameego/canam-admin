import { Link, Outlet } from 'react-router-dom';
import { ADMIN_NAV_ITEMS } from '../lib/adminChrome.ts';
import { can } from '../lib/authAccess.ts';
import { useAuthStore } from '../store/useAuthStore.ts';

/** Route guard: renders child routes only for roles with any of `anyOf`. The API enforces the same rules. */
export default function RequirePermission({ anyOf }: { anyOf: string[] }) {
  const user = useAuthStore((state) => state.user);
  if (can(user, ...anyOf)) return <Outlet />;
  const home = ADMIN_NAV_ITEMS.find((item) => can(user, item.permission));
  return (
    <section className="rounded-lg border border-line bg-white p-5 sm:p-8">
      <h2 className="font-display text-[18px] font-extrabold text-navy">No access</h2>
      <p className="mt-2 font-body text-[14px] text-muted">
        Your role ({user?.adminRoleName || 'none'}) does not include this section. Ask a Super Admin to update your
        permissions in Settings.
      </p>
      {home ? (
        <Link
          to={home.to}
          className="mt-5 inline-flex h-11 items-center rounded-[6px] bg-navy px-4 font-display text-[13px] font-bold text-white hover:bg-navy/90"
        >
          Go to {home.label}
        </Link>
      ) : null}
    </section>
  );
}
