import { money } from './customers.ts';
import type { Order, OrderItem, OrderStatus } from '../types/api.ts';

export const ORDER_NOTES_MAX = 2000;

export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

export const isOrderStatus = (value: string): value is OrderStatus =>
  ORDER_STATUSES.includes(value as OrderStatus);

export const ORDER_STATUS_FILTERS: Array<{ id: OrderStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'processing', label: 'Processing' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
];

export const EMPTY_ORDER_COUNTS = {
  all: 0,
  pending: 0,
  confirmed: 0,
  processing: 0,
  shipped: 0,
  delivered: 0,
  cancelled: 0,
};

export type OrderCounts = typeof EMPTY_ORDER_COUNTS;

export const orderStatusLabel = (status: OrderStatus): string => {
  if (status === 'confirmed') return 'Confirmed';
  if (status === 'processing') return 'Processing';
  if (status === 'shipped') return 'Shipped';
  if (status === 'delivered') return 'Delivered';
  if (status === 'cancelled') return 'Cancelled';
  return 'Pending';
};

export const orderStatusClass = (status: OrderStatus): string => {
  if (status === 'cancelled') return 'border-canam-red bg-[#fef2f2] text-canam-red';
  if (status === 'pending') return 'border-[#f59e0b] bg-[#fffbeb] text-[#f59e0b]';
  if (status === 'confirmed' || status === 'processing') return 'border-[#3b82f6] bg-[#eff6ff] text-[#2563eb]';
  if (status === 'shipped') return 'border-[#10b981] bg-[#ecfdf5] text-[#10b981]';
  return 'border-line bg-canvas text-muted';
};

export const formatOrderDate = (value?: string): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

export const orderItemSummary = (items: OrderItem[] = []): string => {
  if (items.length === 0) return 'No items';
  const first = items[0];
  const name = first?.productName?.trim() || first?.sku?.trim() || 'Item';
  const qty = Number(first?.quantity) || 0;
  const extra = items.length - 1;
  const primary = qty > 0 ? `${name} × ${qty}` : name;
  if (extra <= 0) return primary;
  return `${primary} + ${extra} more`;
};

export const orderTotals = (order: Pick<Order, 'subtotal' | 'discount' | 'gst' | 'total'>) => [
  { label: 'Subtotal', value: money(order.subtotal) },
  { label: 'Discount', value: money(order.discount) },
  { label: 'GST', value: money(order.gst) },
  { label: 'Total', value: money(order.total) },
];

export const chartBarHeight = (value: number, max: number): number => {
  if (max <= 0 || value <= 0) return 4;
  return Math.max(6, Math.round((value / max) * 72));
};

export const isOrderDirty = (
  current: { status: OrderStatus; notes: string },
  next: { status: OrderStatus; notes: string },
): boolean => current.status !== next.status || current.notes !== next.notes;

export const validateOrderUpdate = (
  status: string,
  notes: string,
): { ok: true; body: { status: OrderStatus; notes: string } } | { ok: false; error: string } => {
  if (!isOrderStatus(status)) return { ok: false, error: 'Choose a valid order status.' };
  if (notes.length > ORDER_NOTES_MAX) {
    return { ok: false, error: `Notes must be ${ORDER_NOTES_MAX} characters or fewer.` };
  }
  return { ok: true, body: { status, notes: notes.trim() } };
};
