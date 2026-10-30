import { statusBadgeClass, statusLabel } from '../lib/customers.ts';
import { productStatusClass, productStatusLabel } from '../lib/products.ts';
import type { AccountStatus, ProductStatus } from '../types/api.ts';

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
