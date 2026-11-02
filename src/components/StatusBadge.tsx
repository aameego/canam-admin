import { couponStatusClass, couponStatusLabel } from '../lib/coupons.ts';
import { statusBadgeClass, statusLabel } from '../lib/customers.ts';
import { orderStatusClass, orderStatusLabel } from '../lib/orders.ts';
import { productStatusClass, productStatusLabel } from '../lib/products.ts';
import type { AccountStatus, OrderStatus, ProductStatus } from '../types/api.ts';

export default function StatusBadge({ status }: { status: AccountStatus }) {
  return (
    <span
      className={`inline-flex rounded-xl border px-2.5 py-1 font-display text-[11px] font-bold ${statusBadgeClass(status)}`}
    >
      {statusLabel(status)}
    </span>
  );
}

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-xl border px-2.5 py-1 font-display text-[11px] font-bold ${productStatusClass(status)}`}
    >
      {productStatusLabel(status)}
    </span>
  );
}

export function CouponStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-xl border px-2.5 py-1 font-display text-[11px] font-bold ${couponStatusClass(isActive)}`}
    >
      {couponStatusLabel(isActive)}
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-xl border px-2.5 py-1 font-display text-[11px] font-bold ${orderStatusClass(status)}`}
    >
      {orderStatusLabel(status)}
    </span>
  );
}
