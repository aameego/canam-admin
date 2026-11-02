import { Link } from 'react-router-dom';
import BusyOverlay from '../components/BusyOverlay.tsx';
import { OrderStatusBadge } from '../components/StatusBadge.tsx';
import { useCustomers } from '../hooks/useCustomers.ts';
import { useOrderSummary } from '../hooks/useOrders.ts';
import { dashboardKpis } from '../lib/adminChrome.ts';
import { money } from '../lib/customers.ts';
import { getErrorMessage } from '../lib/getErrorMessage.ts';
import { chartBarHeight, formatOrderDate, orderItemSummary } from '../lib/orders.ts';
import { useAuthStore } from '../store/useAuthStore.ts';
import { routes } from '../routes.ts';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const customers = useCustomers({ page: 1 });
  const summary = useOrderSummary();
  const pendingApprovals = customers.data?.counts.pending ?? summary.data?.pendingApprovals ?? 0;
  const kpis = dashboardKpis({
    orders: summary.data?.orders ?? 0,
    pendingApprovals,
    revenue: summary.data?.revenue ?? 0,
    outOfStock: summary.data?.outOfStock ?? 0,
  });
  const recent = summary.data?.recent ?? [];
  const daily = summary.data?.daily ?? [];
  const maxOrders = Math.max(0, ...daily.map((day) => day.orders));
  const loading = summary.isLoading || customers.isLoading;

  return (
    <section className="flex min-w-0 flex-col gap-4 lg:gap-6">
      <div className="rounded-lg border border-line bg-white p-5 sm:p-8">
        <h2 className="font-display text-[20px] font-extrabold text-navy sm:text-[22px]">Welcome back</h2>
        <p className="mt-2 break-words font-body text-[14px] text-muted">
          Signed in as {user?.contactName || user?.email}.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link
            to={routes.orders}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-[6px] bg-navy px-4 py-2.5 font-display text-[13px] font-bold text-white sm:w-auto"
          >
            Open orders
          </Link>
          <Link
            to={routes.customers}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-[6px] border border-navy px-4 py-2.5 font-display text-[13px] font-bold text-navy sm:w-auto"
          >
            Open customers
          </Link>
        </div>
      </div>

      {summary.isError && (
        <p className="font-body text-[13px] text-canam-red" role="alert">
          {getErrorMessage(summary.error, 'Could not load dashboard orders.')}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((stat) => (
          <Link
            key={stat.label}
            to={stat.href}
            className="rounded-lg border border-line bg-white p-4 transition-colors hover:border-navy/30"
          >
            <p className="font-display text-[11px] font-bold uppercase tracking-wide text-muted">{stat.label}</p>
            <p className="mt-2 font-display text-[28px] font-extrabold leading-none text-navy">
              {loading ? '—' : stat.kind === 'money' ? money(stat.value) : stat.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="relative min-w-0 rounded-lg border border-line bg-white p-4 sm:p-6">
          {summary.isFetching && recent.length === 0 ? <BusyOverlay label="Loading orders…" /> : null}
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-[15px] font-extrabold text-navy">Recent orders</h3>
            <Link to={routes.orders} className="font-display text-[13px] font-bold text-canam-red">
              View all →
            </Link>
          </div>
          {recent.length === 0 && !summary.isLoading && (
            <p className="mt-6 font-body text-[14px] text-muted">No orders yet.</p>
          )}
          <div className="mt-4 grid gap-3 xl:hidden">
            {recent.map((order) => (
              <Link key={order.id} to={routes.order(order.id)} className="rounded-[6px] border border-line p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-display text-[14px] font-bold text-navy">{order.orderNumber}</p>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="mt-1 font-body text-[13px] text-muted">{orderItemSummary(order.items)}</p>
                <div className="mt-2 flex justify-between font-body text-[13px]">
                  <span>{formatOrderDate(order.createdAt)}</span>
                  <span className="font-display font-bold">{money(order.total)}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-4 hidden xl:block">
            <div className="flex bg-canvas px-3 py-2 font-display text-[11px] font-bold uppercase text-muted">
              <p className="min-w-0 flex-1">Order</p>
              <p className="w-[120px] shrink-0">Date</p>
              <p className="w-[100px] shrink-0 text-right">Total</p>
              <p className="w-[110px] shrink-0">Status</p>
            </div>
            {recent.map((order) => (
              <Link
                key={order.id}
                to={routes.order(order.id)}
                className="flex items-center border-t border-line px-3 py-3 hover:bg-canvas/60"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[14px] font-bold text-navy">{order.orderNumber}</p>
                  <p className="truncate font-body text-[12px] text-muted">{orderItemSummary(order.items)}</p>
                </div>
                <p className="w-[120px] shrink-0 font-body text-[13px]">{formatOrderDate(order.createdAt)}</p>
                <p className="w-[100px] shrink-0 text-right font-display text-[13px] font-bold">{money(order.total)}</p>
                <div className="w-[110px] shrink-0">
                  <OrderStatusBadge status={order.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-line bg-white p-4 sm:p-6">
          <h3 className="font-display text-[15px] font-extrabold text-navy">Last 14 days</h3>
          <p className="mt-1 font-body text-[13px] text-muted">Orders placed, excluding cancelled.</p>
          <div className="mt-6 flex h-[96px] items-end gap-1">
            {daily.map((day) => (
              <div key={day.date} className="flex min-w-0 flex-1 flex-col items-center justify-end" title={`${day.date}: ${day.orders}`}>
                <div
                  className="w-full rounded-t bg-navy"
                  style={{ height: `${chartBarHeight(day.orders, maxOrders)}px` }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
