import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BusyOverlay, { BusyLabel } from '../components/BusyOverlay.tsx';
import StatusBadge from '../components/StatusBadge.tsx';
import { useCustomer, useUpdateCustomerStatus } from '../hooks/useCustomers.ts';
import { CUSTOMER_DETAIL_TABS, money, statusLabel } from '../lib/customers.ts';
import { getErrorMessage } from '../lib/getErrorMessage.ts';
import { routes } from '../routes.ts';

type Tab = (typeof CUSTOMER_DETAIL_TABS)[number]['id'];

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const query = useCustomer(id);
  const updateStatus = useUpdateCustomerStatus();
  const [tab, setTab] = useState<Tab>('orders');
  const [error, setError] = useState('');
  const [confirmBlock, setConfirmBlock] = useState(false);
  const customer = query.data;

  const changeStatus = async (accountStatus: 'approved' | 'rejected') => {
    if (!id) return;
    setError('');
    try {
      await updateStatus.mutateAsync({ id, accountStatus });
      setConfirmBlock(false);
      await query.refetch();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update this account.'));
    }
  };

  if (query.isLoading) {
    return (
      <div className="relative min-h-48 rounded-lg border border-line bg-white">
        <BusyOverlay label="Loading customer…" />
      </div>
    );
  }
  if (query.isError || !customer) {
    return (
      <p className="font-body text-[14px] text-canam-red" role="alert">
        {getErrorMessage(query.error, 'Customer not found.')}
      </p>
    );
  }

  const tabs = CUSTOMER_DETAIL_TABS;

  return (
    <section className="flex min-w-0 flex-col gap-6">
      <button
        type="button"
        className="self-start font-display text-[13px] font-bold text-navy"
        onClick={() => navigate(routes.customers)}
      >
        ← Customers
      </button>

      {error && (
        <p className="font-body text-[13px] text-canam-red" role="alert">
          {error}
        </p>
      )}

      <div className="rounded-lg border border-line bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h2 className="break-words font-display text-[20px] font-extrabold text-navy sm:text-[22px]">
              {customer.businessName || customer.contactName}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={customer.accountStatus} />
              <span className="font-body text-[13px] text-muted">{statusLabel(customer.accountStatus)} customer</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap">
            <Link
              to={routes.customerEdit(customer.id)}
              className="flex h-11 items-center justify-center rounded-[6px] border border-navy px-4 text-center font-display text-[13px] font-bold text-navy"
            >
              Edit Customer
            </Link>
            {customer.accountStatus === 'rejected' ? (
              <button
                type="button"
                className="h-11 rounded-[6px] border border-[#10b981] px-4 font-display text-[13px] font-bold text-[#10b981] disabled:opacity-70"
                onClick={() => void changeStatus('approved')}
                disabled={updateStatus.isPending}
              >
                <BusyLabel pending={updateStatus.isPending} pendingLabel="Approving…" idle="Approve account" />
              </button>
            ) : (
              <button
                type="button"
                className="h-11 rounded-[6px] border border-canam-red px-4 font-display text-[13px] font-bold text-canam-red"
                onClick={() => setConfirmBlock(true)}
                disabled={updateStatus.isPending}
              >
                Block Account
              </button>
            )}
            {customer.accountStatus === 'pending' && (
              <button
                type="button"
                className="h-11 rounded-[6px] bg-[#10b981] px-4 font-display text-[13px] font-bold text-white disabled:opacity-70 sm:col-span-2 lg:col-span-1"
                onClick={() => void changeStatus('approved')}
                disabled={updateStatus.isPending}
              >
                <BusyLabel pending={updateStatus.isPending} pendingLabel="Approving…" idle="Approve" />
              </button>
            )}
          </div>
        </div>

        {confirmBlock && (
          <div className="mt-4 rounded-[6px] border border-canam-red/30 bg-[#fef2f2] p-4">
            <p className="font-body text-[14px] text-ink">
              Block this account? They will not be able to sign in to the wholesale store.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="rounded-[6px] bg-canam-red px-3 py-1.5 font-display text-[13px] font-bold text-white disabled:opacity-70"
                onClick={() => void changeStatus('rejected')}
                disabled={updateStatus.isPending}
              >
                <BusyLabel pending={updateStatus.isPending} pendingLabel="Blocking…" idle="Block account" />
              </button>
              <button
                type="button"
                className="rounded-[6px] px-3 py-1.5 font-display text-[13px] font-bold text-navy"
                onClick={() => setConfirmBlock(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <dl className="mt-6 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
          <div>
            <dt className="font-display text-[11px] font-bold uppercase text-muted">Primary contact</dt>
            <dd className="mt-1 break-words font-body text-[14px]">{customer.contactName}</dd>
          </div>
          <div>
            <dt className="font-display text-[11px] font-bold uppercase text-muted">Email address</dt>
            <dd className="mt-1 break-all font-body text-[14px]">{customer.email}</dd>
          </div>
          <div>
            <dt className="font-display text-[11px] font-bold uppercase text-muted">Phone number</dt>
            <dd className="mt-1 break-all font-body text-[14px]">{customer.phone}</dd>
          </div>
          <div>
            <dt className="font-display text-[11px] font-bold uppercase text-muted">Shipping address</dt>
            <dd className="mt-1 break-words font-body text-[14px]">
              {customer.addresses[0]?.line || 'No address on file.'}
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <div className="chip-scroller -mx-1 flex gap-2 overflow-x-auto px-1">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`h-11 shrink-0 rounded-t-[6px] px-4 font-display text-[13px] font-bold ${
                tab === item.id ? 'bg-navy text-white' : 'bg-white text-navy'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="rounded-b-lg rounded-tr-lg border border-line bg-white">
          {tab === 'profile' && (
            <div className="grid gap-4 p-6 sm:grid-cols-2">
              <p className="font-body text-[14px]">
                <span className="block font-display text-[11px] font-bold uppercase text-muted">Business type</span>
                {customer.businessType || '—'}
              </p>
              <p className="font-body text-[14px]">
                <span className="block font-display text-[11px] font-bold uppercase text-muted">Date joined</span>
                {customer.joinedLabel || '—'}
              </p>
              <p className="font-body text-[14px]">
                <span className="block font-display text-[11px] font-bold uppercase text-muted">Email verified</span>
                {customer.isEmailVerified ? 'Yes' : 'No'}
              </p>
              <p className="font-body text-[14px]">
                <span className="block font-display text-[11px] font-bold uppercase text-muted">Phone verified</span>
                {customer.isPhoneVerified ? 'Yes' : 'No'}
              </p>
            </div>
          )}

          {tab === 'orders' && (
            <div>
              {customer.orders.items.length === 0 && (
                <p className="px-4 py-8 font-body text-[14px] text-muted">No orders yet.</p>
              )}
              <div className="grid gap-3 p-4 md:hidden">
                {customer.orders.items.map((order) => (
                  <article key={order.id} className="rounded-[6px] border border-line p-3">
                    <p className="font-display text-[14px] font-bold text-navy">{order.orderNumber}</p>
                    <p className="mt-1 font-body text-[13px] text-muted">{order.createdLabel}</p>
                    <div className="mt-2 flex items-center justify-between font-body text-[14px]">
                      <span>
                        {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                      </span>
                      <span className="font-display text-[13px] font-bold">{money(order.total)}</span>
                    </div>
                  </article>
                ))}
              </div>
              <div className="hidden md:block">
                <div className="flex bg-canvas px-4 py-2.5 font-display text-[11px] font-bold uppercase text-muted">
                  <p className="min-w-0 flex-1">Order #</p>
                  <p className="w-[140px] shrink-0">Date</p>
                  <p className="w-[100px] shrink-0">Items</p>
                  <p className="w-[120px] shrink-0 text-right">Total</p>
                </div>
                {customer.orders.items.map((order) => (
                  <div key={order.id} className="flex items-center border-t border-line px-4 py-3">
                    <p className="min-w-0 flex-1 truncate font-display text-[14px] font-bold text-navy">
                      {order.orderNumber}
                    </p>
                    <p className="w-[140px] shrink-0 font-body text-[14px]">{order.createdLabel}</p>
                    <p className="w-[100px] shrink-0 font-body text-[14px]">
                      {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                    </p>
                    <p className="w-[120px] shrink-0 text-right font-display text-[13px] font-bold">
                      {money(order.total)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'addresses' && (
            <div className="p-6">
              {customer.addresses.length === 0 && (
                <p className="font-body text-[14px] text-muted">No addresses on file.</p>
              )}
              <ul className="grid gap-3">
                {customer.addresses.map((address) => (
                  <li key={address.id} className="rounded-[6px] border border-line p-4">
                    <p className="font-display text-[13px] font-bold text-navy">
                      {address.label || 'Address'}
                      {address.isDefault ? ' · Default' : ''}
                    </p>
                    <p className="mt-1 font-body text-[14px]">{address.line}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === 'activity' && (
            <p className="px-4 py-8 font-body text-[14px] text-muted">No activity recorded yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
