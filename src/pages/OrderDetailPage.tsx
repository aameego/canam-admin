import { useEffect, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BusyOverlay, { BusyLabel } from '../components/BusyOverlay.tsx';
import { OrderStatusBadge } from '../components/StatusBadge.tsx';
import { useOrder, useUpdateOrder } from '../hooks/useOrders.ts';
import { money } from '../lib/customers.ts';
import { getErrorMessage } from '../lib/getErrorMessage.ts';
import { ORDER_NOTES_MAX, ORDER_STATUSES, formatOrderDate, isOrderDirty, orderTotals, validateOrderUpdate } from '../lib/orders.ts';
import { routes } from '../routes.ts';
import type { OrderStatus } from '../types/api.ts';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const query = useOrder(id);
  const update = useUpdateOrder();
  const [error, setError] = useState('');
  const [status, setStatus] = useState<OrderStatus>('pending');
  const [notes, setNotes] = useState('');
  const order = query.data;

  useEffect(() => {
    if (!order) return;
    setStatus(order.status);
    setNotes(order.notes || '');
  }, [order]);

  const onSave = async () => {
    if (!id) return;
    setError('');
    const parsed = validateOrderUpdate(status, notes);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    try {
      await update.mutateAsync({ id, body: parsed.body });
      await query.refetch();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update this order.'));
    }
  };

  if (query.isLoading) {
    return (
      <div className="relative min-h-48 rounded-lg border border-line bg-white">
        <BusyOverlay label="Loading order…" />
      </div>
    );
  }
  if (query.isError || !order) {
    return (
      <p className="font-body text-[14px] text-canam-red" role="alert">
        {getErrorMessage(query.error, 'Order not found.')}
      </p>
    );
  }

  const dirty = isOrderDirty(
    { status: order.status, notes: order.notes || '' },
    { status, notes },
  );

  return (
    <section className="flex min-w-0 flex-col gap-6">
      <button type="button" className="self-start font-display text-[13px] font-bold text-navy" onClick={() => navigate(routes.orders)}>
        ← Orders
      </button>
      {error && (
        <p className="font-body text-[13px] text-canam-red" role="alert">
          {error}
        </p>
      )}
      <div className="rounded-lg border border-line bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h2 className="break-words font-display text-[20px] font-extrabold text-navy sm:text-[22px]">{order.orderNumber}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <OrderStatusBadge status={order.status} />
              <span className="font-body text-[13px] text-muted">{formatOrderDate(order.createdAt)}</span>
            </div>
            <p className="mt-2 font-display text-[18px] font-extrabold text-navy">{money(order.total)}</p>
          </div>
          <div className="grid min-w-[240px] gap-2">
            <label className="grid gap-1">
              <span className="font-display text-[11px] font-bold uppercase text-muted">Status</span>
              <select
                className="h-11 rounded-[6px] border border-line bg-white px-3 font-body text-[13px] text-navy"
                value={status}
                onChange={(event) => setStatus(event.target.value as OrderStatus)}
              >
                {ORDER_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="h-11 rounded-[6px] bg-navy px-4 font-display text-[13px] font-bold text-white disabled:opacity-70"
              onClick={() => void onSave()}
              disabled={update.isPending || !dirty}
            >
              <BusyLabel pending={update.isPending} pendingLabel="Saving…" idle="Save changes" />
            </button>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 border-t border-line pt-6 sm:grid-cols-2 lg:grid-cols-3">
          <Fact label="Customer" value={order.name || '—'}>
            {order.customerId ? (
              <Link to={routes.customer(order.customerId)} className="mt-1 inline-block font-display text-[13px] font-bold text-navy">
                Open customer
              </Link>
            ) : null}
          </Fact>
          <Fact label="Email" value={order.email || '—'} />
          <Fact label="Phone" value={order.phone || '—'} />
          <Fact label="Payment" value={order.paymentMethod || 'COD'} />
          <Fact label="Coupon" value={order.couponCode || '—'} />
          <Fact label="Source" value={order.source || '—'} />
          <Fact label="Items" value={String(order.itemCount)} />
        </dl>

        <label className="mt-6 grid gap-2 border-t border-line pt-6">
          <span className="font-display text-[11px] font-bold uppercase text-muted">Internal notes</span>
          <textarea
            className="min-h-24 rounded-[6px] border border-line bg-white px-3 py-2 font-body text-[14px] text-ink outline-none"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={ORDER_NOTES_MAX}
          />
        </label>

        <div className="mt-6 border-t border-line pt-6">
          <h3 className="font-display text-[13px] font-bold uppercase text-muted">Line items</h3>
          <ul className="mt-3 grid gap-2">
            {order.items.map((item, index) => (
              <li key={`${item.productId}-${index}`} className="flex flex-col gap-1 rounded-[6px] border border-line px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-display text-[14px] font-bold text-navy">{item.productName || item.sku || item.productId}</p>
                  <p className="font-body text-[13px] text-muted">
                    {item.sku || '—'} · Qty {item.quantity}
                    {item.isCustomBranding ? ' · Custom branding' : ''}
                  </p>
                  {item.brandingText ? <p className="font-body text-[13px] text-muted">{item.brandingText}</p> : null}
                </div>
                <p className="font-display text-[13px] font-bold">{money(item.lineTotal)}</p>
              </li>
            ))}
          </ul>
        </div>

        <dl className="mt-6 grid gap-2 border-t border-line pt-6 sm:max-w-sm sm:ml-auto">
          {orderTotals(order).map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4">
              <dt className="font-display text-[12px] font-bold uppercase text-muted">{row.label}</dt>
              <dd className="font-display text-[14px] font-bold text-navy">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Fact({ label, value, children }: { label: string; value: string; children?: ReactNode }) {
  return (
    <div>
      <dt className="font-display text-[11px] font-bold uppercase text-muted">{label}</dt>
      <dd className="mt-1 break-words font-body text-[14px]">{value}</dd>
      {children}
    </div>
  );
}
