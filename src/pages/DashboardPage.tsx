import { Link } from 'react-router-dom';
import { useCustomers } from '../hooks/useCustomers.ts';
import { dashboardCustomerStats } from '../lib/adminChrome.ts';
import { useAuthStore } from '../store/useAuthStore.ts';
import { routes } from '../routes.ts';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const query = useCustomers({ page: 1 });
  const counts = query.data?.counts ?? { all: 0, approved: 0, pending: 0, rejected: 0 };
  const stats = dashboardCustomerStats(counts);

  return (
    <section className="flex min-w-0 flex-col gap-4 lg:gap-6">
      <div className="rounded-lg border border-line bg-white p-5 sm:p-8">
        <h2 className="font-display text-[20px] font-extrabold text-navy sm:text-[22px]">Welcome back</h2>
        <p className="mt-2 break-words font-body text-[14px] text-muted">
          Signed in as {user?.contactName || user?.email}.
        </p>
        <Link
          to={routes.customers}
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-[6px] bg-navy px-4 py-2.5 font-display text-[13px] font-bold text-white sm:w-auto"
        >
          Open customers
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.href}
            className="rounded-lg border border-line bg-white p-4 transition-colors hover:border-navy/30"
          >
            <p className="font-display text-[11px] font-bold uppercase tracking-wide text-muted">{stat.label}</p>
            <p className="mt-2 font-display text-[28px] font-extrabold leading-none text-navy">
              {query.isLoading ? '—' : stat.value}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
