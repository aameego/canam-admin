export type UserRole = 'customer' | 'admin';

export type AccountStatus = 'pending' | 'approved' | 'rejected';

export type CustomerListItem = {
  id: string;
  businessName: string;
  contactName: string;
  contactShort: string;
  email: string;
  phone: string;
  businessType: string;
  accountStatus: AccountStatus;
  joinedAt?: string;
  joinedLabel: string;
  orderCount: number;
};

export type CustomerAddress = {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  line: string;
};

export type CustomerOrder = {
  id: string;
  orderNumber: string;
  createdAt?: string;
  createdLabel: string;
  itemCount: number;
  total: number;
};

export type CustomerDetail = CustomerListItem & {
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  addresses: CustomerAddress[];
  orders: {
    items: CustomerOrder[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

export type CustomerListResult = {
  items: CustomerListItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  counts: { all: number; approved: number; pending: number; rejected: number };
  q: string;
  status: AccountStatus | 'all';
};

export type CustomerWrite = {
  contactName: string;
  businessName: string;
  email: string;
  phone: string;
  password?: string;
  businessType?: string;
};

export type User = {
  id: string;
  email: string;
  contactName: string;
  phone: string;
  businessName: string;
  businessType: string;
  role: UserRole;
};

export type ProductStatus = 'active' | 'inactive' | 'draft';

export type BulkTier = {
  minQty: number;
  maxQty?: number | null;
  unitPrice: number;
};

export type Product = {
  id: string;
  title: string;
  sku: string;
  zohoItemId: string | null;
  categoryId: string;
  categoryCode: string;
  categoryName: string;
  description: string;
  specs: string;
  status: ProductStatus;
  image: string;
  piecesPerCarton: number | null;
  priceCarton: number | null;
  priceUnit: number | null;
  price: number;
  moq: number | null;
  customBranding: boolean;
  bulkTiers: BulkTier[];
  volume: string | null;
  volumeUnit: string | null;
  material: string | null;
  dimension: string | null;
  packSize: string | null;
};

export type Category = {
  id: string;
  name: string;
  code: string;
  slug: string;
  isActive: boolean;
  count?: number;
};

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type OrderItem = {
  productId: string;
  zohoItemId: string;
  productName: string;
  sku: string;
  categoryId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  isCustomBranding: boolean;
  brandingText: string;
  additionalInstruction: string;
  artworkUrl: string;
  artworkFileName: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  customerId: string | null;
  name: string;
  phone: string;
  email: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  couponId: string | null;
  couponCode: string | null;
  status: OrderStatus;
  source: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type CouponType = 'percent' | 'fixed';

export type Coupon = {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minSubtotal: number;
  maxDiscount: number | null;
  startsAt: string | null;
  endsAt: string | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  productIds: string[];
  categoryIds: string[];
};

export type PageResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages?: number;
};

export type ListParams = {
  q?: string;
  page?: number;
  limit?: number;
  status?: string;
  categoryId?: string;
};

export type CustomerListParams = {
  q?: string;
  status?: AccountStatus | 'all';
  page?: number;
  limit?: number;
  range?: '30d' | '';
};
