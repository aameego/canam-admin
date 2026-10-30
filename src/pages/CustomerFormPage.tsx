import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BusyOverlay, { BusyLabel } from '../components/BusyOverlay.tsx';
import { useCreateCustomer, useCustomer, useUpdateCustomer } from '../hooks/useCustomers.ts';
import { BUSINESS_TYPES, customerToForm, EMPTY_CUSTOMER_FORM, validateCustomerForm } from '../lib/customers.ts';
import { getErrorMessage } from '../lib/getErrorMessage.ts';
import { routes } from '../routes.ts';

const fieldClass =
  'w-full rounded-[6px] border border-line bg-white px-3 py-2.5 font-body text-[14px] text-ink outline-none focus:border-navy';
const labelClass = 'font-display text-[13px] font-bold text-navy';

export default function CustomerFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const existing = useCustomer(id);
  const create = useCreateCustomer();
  const update = useUpdateCustomer();
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY_CUSTOMER_FORM);

  useEffect(() => {
    if (!existing.data) return;
    setForm(customerToForm(existing.data));
  }, [existing.data]);

  const onChange = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setError('');
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    const parsed = validateCustomerForm(form, isEdit);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    try {
      const body = parsed.body;
      if (isEdit && id) {
        await update.mutateAsync({ id, body });
        navigate(routes.customer(id));
      } else {
        const res = await create.mutateAsync(body);
        navigate(routes.customer(res.data.customer.id));
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save this customer.'));
    }
  };

  const saving = create.isPending || update.isPending;

  if (isEdit && existing.isLoading) {
    return (
      <div className="relative min-h-48 w-full min-w-0 max-w-[640px] rounded-lg border border-line bg-white">
        <BusyOverlay label="Loading customer…" />
      </div>
    );
  }

  return (
    <section className="relative w-full min-w-0 max-w-[640px] rounded-lg border border-line bg-white p-5 sm:p-8">
      {saving ? <BusyOverlay label={isEdit ? 'Saving customer…' : 'Creating customer…'} /> : null}
      <p className="font-body text-[14px] text-muted">
        {isEdit
          ? 'Update this wholesale account. Leave password blank to keep the current one.'
          : 'Creates an approved wholesale account that can sign in immediately.'}
      </p>
      {error && (
        <p className="mt-4 font-body text-[13px] text-canam-red" role="alert">
          {error}
        </p>
      )}
      <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="businessName">
            Business name
          </label>
          <input id="businessName" className={fieldClass} value={form.businessName} onChange={onChange('businessName')} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="contactName">
            Contact name
          </label>
          <input id="contactName" className={fieldClass} value={form.contactName} onChange={onChange('contactName')} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="email">
            Email
          </label>
          <input id="email" type="email" className={fieldClass} value={form.email} onChange={onChange('email')} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="phone">
            Phone
          </label>
          <input id="phone" className={fieldClass} value={form.phone} onChange={onChange('phone')} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="businessType">
            Business type
          </label>
          <select id="businessType" className={fieldClass} value={form.businessType} onChange={onChange('businessType')}>
            <option value="">Select type</option>
            {BUSINESS_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="password">
            {isEdit ? 'New password (optional)' : 'Password'}
          </label>
          <input
            id="password"
            type="password"
            className={fieldClass}
            value={form.password}
            onChange={onChange('password')}
            required={!isEdit}
            autoComplete={isEdit ? 'new-password' : 'new-password'}
          />
        </div>
        <div className="mt-2 flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={saving}
            className="h-11 rounded-[6px] bg-canam-red px-4 font-display text-[13px] font-bold text-white disabled:opacity-70"
          >
            <BusyLabel
              pending={saving}
              pendingLabel="Saving…"
              idle={isEdit ? 'Save changes' : 'Create customer'}
            />
          </button>
          <Link
            to={isEdit && id ? routes.customer(id) : routes.customers}
            className="flex h-11 items-center justify-center px-4 font-display text-[13px] font-bold text-navy"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
