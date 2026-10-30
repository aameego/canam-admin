import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BusyOverlay, { BusyLabel } from '../components/BusyOverlay.tsx';
import { ProductStatusBadge } from '../components/StatusBadge.tsx';
import { useDeleteProduct, useDuplicateProduct, useProduct, useUpdateProductStatus } from '../hooks/useProducts.ts';
import { money } from '../lib/customers.ts';
import { getErrorMessage } from '../lib/getErrorMessage.ts';
import { routes } from '../routes.ts';
import type { ProductStatus } from '../types/api.ts';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const query = useProduct(id);
  const updateStatus = useUpdateProductStatus();
  const duplicate = useDuplicateProduct();
  const remove = useDeleteProduct();
  const [error, setError] = useState('');
  const product = query.data;

  const onStatus = async (status: ProductStatus) => {
    if (!id) return;
    setError('');
    try {
      await updateStatus.mutateAsync({ id, status });
      await query.refetch();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update status.'));
    }
  };

  const onDuplicate = async () => {
    if (!id) return;
    setError('');
    try {
      const res = await duplicate.mutateAsync(id);
      navigate(routes.productEdit(res.data.item.id));
    } catch (err) {
      setError(getErrorMessage(err, 'Could not duplicate this product.'));
    }
  };

  const onDelete = async () => {
    if (!id || !product) return;
    if (!window.confirm(`Delete ${product.title}? This cannot be undone.`)) return;
    setError('');
    try {
      await remove.mutateAsync(id);
      navigate(routes.products);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not delete this product.'));
    }
  };

  const busy = updateStatus.isPending || duplicate.isPending || remove.isPending;

  if (query.isLoading) {
    return (
      <div className="relative min-h-48 rounded-lg border border-line bg-white">
        <BusyOverlay label="Loading product…" />
      </div>
    );
  }
  if (query.isError || !product) {
    return (
      <p className="font-body text-[14px] text-canam-red" role="alert">
        {getErrorMessage(query.error, 'Product not found.')}
      </p>
    );
  }

  return (
    <section className="flex min-w-0 flex-col gap-6">
      <button type="button" className="self-start font-display text-[13px] font-bold text-navy" onClick={() => navigate(routes.products)}>
        ← Products
      </button>
      {error && (
        <p className="font-body text-[13px] text-canam-red" role="alert">
          {error}
        </p>
      )}
      <div className="rounded-lg border border-line bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            {product.image ? (
              <img src={product.image} alt="" className="size-24 shrink-0 rounded object-cover" />
            ) : (
              <div className="size-24 shrink-0 rounded bg-canvas" />
            )}
            <div className="min-w-0">
              <h2 className="break-words font-display text-[20px] font-extrabold text-navy sm:text-[22px]">{product.title}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <ProductStatusBadge status={product.status} />
                <span className="font-body text-[13px] text-muted">{product.sku}</span>
              </div>
              <p className="mt-2 font-body text-[14px] text-muted">{product.categoryName}</p>
              <p className="mt-2 font-display text-[18px] font-extrabold text-navy">{money(product.price)}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Link
              to={routes.productEdit(product.id)}
              className="flex h-11 items-center justify-center rounded-[6px] border border-navy px-4 font-display text-[13px] font-bold text-navy"
            >
              Edit product
            </Link>
            <button
              type="button"
              className="h-11 rounded-[6px] border border-line px-4 font-display text-[13px] font-bold text-navy disabled:opacity-70"
              onClick={() => void onDuplicate()}
              disabled={busy}
            >
              <BusyLabel pending={duplicate.isPending} pendingLabel="Duplicating…" idle="Duplicate" />
            </button>
            {product.status !== 'active' ? (
              <button
                type="button"
                className="h-11 rounded-[6px] bg-navy px-4 font-display text-[13px] font-bold text-white disabled:opacity-70"
                onClick={() => void onStatus('active')}
                disabled={busy}
              >
                <BusyLabel pending={updateStatus.isPending} pendingLabel="Publishing…" idle="Publish" />
              </button>
            ) : (
              <button
                type="button"
                className="h-11 rounded-[6px] border border-line px-4 font-display text-[13px] font-bold text-navy disabled:opacity-70"
                onClick={() => void onStatus('inactive')}
                disabled={busy}
              >
                <BusyLabel pending={updateStatus.isPending} pendingLabel="Updating…" idle="Unpublish" />
              </button>
            )}
            <button
              type="button"
              className="h-11 rounded-[6px] border border-canam-red px-4 font-display text-[13px] font-bold text-canam-red disabled:opacity-70"
              onClick={() => void onDelete()}
              disabled={busy}
            >
              <BusyLabel pending={remove.isPending} pendingLabel="Deleting…" idle="Delete" />
            </button>
          </div>
        </div>
        {product.description && (
          <p className="mt-6 border-t border-line pt-6 font-body text-[14px]">{product.description}</p>
        )}
        <dl className="mt-6 grid gap-4 border-t border-line pt-6 sm:grid-cols-2 lg:grid-cols-3">
          <Fact label="Specs" value={product.specs || '—'} />
          <Fact label="Pack size" value={product.packSize || '—'} />
          <Fact label="Pieces / carton" value={product.piecesPerCarton ?? '—'} />
          <Fact label="Carton price" value={product.priceCarton == null ? '—' : money(product.priceCarton)} />
          <Fact label="Unit price" value={product.priceUnit == null ? '—' : money(product.priceUnit)} />
          <Fact label="MOQ" value={product.moq ?? '—'} />
          <Fact label="Material" value={product.material || '—'} />
          <Fact label="Dimension" value={product.dimension || '—'} />
          <Fact label="Custom branding" value={product.customBranding ? 'Yes' : 'No'} />
        </dl>
        {product.bulkTiers.length > 0 && (
          <div className="mt-6 border-t border-line pt-6">
            <h3 className="font-display text-[13px] font-bold uppercase text-muted">Bulk price tiers</h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {product.bulkTiers.map((tier, index) => (
                <li key={`${tier.minQty}-${tier.maxQty ?? 'open'}-${index}`} className="rounded-[6px] border border-line px-3 py-2">
                  <p className="font-display text-[13px] font-bold text-navy">
                    Qty {tier.minQty}
                    {tier.maxQty == null ? '+' : `–${tier.maxQty}`}
                  </p>
                  <p className="font-body text-[13px] text-muted">{money(tier.unitPrice)} / unit</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="font-display text-[11px] font-bold uppercase text-muted">{label}</dt>
      <dd className="mt-1 break-words font-body text-[14px]">{value}</dd>
    </div>
  );
}
