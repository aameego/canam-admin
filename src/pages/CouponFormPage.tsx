import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BusyOverlay, { BusyLabel } from '../components/BusyOverlay.tsx';
import { useCoupon, useCreateCoupon, useUpdateCoupon } from '../hooks/useCoupons.ts';
import {
  COUPON_CODE_MAX,
  couponToForm,
  EMPTY_COUPON_FORM,
  validateCouponForm,
} from '../lib/coupons.ts';
import { getErrorMessage } from '../lib/getErrorMessage.ts';
import { routes } from '../routes.ts';

const fieldClass =
  'w-full rounded-[6px] border border-line bg-white px-3 py-2.5 font-body text-[14px] text-ink outline-none focus:border-navy';
const labelClass = 'font-display text-[13px] font-bold text-navy';

export default function CouponFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const existing = useCoupon(id);
  const create = useCreateCoupon();
  const update = useUpdateCoupon();
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY_COUPON_FORM);

  useEffect(() => {
    if (!existing.data) return;
    setForm(couponToForm(existing.data));
  }, [existing.data]);

  const onChange = (key: keyof typeof EMPTY_COUPON_FORM) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setError('');
      const value = event.target.type === 'checkbox' ? (event.target as HTMLInputElement).checked : event.target.value;
      setForm((current) => ({ ...current, [key]: value }));
    };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    const parsed = validateCouponForm(form);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    try {
      if (isEdit && id) {
        await update.mutateAsync({ id, body: parsed.body });
        navigate(routes.coupon(id));
      } else {
        const res = await create.mutateAsync(parsed.body);
        navigate(routes.coupon(res.data.item.id));
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save this coupon.'));
    }
  };

  const saving = create.isPending || update.isPending;

  if (isEdit && existing.isLoading) {
    return (
      <div className="relative min-h-48 w-full min-w-0 max-w-[640px] rounded-lg border border-line bg-white">
        <BusyOverlay label="Loading coupon…" />
      </div>
    );
  }

  return (
    <section className="relative w-full min-w-0 max-w-[640px] rounded-lg border border-line bg-white p-5 sm:p-8">
      {saving ? <BusyOverlay label={isEdit ? 'Saving coupon…' : 'Creating coupon…'} /> : null}
      <p className="font-body text-[14px] text-muted">
        Codes are saved in uppercase. Leave dates blank for no start or end. A usage limit of 1 is one-time use.
      </p>
      {error && (
        <p className="mt-4 font-body text-[13px] text-canam-red" role="alert">
          {error}
        </p>
      )}
      <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Code" htmlFor="code">
          <input id="code" className={fieldClass} value={form.code} onChange={onChange('code')} required maxLength={COUPON_CODE_MAX} />
        </Field>
        <Field label="Type" htmlFor="type">
          <select id="type" className={fieldClass} value={form.type} onChange={onChange('type')}>
            <option value="percent">Percent</option>
            <option value="fixed">Fixed amount</option>
          </select>
        </Field>
        <Field label={form.type === 'percent' ? 'Percent' : 'Amount'} htmlFor="value">
          <input id="value" type="number" min="0" step="0.01" className={fieldClass} value={form.value} onChange={onChange('value')} required />
        </Field>
        <Field label="Minimum subtotal" htmlFor="minSubtotal">
          <input id="minSubtotal" type="number" min="0" step="0.01" className={fieldClass} value={form.minSubtotal} onChange={onChange('minSubtotal')} />
        </Field>
        <Field label="Max discount (optional)" htmlFor="maxDiscount">
          <input id="maxDiscount" type="number" min="0" step="0.01" className={fieldClass} value={form.maxDiscount} onChange={onChange('maxDiscount')} />
        </Field>
        <Field label="Usage limit (optional)" htmlFor="usageLimit">
          <input id="usageLimit" type="number" min="1" step="1" className={fieldClass} value={form.usageLimit} onChange={onChange('usageLimit')} />
        </Field>
        <Field label="Starts at" htmlFor="startsAt">
          <input id="startsAt" type="datetime-local" className={fieldClass} value={form.startsAt} onChange={onChange('startsAt')} />
        </Field>
        <Field label="Ends at" htmlFor="endsAt">
          <input id="endsAt" type="datetime-local" className={fieldClass} value={form.endsAt} onChange={onChange('endsAt')} />
        </Field>
        <label className="flex items-center gap-2 font-display text-[13px] font-bold text-navy sm:col-span-2">
          <input type="checkbox" checked={form.isActive} onChange={onChange('isActive')} />
          Active
        </label>
        <div className="mt-2 flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={saving}
            className="h-11 rounded-[6px] bg-canam-red px-4 font-display text-[13px] font-bold text-white disabled:opacity-70"
          >
            <BusyLabel pending={saving} pendingLabel="Saving…" idle={isEdit ? 'Save changes' : 'Create coupon'} />
          </button>
          <Link
            to={isEdit && id ? routes.coupon(id) : routes.coupons}
            className="flex h-11 items-center justify-center px-4 font-display text-[13px] font-bold text-navy"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={labelClass} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}
