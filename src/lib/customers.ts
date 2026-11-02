import type { AccountStatus, CustomerListItem, CustomerWrite } from '../types/api.ts';
import {
  validateEmailField,
  validateNameField,
  validatePasswordField,
  validatePhoneField,
} from './fields.ts';

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

const STATUS_LABELS: Record<AccountStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  blocked: 'Blocked',
};

export const statusLabel = (status: AccountStatus): string => STATUS_LABELS[status] ?? 'Approved';

export const statusBadgeClass = (status: AccountStatus): string => {
  if (status === 'pending') return 'border-[#f59e0b] bg-[#fffbeb] text-[#f59e0b]';
  if (status === 'rejected' || status === 'blocked') return 'border-canam-red bg-[#fef2f2] text-canam-red';
  return 'border-[#10b981] bg-[#ecfdf5] text-[#10b981]';
};

export type CustomerStatusAction = {
  next: Exclude<AccountStatus, 'pending'>;
  label: string;
  tone: 'approve' | 'danger';
  /** When set, the admin must confirm this text before the change is sent. */
  confirm?: string;
};

const APPROVE: CustomerStatusAction = { next: 'approved', label: 'Approve', tone: 'approve' };

/** The status changes an admin can make from a given status, used by the list menu and detail page. */
export const customerStatusActions = (status: AccountStatus): CustomerStatusAction[] => {
  if (status === 'pending') {
    return [
      APPROVE,
      {
        next: 'rejected',
        label: 'Reject application',
        tone: 'danger',
        confirm: 'Reject this application? The business will not be able to sign in to the wholesale store.',
      },
    ];
  }
  if (status === 'approved') {
    return [
      {
        next: 'blocked',
        label: 'Block account',
        tone: 'danger',
        confirm: 'Block this account? They will not be able to sign in to the wholesale store.',
      },
    ];
  }
  if (status === 'blocked') return [{ next: 'approved', label: 'Unblock account', tone: 'approve' }];
  return [APPROVE];
};

export const money = (value: number): string =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(
    Number.isFinite(value) ? value : 0,
  );

export const CUSTOMER_STATUS_FILTERS: Array<{ id: AccountStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'approved', label: 'Approved' },
  { id: 'pending', label: 'Pending' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'blocked', label: 'Blocked' },
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

export const isBusinessType = (value: string): value is (typeof BUSINESS_TYPES)[number] =>
  (BUSINESS_TYPES as readonly string[]).includes(value);

export const validateCustomerForm = (
  form: CustomerFormValues,
  isEdit: boolean,
): { ok: true; body: CustomerWrite } | { ok: false; error: string } => {
  const businessName = validateNameField(form.businessName, 'Business name');
  if (!businessName.ok) return businessName;
  const contactName = validateNameField(form.contactName, 'Contact name');
  if (!contactName.ok) return contactName;
  const email = validateEmailField(form.email);
  if (!email.ok) return email;
  const phone = validatePhoneField(form.phone);
  if (!phone.ok) return phone;
  if (form.businessType && !isBusinessType(form.businessType)) {
    return { ok: false, error: 'Choose a valid business type.' };
  }
  const password = validatePasswordField(form.password, !isEdit);
  if (!password.ok) return password;
  return {
    ok: true,
    body: {
      businessName: businessName.value,
      contactName: contactName.value,
      email: email.email,
      phone: phone.phone,
      businessType: form.businessType || undefined,
      password: password.password,
    },
  };
};

export const parseCustomerStatusAction = (
  value: string,
): { ok: true; accountStatus: CustomerStatusAction['next'] } | { ok: false; error: string } => {
  if (value === 'approved' || value === 'rejected' || value === 'blocked') return { ok: true, accountStatus: value };
  return { ok: false, error: 'Choose approve, reject, or block.' };
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
