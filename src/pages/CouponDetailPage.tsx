import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BusyOverlay, { BusyLabel } from '../components/BusyOverlay.tsx';
import { CouponStatusBadge } from '../components/StatusBadge.tsx';
import { useCoupon, useDeactivateCoupon, useUpdateCoupon } from '../hooks/useCoupons.ts';
import { money } from '../lib/customers.ts';
import { couponTypeLabel, formatCouponValue } from '../lib/coupons.ts';
import { getErrorMessage } from '../lib/getErrorMessage.ts';
import { formatOrderDate } from '../lib/orders.ts';
import { routes } from '../routes.ts';

export default function CouponDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const query = useCoupon(id);
  const deactivate = useDeactivateCoupon();
  const update = useUpdateCoupon();
  const [error, setError] = useState('');
  const coupon = query.data;

  const onToggle = async () => {
    if (!id || !coupon) return;
    setError('');
    try {
      if (coupon.isActive) await deactivate.mutateAsync(id);
      else await update.mutateAsync({ id, body: { isActive: true } });
      await query.refetch();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update this coupon.'));
    }
  };

  const busy = deactivate.isPending || update.isPending;

  if (query.isLoading) {
    return (
      <div className="relative min-h-48 rounded-lg border border-line bg-white">
        <BusyOverlay label="Loading coupon…" />
      </div>
    );
  }
  if (query.isError || !coupon) {
    return (
      <p className="font-body text-[14px] text-canam-red" role="alert">
        {getErrorMessage(query.error, 'Coupon not found.')}
      </p>
    );
  }

  return (
    <section className="flex min-w-0 flex-col gap-6">
      <button type="button" className="self-start font-display text-[13px] font-bold text-navy" onClick={() => navigate(routes.coupons)}>
        ← Coupons
      </button>
      {error && (
        <p className="font-body text-[13px] text-canam-red" role="alert">
          {error}
        </p>
      )}
      <div className="rounded-lg border border-line bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h2 className="break-words font-display text-[20px] font-extrabold text-navy sm:text-[22px]">{coupon.code}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <CouponStatusBadge isActive={coupon.isActive} />
              <span className="font-body text-[13px] text-muted">{couponTypeLabel(coupon.type)}</span>
            </div>
            <p className="mt-2 font-display text-[18px] font-extrabold text-navy">{formatCouponValue(coupon)}</p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Link
              to={routes.couponEdit(coupon.id)}
              className="flex h-11 items-center justify-center rounded-[6px] border border-navy px-4 font-display text-[13px] font-bold text-navy"
            >
              Edit coupon
            </Link>
            <button
              type="button"
              className="h-11 rounded-[6px] border border-line px-4 font-display text-[13px] font-bold text-navy disabled:opacity-70"
              onClick={() => void onToggle()}
              disabled={busy}
            >
              <BusyLabel
                pending={busy}
                pendingLabel="Updating…"
                idle={coupon.isActive ? 'Deactivate' : 'Activate'}
              />
            </button>
          </div>
        </div>
        <dl className="mt-6 grid gap-4 border-t border-line pt-6 sm:grid-cols-2 lg:grid-cols-3">
          <Fact label="Minimum subtotal" value={money(coupon.minSubtotal)} />
          <Fact label="Max discount" value={coupon.maxDiscount == null ? '—' : money(coupon.maxDiscount)} />
          <Fact label="Uses" value={coupon.usageLimit == null ? String(coupon.usedCount) : `${coupon.usedCount} / ${coupon.usageLimit}`} />
          <Fact label="Starts" value={formatOrderDate(coupon.startsAt || undefined)} />
          <Fact label="Ends" value={formatOrderDate(coupon.endsAt || undefined)} />
        </dl>
      </div>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-display text-[11px] font-bold uppercase text-muted">{label}</dt>
      <dd className="mt-1 break-words font-body text-[14px]">{value}</dd>
    </div>
  );
}
