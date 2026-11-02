import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import BusyOverlay from '../components/BusyOverlay.tsx';
import Pagination from '../components/Pagination.tsx';
import { OrderStatusBadge } from '../components/StatusBadge.tsx';
import { IconEye, IconSearch } from '../components/icons.tsx';
import { useOrders } from '../hooks/useOrders.ts';
import { adminCardActionClass, adminFilterChipClass, adminIconBtnClass } from '../lib/adminChrome.ts';
import { money } from '../lib/customers.ts';
import { getErrorMessage } from '../lib/getErrorMessage.ts';
import { applyListFilter, applyListPage, applyListSearch, parseOrderStatusFilter, parsePageParam } from '../lib/listQuery.ts';
import { EMPTY_ORDER_COUNTS, ORDER_STATUS_FILTERS, formatOrderDate, orderItemSummary } from '../lib/orders.ts';
import { scrollAdminContentToTop } from '../lib/pagination.ts';
import { routes } from '../routes.ts';
import type { Order } from '../types/api.ts';

export default function OrdersPage() {
  const [params, setParams] = useSearchParams();
  const status = parseOrderStatusFilter(params.get('status'));
  const page = parsePageParam(params.get('page'));
  const qParam = params.get('q') || '';
  const [search, setSearch] = useState(qParam);

  useEffect(() => {
    setSearch(qParam);
  }, [qParam]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (search === qParam) return;
      setParams(applyListSearch(params, search));
    }, 300);
    return () => window.clearTimeout(handle);
  }, [search, qParam, params, setParams]);

  const query = useOrders({
    q: qParam || undefined,
    status,
    page,
  });
  const data = query.data;
  const counts = data?.counts ?? EMPTY_ORDER_COUNTS;
  const rows = data?.items ?? [];
  const pages = data?.pages ?? 1;
  const showing = useMemo(() => rows.length, [rows.length]);
  const fetching = query.isFetching && !query.isLoading;

  const setFilter = (value: string) => {
    setParams(applyListFilter(params, 'status', value));
  };

  const setPage = (nextPage: number) => {
    setParams(applyListPage(params, nextPage));
    scrollAdminContentToTop();
  };

  return (
    <section className="flex min-w-0 flex-col gap-4 lg:gap-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <label className="flex h-11 w-full items-center gap-2 rounded-[6px] border border-line bg-white px-3 xl:w-[320px] xl:bg-canvas">
          <IconSearch className="size-[18px] shrink-0 text-muted" />
          <input
            className="w-full min-w-0 bg-transparent font-body text-[13px] text-ink outline-none placeholder:text-muted"
            placeholder="Search order, customer, SKU…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <p className="font-display text-[13px] font-bold text-navy">
          Revenue {money(data?.revenue ?? 0)}
        </p>
      </div>

      <div className="relative min-w-0">
        <div className="chip-scroller -mx-1 flex gap-2 overflow-x-auto px-1">
          {ORDER_STATUS_FILTERS.map((filter) => {
            const active = status === filter.id;
            const count = counts[filter.id];
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setFilter(filter.id)}
                className={adminFilterChipClass(active)}
              >
                {filter.label} ({count})
              </button>
            );
          })}
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-canvas to-transparent xl:hidden" />
      </div>

      {query.isError && (
        <p className="font-body text-[13px] text-canam-red" role="alert">
          {getErrorMessage(query.error, 'Could not load orders.')}
        </p>
      )}
      {query.isLoading && rows.length === 0 && (
        <div className="relative min-h-48 rounded-lg border border-line bg-white">
          <BusyOverlay label="Loading orders…" />
        </div>
      )}
      {!query.isLoading && rows.length === 0 && (
        <p className="rounded-lg border border-line bg-white px-4 py-8 font-body text-[14px] text-muted">
          No orders match this filter.
        </p>
      )}

      <div className="relative min-w-0">
        {fetching ? <BusyOverlay label="Loading orders…" /> : null}
        <div className="grid min-w-0 gap-3 xl:hidden">
          {rows.map((row) => (
            <OrderCard key={row.id} row={row} />
          ))}
        </div>

        <div className="hidden overflow-x-auto rounded-lg border border-line bg-white xl:block">
          <div className="min-w-[980px]">
            <div className="flex gap-3 bg-canvas px-4 py-2.5 font-display text-[11px] font-bold uppercase tracking-wide text-muted">
              <p className="min-w-0 flex-1">Order</p>
              <p className="w-[160px] shrink-0">Customer</p>
              <p className="w-[120px] shrink-0">Date</p>
              <p className="w-[100px] shrink-0 text-right">Total</p>
              <p className="w-[120px] shrink-0">Status</p>
              <p className="w-[56px] shrink-0 text-right">View</p>
            </div>
            {rows.map((row) => (
              <div key={row.id} className="flex items-center gap-3 border-t border-line px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[14px] font-bold text-navy">{row.orderNumber}</p>
                  <p className="truncate font-body text-[13px] text-muted">{orderItemSummary(row.items)}</p>
                </div>
                <p className="w-[160px] shrink-0 truncate font-body text-[13px]">{row.name || '—'}</p>
                <p className="w-[120px] shrink-0 font-body text-[13px] text-muted">{formatOrderDate(row.createdAt)}</p>
                <p className="w-[100px] shrink-0 text-right font-display text-[13px] font-bold">{money(row.total)}</p>
                <div className="w-[120px] shrink-0">
                  <OrderStatusBadge status={row.status} />
                </div>
                <div className="flex w-[56px] shrink-0 justify-end">
                  <Link to={routes.order(row.id)} className={adminIconBtnClass()} aria-label={`View ${row.orderNumber}`}>
                    <IconEye />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {rows.length > 0 || pages > 1 ? (
        <Pagination
          page={page}
          pages={pages}
          total={data?.total ?? 0}
          showing={showing}
          onPage={setPage}
          disabled={query.isFetching}
        />
      ) : null}
    </section>
  );
}

function OrderCard({ row }: { row: Order }) {
  return (
    <article className="min-w-0 rounded-lg border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-display text-[15px] font-bold text-navy">{row.orderNumber}</h3>
          <p className="truncate font-body text-[13px] text-muted">{row.name || 'Guest'}</p>
          <p className="truncate font-body text-[13px] text-muted">{orderItemSummary(row.items)}</p>
        </div>
        <OrderStatusBadge status={row.status} />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <p className="font-body text-[13px] text-muted">{formatOrderDate(row.createdAt)}</p>
        <p className="font-display text-[13px] font-bold">{money(row.total)}</p>
      </div>
      <Link to={routes.order(row.id)} className={`${adminCardActionClass('primary')} mt-3`}>
        View order
      </Link>
    </article>
  );
}
