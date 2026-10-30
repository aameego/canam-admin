import type { AccountStatus, CustomerListItem, CustomerWrite } from '../types/api.ts';

export const BUSINESS_TYPES = [
  'Restaurant/Cafe',
  'Food Truck',
  'Catering',
  'Retail Store',
  'Clinic/Healthcare',
  'Hotel/Hospitality',
  'Institutional',
  'Other',
] as const;

export const statusLabel = (status: AccountStatus): string => {
  if (status === 'pending') return 'Pending';
  if (status === 'rejected') return 'Rejected';
  return 'Approved';
};

export const statusBadgeClass = (status: AccountStatus): string => {
  if (status === 'pending') return 'border-[#f59e0b] bg-[#fffbeb] text-[#f59e0b]';
  if (status === 'rejected') return 'border-canam-red bg-[#fef2f2] text-canam-red';
  return 'border-[#10b981] bg-[#ecfdf5] text-[#10b981]';
};

export const money = (value: number): string =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(value);

export const CUSTOMER_STATUS_FILTERS: Array<{ id: AccountStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'approved', label: 'Approved' },
  { id: 'pending', label: 'Pending' },
  { id: 'rejected', label: 'Rejected' },
];

export const CUSTOMER_DETAIL_TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'orders', label: 'Order History' },
  { id: 'addresses', label: 'Addresses' },
  { id: 'activity', label: 'Activity Timeline' },
] as const;

export type CustomerFormValues = {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  businessType: string;
  password: string;
};

export const EMPTY_CUSTOMER_FORM: CustomerFormValues = {
  businessName: '',
  contactName: '',
  email: '',
  phone: '',
  businessType: '',
  password: '',
};

export const customerToForm = (
  customer: Pick<CustomerListItem, 'businessName' | 'contactName' | 'email' | 'phone' | 'businessType'>,
): CustomerFormValues => ({
  businessName: customer.businessName,
  contactName: customer.contactName,
  email: customer.email,
  phone: customer.phone,
  businessType: customer.businessType,
  password: '',
});

export const validateCustomerForm = (
  form: CustomerFormValues,
  isEdit: boolean,
): { ok: true; body: CustomerWrite } | { ok: false; error: string } => {
  if (!form.businessName.trim() || !form.contactName.trim() || !form.email.trim() || !form.phone.trim()) {
    return { ok: false, error: 'Business name, contact, email, and phone are required.' };
  }
  if (!isEdit && form.password.length < 8) {
    return { ok: false, error: 'Password must be at least 8 characters.' };
  }
  return {
    ok: true,
    body: {
      businessName: form.businessName.trim(),
      contactName: form.contactName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      businessType: form.businessType || undefined,
      password: form.password || undefined,
    },
  };
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
