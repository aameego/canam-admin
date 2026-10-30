import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import BusyOverlay, { BusyLabel } from '../components/BusyOverlay.tsx';
import Pagination from '../components/Pagination.tsx';
import StatusBadge from '../components/StatusBadge.tsx';
import { IconDownload, IconEye, IconMore, IconPencil, IconSearch } from '../components/icons.tsx';
import { useCustomers, useExportCustomers, useUpdateCustomerStatus } from '../hooks/useCustomers.ts';
import { adminCardActionClass, adminFilterChipClass, adminIconBtnClass } from '../lib/adminChrome.ts';
import { CUSTOMER_STATUS_FILTERS, downloadBlob } from '../lib/customers.ts';
import { getErrorMessage } from '../lib/getErrorMessage.ts';
import {
  applyListFilter,
  applyListPage,
  applyListSearch,
  parseAccountStatusFilter,
  parsePageParam,
  parseRangeFilter,
} from '../lib/listQuery.ts';
import { scrollAdminContentToTop } from '../lib/pagination.ts';
import { routes } from '../routes.ts';
import type { AccountStatus, CustomerListItem } from '../types/api.ts';

export default function CustomersPage() {
  const [params, setParams] = useSearchParams();
  const status = parseAccountStatusFilter(params.get('status'));
  const page = parsePageParam(params.get('page'));
  const qParam = params.get('q') || '';
  const range = parseRangeFilter(params.get('range'));
  const [search, setSearch] = useState(qParam);
  const [menuId, setMenuId] = useState('');
  const [error, setError] = useState('');

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

  const query = useCustomers({
    q: qParam || undefined,
    status,
    page,
    range: range || undefined,
  });
  const updateStatus = useUpdateCustomerStatus();
  const exporter = useExportCustomers();
  const data = query.data;
  const counts = data?.counts ?? { all: 0, approved: 0, pending: 0, rejected: 0 };
  const isPendingView = status === 'pending';

  const setFilter = (nextStatus: AccountStatus | 'all') => {
    setParams(applyListFilter(params, 'status', nextStatus));
  };

  const setPage = (nextPage: number) => {
    setParams(applyListPage(params, nextPage));
    scrollAdminContentToTop();
  };

  const onStatus = async (id: string, accountStatus: AccountStatus) => {
    setError('');
    setMenuId('');
    try {
      await updateStatus.mutateAsync({ id, accountStatus });
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update this customer.'));
    }
  };

  const onExport = async () => {
    setError('');
    try {
      const blob = await exporter.mutateAsync({
        q: qParam || undefined,
        status,
        range: range || undefined,
      });
      downloadBlob(blob, 'customers.csv');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not export customers.'));
    }
  };

  const rows = data?.items ?? [];
  const pages = data?.pages ?? 1;
  const showing = useMemo(() => rows.length, [rows.length]);
  const fetching = query.isFetching && !query.isLoading;

  return (
    <section className="flex min-w-0 flex-col gap-4 lg:gap-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <label className="flex h-11 w-full items-center gap-2 rounded-[6px] border border-line bg-white px-3 xl:w-[280px] xl:bg-canvas">
          <IconSearch className="size-[18px] shrink-0 text-muted" />
          <input
            className="w-full min-w-0 bg-transparent font-body text-[13px] text-ink outline-none placeholder:text-muted"
            placeholder="Search business or contact..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto">
          <button
            type="button"
            className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[6px] border border-navy px-3 font-display text-[13px] font-bold text-navy transition-colors hover:bg-navy hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => void onExport()}
            disabled={exporter.isPending}
          >
            {exporter.isPending ? null : <IconDownload />}
            <BusyLabel
              pending={exporter.isPending}
              pendingLabel="Exporting…"
              idle="Export Customers"
            />
          </button>
          <Link
            to={routes.customerNew}
            className="flex h-11 cursor-pointer items-center justify-center rounded-[6px] bg-canam-red px-3 font-display text-[13px] font-bold text-white transition-colors hover:bg-canam-red/90"
          >
            <span className="sm:hidden">+ Add</span>
            <span className="hidden sm:inline">+ Add customers</span>
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0">
          <div className="chip-scroller -mx-1 flex gap-2 overflow-x-auto px-1">
            {CUSTOMER_STATUS_FILTERS.map((filter) => {
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
        {isPendingView && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="cursor-pointer rounded-[6px] border border-line bg-white px-3 py-2 font-body text-[13px] text-navy transition-colors hover:border-navy hover:bg-canvas"
              onClick={() => {
                setParams(applyListFilter(params, 'range', range === '30d' ? '' : '30d'));
              }}
            >
              {range === '30d' ? 'Last 30 Days' : 'All time'}
            </button>
            <span className="font-display text-[13px] font-bold text-[#10b981]">{counts.pending} pending</span>
          </div>
        )}
      </div>

      {error && (
        <p className="font-body text-[13px] text-canam-red" role="alert">
          {error}
        </p>
      )}
      {query.isError && (
        <p className="font-body text-[13px] text-canam-red" role="alert">
          {getErrorMessage(query.error, 'Could not load customers.')}
        </p>
      )}

      {query.isLoading && rows.length === 0 && (
        <div className="relative min-h-48 rounded-lg border border-line bg-white">
          <BusyOverlay label="Loading customers…" />
        </div>
      )}
      {!query.isLoading && rows.length === 0 && (
        <p className="rounded-lg border border-line bg-white px-4 py-8 font-body text-[14px] text-muted">
          No customers match this filter.
        </p>
      )}

      <div className="relative min-w-0">
        {fetching ? <BusyOverlay label="Loading customers…" /> : null}
      <div className="grid min-w-0 gap-3 xl:hidden">
        {rows.map((row) =>
          isPendingView ? (
            <PendingCard key={row.id} row={row} onApprove={() => void onStatus(row.id, 'approved')} />
          ) : (
            <CustomerCard
              key={row.id}
              row={row}
              menuOpen={menuId === row.id}
              onToggleMenu={() => setMenuId((id) => (id === row.id ? '' : row.id))}
              onApprove={() => void onStatus(row.id, 'approved')}
              onReject={() => void onStatus(row.id, 'rejected')}
            />
          )
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-line bg-white xl:block">
        <div className={isPendingView ? 'min-w-[1120px]' : 'min-w-[1040px]'}>
        <div className="flex gap-3 bg-canvas px-4 py-2.5 font-display text-[11px] font-bold uppercase tracking-wide text-muted">
          <p className="min-w-0 flex-1">Business name</p>
          <p className="w-[160px] shrink-0">{isPendingView ? 'Contact name' : 'Contact'}</p>
          {isPendingView ? (
            <>
              <p className="w-[180px] shrink-0">Email</p>
              <p className="w-[130px] shrink-0">Phone</p>
              <p className="w-[120px] shrink-0">Submitted date</p>
              <p className="w-[220px] shrink-0 text-right">Actions</p>
            </>
          ) : (
            <>
              <p className="w-[110px] shrink-0">Status</p>
              <p className="w-[180px] shrink-0">Email</p>
              <p className="w-[110px] shrink-0 text-right">Orders count</p>
              <p className="w-[150px] shrink-0 text-right">Actions</p>
            </>
          )}
        </div>
        {rows.map((row) =>
          isPendingView ? (
            <PendingRow key={row.id} row={row} onApprove={() => void onStatus(row.id, 'approved')} />
          ) : (
            <CustomerRow
              key={row.id}
              row={row}
              menuOpen={menuId === row.id}
              onToggleMenu={() => setMenuId((id) => (id === row.id ? '' : row.id))}
              onApprove={() => void onStatus(row.id, 'approved')}
              onReject={() => void onStatus(row.id, 'rejected')}
            />
          )
        )}
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


function CustomerCard({
  row,
  menuOpen,
  onToggleMenu,
  onApprove,
  onReject,
}: {
  row: CustomerListItem;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <article className="min-w-0 rounded-lg border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-[15px] font-bold text-navy">{row.businessName || '—'}</h3>
          <p className="mt-0.5 truncate font-body text-[14px]">{row.contactShort || row.contactName}</p>
          <p className="break-all font-body text-[13px] text-muted">{row.email}</p>
        </div>
        <StatusBadge status={row.accountStatus} />
      </div>
      <p className="mt-3 font-display text-[13px] font-bold text-ink">
        {row.orderCount} {row.orderCount === 1 ? 'order' : 'orders'}
      </p>
      <div className="relative mt-3 flex min-w-0 flex-col gap-2">
        <Link
          to={routes.customer(row.id)}
          className={adminCardActionClass('primary')}
          aria-label={`View ${row.businessName}`}
        >
          View
        </Link>
        <div className="grid min-w-0 grid-cols-2 gap-2">
        <Link
          to={routes.customerEdit(row.id)}
          className={adminCardActionClass()}
          aria-label={`Edit ${row.businessName}`}
        >
          Edit
        </Link>
        <button type="button" className={adminCardActionClass()} aria-label="More actions" onClick={onToggleMenu}>
          More
        </button>
        </div>
        {menuOpen && (
          <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-md border border-line bg-white py-1 shadow-sm">
            {row.accountStatus !== 'approved' && (
              <button
                type="button"
                className="w-full cursor-pointer px-3 py-2 text-left font-display text-[13px] font-bold text-navy hover:bg-canvas"
                onClick={onApprove}
              >
                Approve
              </button>
            )}
            {row.accountStatus !== 'rejected' && (
              <button
                type="button"
                className="w-full cursor-pointer px-3 py-2 text-left font-display text-[13px] font-bold text-canam-red hover:bg-canvas"
                onClick={onReject}
              >
                Block account
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function PendingCard({ row, onApprove }: { row: CustomerListItem; onApprove: () => void }) {
  return (
    <article className="min-w-0 rounded-lg border border-line bg-white p-4">
      <h3 className="break-all font-display text-[15px] font-bold text-navy">{row.businessName || '—'}</h3>
      <p className="mt-1 break-words font-body text-[14px]">{row.contactShort || row.contactName}</p>
      <p className="break-all font-body text-[13px] text-muted">{row.email}</p>
      <p className="mt-1 font-body text-[13px] text-muted">
        {row.phone} · {row.joinedLabel}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link
          to={routes.customer(row.id)}
          className={adminCardActionClass('primary')}
        >
          View
        </Link>
        <button
          type="button"
          className="h-11 cursor-pointer rounded-[6px] bg-[#10b981] px-3 font-display text-[13px] font-bold text-white transition-colors hover:bg-[#0ea371]"
          onClick={onApprove}
        >
          Approve
        </button>
      </div>
    </article>
  );
}

function CustomerRow({
  row,
  menuOpen,
  onToggleMenu,
  onApprove,
  onReject,
}: {
  row: CustomerListItem;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="flex items-center gap-3 border-t border-line px-4 py-3">
      <p className="min-w-0 flex-1 truncate font-display text-[14px] font-bold text-navy">{row.businessName || '—'}</p>
      <p className="w-[160px] shrink-0 font-body text-[14px]">{row.contactShort || row.contactName}</p>
      <div className="w-[110px] shrink-0">
        <StatusBadge status={row.accountStatus} />
      </div>
      <p className="w-[180px] shrink-0 truncate font-body text-[13px] text-muted">{row.email}</p>
      <p className="w-[110px] shrink-0 text-right font-display text-[13px] font-bold">
        {row.orderCount} {row.orderCount === 1 ? 'order' : 'orders'}
      </p>
      <div className="relative flex w-[150px] shrink-0 justify-end gap-2">
        <Link to={routes.customer(row.id)} className={adminIconBtnClass()} aria-label={`View ${row.businessName}`}>
          <IconEye />
        </Link>
        <Link to={routes.customerEdit(row.id)} className={adminIconBtnClass()} aria-label={`Edit ${row.businessName}`}>
          <IconPencil />
        </Link>
        <button type="button" className={adminIconBtnClass()} aria-label="More actions" onClick={onToggleMenu}>
          <IconMore />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-9 z-10 w-40 rounded-md border border-line bg-white py-1 shadow-sm">
            {row.accountStatus !== 'approved' && (
              <button
                type="button"
                className="w-full cursor-pointer px-3 py-2 text-left font-display text-[13px] font-bold text-navy hover:bg-canvas"
                onClick={onApprove}
              >
                Approve
              </button>
            )}
            {row.accountStatus !== 'rejected' && (
              <button
                type="button"
                className="w-full cursor-pointer px-3 py-2 text-left font-display text-[13px] font-bold text-canam-red hover:bg-canvas"
                onClick={onReject}
              >
                Block account
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PendingRow({ row, onApprove }: { row: CustomerListItem; onApprove: () => void }) {
  return (
    <div className="flex items-center gap-3 border-t border-line px-4 py-3">
      <p className="min-w-0 flex-1 truncate font-display text-[14px] font-bold text-navy">{row.businessName || '—'}</p>
      <p className="w-[160px] shrink-0 font-body text-[14px]">{row.contactShort || row.contactName}</p>
      <p className="w-[180px] shrink-0 truncate font-body text-[13px] text-muted">{row.email}</p>
      <p className="w-[130px] shrink-0 font-body text-[13px] text-muted">{row.phone}</p>
      <p className="w-[120px] shrink-0 font-body text-[13px] text-muted">{row.joinedLabel}</p>
      <div className="flex w-[220px] shrink-0 justify-end gap-2">
        <Link
          to={routes.customer(row.id)}
          className="cursor-pointer rounded-[6px] bg-navy px-3 py-2 font-display text-[13px] font-bold text-white transition-colors hover:bg-navy/90"
        >
          View Application
        </Link>
        <button
          type="button"
          className="cursor-pointer rounded-[6px] bg-[#10b981] px-3 py-2 font-display text-[13px] font-bold text-white transition-colors hover:bg-[#0ea371]"
          onClick={onApprove}
        >
          Approve
        </button>
      </div>
    </div>
  );
}
