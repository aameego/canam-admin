import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import BusyOverlay, { BusyLabel } from '../components/BusyOverlay.tsx';
import Pagination from '../components/Pagination.tsx';
import { ProductStatusBadge } from '../components/StatusBadge.tsx';
import { IconCopy, IconDownload, IconEye, IconPencil, IconSearch, IconSpinner, IconTrash } from '../components/icons.tsx';
import {
  useCategories,
  useDeleteProduct,
  useDuplicateProduct,
  useExportProducts,
  useProducts,
} from '../hooks/useProducts.ts';
import { adminCardActionClass, adminFilterChipClass, adminIconBtnClass } from '../lib/adminChrome.ts';
import { downloadBlob, money } from '../lib/customers.ts';
import { getErrorMessage } from '../lib/getErrorMessage.ts';
import { applyListFilter, applyListPage, applyListSearch, parsePageParam, parseProductStatusFilter } from '../lib/listQuery.ts';
import { scrollAdminContentToTop } from '../lib/pagination.ts';
import { PRODUCT_STATUS_FILTERS } from '../lib/products.ts';
import { routes } from '../routes.ts';
import type { Product } from '../types/api.ts';

export default function ProductsPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const status = parseProductStatusFilter(params.get('status'));
  const page = parsePageParam(params.get('page'));
  const qParam = params.get('q') || '';
  const categoryId = params.get('categoryId') || '';
  const [search, setSearch] = useState(qParam);
  const [error, setError] = useState('');
  const [busyRow, setBusyRow] = useState<{ id: string; action: 'duplicate' | 'delete' } | null>(null);

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

  const query = useProducts({
    q: qParam || undefined,
    status,
    page,
    categoryId: categoryId || undefined,
  });
  const categories = useCategories();
  const exporter = useExportProducts();
  const duplicate = useDuplicateProduct();
  const remove = useDeleteProduct();
  const data = query.data;
  const counts = data?.counts ?? { all: 0, active: 0, inactive: 0, draft: 0 };
  const rows = data?.items ?? [];
  const pages = data?.pages ?? 1;
  const showing = useMemo(() => rows.length, [rows.length]);

  const setFilter = (key: string, value: string) => {
    setParams(applyListFilter(params, key, value));
  };

  const setPage = (nextPage: number) => {
    setParams(applyListPage(params, nextPage));
    scrollAdminContentToTop();
  };

  const onExport = async () => {
    setError('');
    try {
      const blob = await exporter.mutateAsync({
        q: qParam || undefined,
        status,
        categoryId: categoryId || undefined,
      });
      downloadBlob(blob, 'products.csv');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not export products.'));
    }
  };

  const onDuplicate = async (id: string) => {
    setError('');
    setBusyRow({ id, action: 'duplicate' });
    try {
      const res = await duplicate.mutateAsync(id);
      navigate(routes.productEdit(res.data.item.id));
    } catch (err) {
      setError(getErrorMessage(err, 'Could not duplicate this product.'));
    } finally {
      setBusyRow(null);
    }
  };

  const onDelete = async (row: Product) => {
    if (!window.confirm(`Delete ${row.title}? This cannot be undone.`)) return;
    setError('');
    setBusyRow({ id: row.id, action: 'delete' });
    try {
      await remove.mutateAsync(row.id);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not delete this product.'));
    } finally {
      setBusyRow(null);
    }
  };

  const fetching = query.isFetching && !query.isLoading;

  return (
    <section className="flex min-w-0 flex-col gap-4 lg:gap-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <label className="flex h-11 w-full items-center gap-2 rounded-[6px] border border-line bg-white px-3 xl:w-[280px] xl:bg-canvas">
          <IconSearch className="size-[18px] shrink-0 text-muted" />
          <input
            className="w-full min-w-0 bg-transparent font-body text-[13px] text-ink outline-none placeholder:text-muted"
            placeholder="Search name or SKU..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button
            type="button"
            className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[6px] border border-navy px-3 font-display text-[13px] font-bold text-navy transition-colors hover:bg-navy hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => void onExport()}
            disabled={exporter.isPending}
          >
            {exporter.isPending ? null : <IconDownload />}
            <BusyLabel pending={exporter.isPending} pendingLabel="Exporting…" idle="Export CSV" />
          </button>
          <Link
            to={routes.categories}
            className="flex h-11 cursor-pointer items-center justify-center rounded-[6px] border border-line bg-white px-3 font-display text-[13px] font-bold text-navy transition-colors hover:border-navy hover:bg-navy hover:text-white"
          >
            Categories
          </Link>
          <Link
            to={routes.productNew}
            className="col-span-2 flex h-11 cursor-pointer items-center justify-center rounded-[6px] bg-canam-red px-3 font-display text-[13px] font-bold text-white transition-colors hover:bg-canam-red/90 sm:col-span-1"
          >
            + Add product
          </Link>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative min-w-0">
          <div className="chip-scroller -mx-1 flex gap-2 overflow-x-auto px-1">
            {PRODUCT_STATUS_FILTERS.map((filter) => {
              const active = status === filter.id;
              const count = counts[filter.id];
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setFilter('status', filter.id)}
                  className={adminFilterChipClass(active)}
                >
                  {filter.label} ({count})
                </button>
              );
            })}
          </div>
        </div>
        <select
          className="h-11 rounded-[6px] border border-line bg-white px-3 font-body text-[13px] text-navy"
          value={categoryId}
          onChange={(event) => setFilter('categoryId', event.target.value)}
        >
          <option value="">All categories</option>
          {(categories.data ?? []).map((category) => (
            <option key={category.id} value={category.id}>
              {category.name} ({category.count ?? 0})
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="font-body text-[13px] text-canam-red" role="alert">
          {error}
        </p>
      )}
      {query.isError && (
        <p className="font-body text-[13px] text-canam-red" role="alert">
          {getErrorMessage(query.error, 'Could not load products.')}
        </p>
      )}
      {query.isLoading && rows.length === 0 && (
        <div className="relative min-h-48 rounded-lg border border-line bg-white">
          <BusyOverlay label="Loading products…" />
        </div>
      )}
      {!query.isLoading && rows.length === 0 && (
        <p className="rounded-lg border border-line bg-white px-4 py-8 font-body text-[14px] text-muted">
          No products match this filter. Seed the catalog or add a product.
        </p>
      )}

      <div className="relative min-w-0">
        {fetching ? <BusyOverlay label="Loading products…" /> : null}
      <div className="grid min-w-0 gap-3 xl:hidden">
        {rows.map((row) => (
          <article key={row.id} className="min-w-0 rounded-lg border border-line bg-white p-4">
            <div className="flex items-start gap-3">
              {row.image ? (
                <img src={row.image} alt="" className="size-14 shrink-0 rounded object-cover" />
              ) : (
                <div className="size-14 shrink-0 rounded bg-canvas" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="truncate font-display text-[15px] font-bold text-navy">{row.title}</h3>
                  <ProductStatusBadge status={row.status} />
                </div>
                <p className="truncate font-body text-[13px] text-muted">{row.sku}</p>
                <p className="truncate font-body text-[13px] text-muted">{row.categoryName}</p>
                <p className="mt-1 font-display text-[13px] font-bold">{money(row.price)}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link to={routes.product(row.id)} className={adminCardActionClass('primary')}>
                View
              </Link>
              <Link to={routes.productEdit(row.id)} className={adminCardActionClass()}>
                Edit
              </Link>
              <button
                type="button"
                className={adminCardActionClass()}
                disabled={busyRow?.id === row.id}
                onClick={() => void onDuplicate(row.id)}
              >
                <BusyLabel
                  pending={busyRow?.id === row.id && busyRow.action === 'duplicate'}
                  pendingLabel="Duplicating…"
                  idle="Duplicate"
                />
              </button>
              <button
                type="button"
                className={adminCardActionClass('danger')}
                disabled={busyRow?.id === row.id}
                onClick={() => void onDelete(row)}
              >
                <BusyLabel
                  pending={busyRow?.id === row.id && busyRow.action === 'delete'}
                  pendingLabel="Deleting…"
                  idle="Delete"
                />
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-line bg-white xl:block">
        <div className="min-w-[980px]">
          <div className="flex gap-3 bg-canvas px-4 py-2.5 font-display text-[11px] font-bold uppercase tracking-wide text-muted">
            <p className="min-w-0 flex-1">Product</p>
            <p className="w-[140px] shrink-0">SKU</p>
            <p className="w-[180px] shrink-0">Category</p>
            <p className="w-[100px] shrink-0 text-right">Price</p>
            <p className="w-[110px] shrink-0">Status</p>
            <p className="w-[168px] shrink-0 text-right">Actions</p>
          </div>
          {rows.map((row) => (
            <div key={row.id} className="flex items-center gap-3 border-t border-line px-4 py-3">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {row.image ? (
                  <img src={row.image} alt="" className="size-10 shrink-0 rounded object-cover" />
                ) : (
                  <div className="size-10 shrink-0 rounded bg-canvas" />
                )}
                <p className="truncate font-display text-[14px] font-bold text-navy">{row.title}</p>
              </div>
              <p className="w-[140px] shrink-0 truncate font-body text-[13px] text-muted">{row.sku}</p>
              <p className="w-[180px] shrink-0 truncate font-body text-[14px]">{row.categoryName}</p>
              <p className="w-[100px] shrink-0 text-right font-display text-[13px] font-bold">{money(row.price)}</p>
              <div className="w-[110px] shrink-0">
                <ProductStatusBadge status={row.status} />
              </div>
              <div className="flex w-[168px] shrink-0 justify-end gap-2">
                <Link to={routes.product(row.id)} className={adminIconBtnClass()} aria-label={`View ${row.title}`}>
                  <IconEye />
                </Link>
                <Link to={routes.productEdit(row.id)} className={adminIconBtnClass()} aria-label={`Edit ${row.title}`}>
                  <IconPencil />
                </Link>
                <button
                  type="button"
                  className={adminIconBtnClass()}
                  aria-label={`Duplicate ${row.title}`}
                  disabled={busyRow?.id === row.id}
                  onClick={() => void onDuplicate(row.id)}
                >
                  {busyRow?.id === row.id && busyRow.action === 'duplicate' ? <IconSpinner /> : <IconCopy />}
                </button>
                <button
                  type="button"
                  className={adminIconBtnClass('danger')}
                  aria-label={`Delete ${row.title}`}
                  disabled={busyRow?.id === row.id}
                  onClick={() => void onDelete(row)}
                >
                  {busyRow?.id === row.id && busyRow.action === 'delete' ? <IconSpinner /> : <IconTrash />}
                </button>
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

