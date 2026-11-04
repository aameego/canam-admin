import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import BusyOverlay from '../components/BusyOverlay.tsx';
import Pagination from '../components/Pagination.tsx';
import { CouponStatusBadge } from '../components/StatusBadge.tsx';
import { IconEye, IconPencil, IconSearch } from '../components/icons.tsx';
import { useCoupons } from '../hooks/useCoupons.ts';
import { adminCardActionClass, adminFilterChipClass, adminIconBtnClass } from '../lib/adminChrome.ts';
import { COUPON_STATUS_FILTERS, formatCouponValue } from '../lib/coupons.ts';
import { getErrorMessage } from '../lib/getErrorMessage.ts';
import { applyListFilter, applyListPage, applyListSearch, parseCouponStatusFilter, parsePageParam } from '../lib/listQuery.ts';
import { scrollAdminContentToTop } from '../lib/pagination.ts';
import { routes } from '../routes.ts';
import { useCan } from '../hooks/useAuth.ts';
import type { Coupon } from '../types/api.ts';

export default function CouponsPage() {
  const can = useCan();
  const [params, setParams] = useSearchParams();
  const status = parseCouponStatusFilter(params.get('status'));
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

  const query = useCoupons({ q: qParam || undefined, status, page });
  const data = query.data;
  const counts = data?.counts ?? { all: 0, active: 0, inactive: 0 };
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
        <label className="flex h-11 w-full items-center gap-2 rounded-[6px] border border-line bg-white px-3 xl:w-[280px] xl:bg-canvas">
          <IconSearch className="size-[18px] shrink-0 text-muted" />
          <input
            className="w-full min-w-0 bg-transparent font-body text-[13px] text-ink outline-none placeholder:text-muted"
            placeholder="Search coupon code…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        {can('coupons.create') && <Link
          to={routes.couponNew}
          className="flex h-11 cursor-pointer items-center justify-center rounded-[6px] bg-canam-red px-4 font-display text-[13px] font-bold text-white hover:bg-canam-red/90"
        >
          + Add coupon
        </Link>}
      </div>

      <div className="chip-scroller -mx-1 flex gap-2 overflow-x-auto px-1">
        {COUPON_STATUS_FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setFilter(filter.id)}
            className={adminFilterChipClass(status === filter.id)}
          >
            {filter.label} ({counts[filter.id]})
          </button>
        ))}
      </div>

      {query.isError && (
        <p className="font-body text-[13px] text-canam-red" role="alert">
          {getErrorMessage(query.error, 'Could not load coupons.')}
        </p>
      )}
      {query.isLoading && rows.length === 0 && (
        <div className="relative min-h-48 rounded-lg border border-line bg-white">
          <BusyOverlay label="Loading coupons…" />
        </div>
      )}
      {!query.isLoading && rows.length === 0 && (
        <p className="rounded-lg border border-line bg-white px-4 py-8 font-body text-[14px] text-muted">
          No coupons match this filter.
        </p>
      )}

      <div className="relative min-w-0">
        {fetching ? <BusyOverlay label="Loading coupons…" /> : null}
        <div className="grid min-w-0 gap-3 xl:hidden">
          {rows.map((row) => (
            <CouponCard key={row.id} row={row} />
          ))}
        </div>
        <div className="hidden overflow-x-auto rounded-lg border border-line bg-white xl:block">
          <div className="min-w-[900px]">
            <div className="flex gap-3 bg-canvas px-4 py-2.5 font-display text-[11px] font-bold uppercase tracking-wide text-muted">
              <p className="min-w-0 flex-1">Code</p>
              <p className="w-[120px] shrink-0">Value</p>
              <p className="w-[120px] shrink-0">Uses</p>
              <p className="w-[110px] shrink-0">Status</p>
              <p className="w-[96px] shrink-0 text-right">Actions</p>
            </div>
            {rows.map((row) => (
              <div key={row.id} className="flex items-center gap-3 border-t border-line px-4 py-3">
                <p className="min-w-0 flex-1 truncate font-display text-[14px] font-bold text-navy">{row.code}</p>
                <p className="w-[120px] shrink-0 font-body text-[13px]">{formatCouponValue(row)}</p>
                <p className="w-[120px] shrink-0 font-body text-[13px] text-muted">
                  {row.usedCount}
                  {row.usageLimit == null ? '' : ` / ${row.usageLimit}`}
                </p>
                <div className="w-[110px] shrink-0">
                  <CouponStatusBadge isActive={row.isActive} />
                </div>
                <div className="flex w-[96px] shrink-0 justify-end gap-2">
                  <Link to={routes.coupon(row.id)} className={adminIconBtnClass()} aria-label={`View ${row.code}`}>
                    <IconEye />
                  </Link>
                  {can('coupons.edit') && <Link to={routes.couponEdit(row.id)} className={adminIconBtnClass()} aria-label={`Edit ${row.code}`}>
                    <IconPencil />
                  </Link>}
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

function CouponCard({ row }: { row: Coupon }) {
  const can = useCan();
  return (
    <article className="min-w-0 rounded-lg border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-display text-[15px] font-bold text-navy">{row.code}</h3>
          <p className="font-body text-[13px] text-muted">{formatCouponValue(row)}</p>
        </div>
        <CouponStatusBadge isActive={row.isActive} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link to={routes.coupon(row.id)} className={adminCardActionClass('primary')}>
          View
        </Link>
        {can('coupons.edit') && <Link to={routes.couponEdit(row.id)} className={adminCardActionClass()}>
          Edit
        </Link>}
      </div>
    </article>
  );
}
