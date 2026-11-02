import { clampPlainText, parseOptionalNonNegativeNumber, parseRequiredNumber } from './fields.ts';
import type { Coupon, CouponType } from '../types/api.ts';

export const COUPON_CODE_MIN = 2;
export const COUPON_CODE_MAX = 40;
export const COUPON_CODE_PATTERN = /^[A-Z0-9][A-Z0-9-]{0,38}[A-Z0-9]$/;

export const COUPON_STATUS_FILTERS: Array<{ id: 'all' | 'active' | 'inactive'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
];

export const couponStatusLabel = (isActive: boolean): string => (isActive ? 'Active' : 'Inactive');

export const couponStatusClass = (isActive: boolean): string =>
  isActive
    ? 'border-[#10b981] bg-[#ecfdf5] text-[#10b981]'
    : 'border-canam-red bg-[#fef2f2] text-canam-red';

export const couponTypeLabel = (type: CouponType): string => (type === 'percent' ? 'Percent' : 'Fixed amount');

export const formatCouponValue = (coupon: Pick<Coupon, 'type' | 'value'>): string =>
  coupon.type === 'percent' ? `${coupon.value}%` : `$${coupon.value.toFixed(2)}`;

export type CouponFormValues = {
  code: string;
  type: CouponType;
  value: string;
  minSubtotal: string;
  maxDiscount: string;
  startsAt: string;
  endsAt: string;
  usageLimit: string;
  isActive: boolean;
};

export const EMPTY_COUPON_FORM: CouponFormValues = {
  code: '',
  type: 'percent',
  value: '',
  minSubtotal: '',
  maxDiscount: '',
  startsAt: '',
  endsAt: '',
  usageLimit: '',
  isActive: true,
};

export const isoToLocalInput = (iso: string | null): string => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const parseLocalDateInput = (
  value: string,
): { ok: true; value: string | null } | { ok: false } => {
  const trimmed = value.trim();
  if (!trimmed) return { ok: true, value: null };
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return { ok: false };
  return { ok: true, value: date.toISOString() };
};

export const couponToForm = (coupon: Coupon): CouponFormValues => ({
  code: coupon.code,
  type: coupon.type,
  value: String(coupon.value),
  minSubtotal: coupon.minSubtotal ? String(coupon.minSubtotal) : '',
  maxDiscount: coupon.maxDiscount == null ? '' : String(coupon.maxDiscount),
  startsAt: isoToLocalInput(coupon.startsAt),
  endsAt: isoToLocalInput(coupon.endsAt),
  usageLimit: coupon.usageLimit == null ? '' : String(coupon.usageLimit),
  isActive: coupon.isActive,
});

export type CouponFormBody = {
  code: string;
  type: CouponType;
  value: number;
  minSubtotal: number;
  maxDiscount: number | null;
  startsAt: string | null;
  endsAt: string | null;
  usageLimit: number | null;
  isActive: boolean;
};

export const validateCouponForm = (
  form: CouponFormValues,
): { ok: true; body: CouponFormBody } | { ok: false; error: string } => {
  const code = clampPlainText(form.code, 'Coupon code', COUPON_CODE_MAX);
  if (!code.ok) return code;
  const normalized = code.value.toUpperCase();
  if (normalized.length < COUPON_CODE_MIN || !COUPON_CODE_PATTERN.test(normalized)) {
    return { ok: false, error: 'Use letters, numbers, and hyphens only (2–40 characters).' };
  }
  if (form.type !== 'percent' && form.type !== 'fixed') {
    return { ok: false, error: 'Choose percent or fixed.' };
  }
  const value = parseRequiredNumber(form.value, 'Value');
  if (!value.ok) return value;
  if (form.type === 'percent' && value.value > 100) {
    return { ok: false, error: 'Percent value cannot exceed 100.' };
  }
  const minSubtotal = parseOptionalNonNegativeNumber(form.minSubtotal, 'Minimum subtotal');
  if (!minSubtotal.ok) return minSubtotal;
  const maxDiscount = parseOptionalNonNegativeNumber(form.maxDiscount, 'Max discount');
  if (!maxDiscount.ok) return maxDiscount;
  const usageLimit = parseOptionalNonNegativeNumber(form.usageLimit, 'Usage limit');
  if (!usageLimit.ok) return usageLimit;
  if (usageLimit.value != null && (!Number.isInteger(usageLimit.value) || usageLimit.value < 1)) {
    return { ok: false, error: 'Usage limit must be a whole number of at least 1.' };
  }
  const startsAt = parseLocalDateInput(form.startsAt);
  if (!startsAt.ok) return { ok: false, error: 'Enter a valid start date.' };
  const endsAt = parseLocalDateInput(form.endsAt);
  if (!endsAt.ok) return { ok: false, error: 'Enter a valid end date.' };
  if (startsAt.value && endsAt.value && new Date(startsAt.value) > new Date(endsAt.value)) {
    return { ok: false, error: 'End date cannot be before the start date.' };
  }
  return {
    ok: true,
    body: {
      code: normalized,
      type: form.type,
      value: value.value,
      minSubtotal: minSubtotal.value ?? 0,
      maxDiscount: maxDiscount.value,
      startsAt: startsAt.value,
      endsAt: endsAt.value,
      usageLimit: usageLimit.value,
      isActive: form.isActive !== false,
    },
  };
};
