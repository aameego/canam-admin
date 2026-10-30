import type { BulkTier, Product, ProductStatus } from '../types/api.ts';

export const PRODUCT_STATUS_FILTERS: Array<{ id: ProductStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
  { id: 'draft', label: 'Draft' },
];

export const productStatusLabel = (status: ProductStatus): string => {
  if (status === 'inactive') return 'Inactive';
  if (status === 'draft') return 'Draft';
  return 'Active';
};

export const productStatusClass = (status: ProductStatus): string => {
  if (status === 'draft') return 'border-[#f59e0b] bg-[#fffbeb] text-[#f59e0b]';
  if (status === 'inactive') return 'border-canam-red bg-[#fef2f2] text-canam-red';
  return 'border-[#10b981] bg-[#ecfdf5] text-[#10b981]';
};

export const parseFormNumber = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

export const MAX_BULK_TIERS = 5;

export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PRODUCT_IMAGE_ACCEPT = '.jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif';
export const PRODUCT_IMAGE_TYPE_ERROR = 'Use a JPG, PNG, WEBP, or GIF photo.';
export const PRODUCT_IMAGE_SIZE_ERROR = 'Photo must be 5MB or smaller.';

const PRODUCT_IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);
const PRODUCT_IMAGE_MIMES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']);

export const productImageExtension = (fileName: string): string => {
  if (typeof fileName !== 'string') return '';
  const base = fileName.trim().split(/[/\\]/).pop() ?? '';
  const dot = base.lastIndexOf('.');
  if (dot <= 0 || dot === base.length - 1) return '';
  return base.slice(dot + 1).toLowerCase();
};

export const validateProductImageFile = (
  file: { name: string; type: string; size: number },
): { ok: true } | { ok: false; error: string } => {
  const ext = productImageExtension(file.name);
  const mime = (file.type || '').toLowerCase();
  const mimeOk = !mime || mime === 'application/octet-stream' || PRODUCT_IMAGE_MIMES.has(mime);
  if (!PRODUCT_IMAGE_EXTENSIONS.has(ext) || !mimeOk) {
    return { ok: false, error: PRODUCT_IMAGE_TYPE_ERROR };
  }
  if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
    return { ok: false, error: PRODUCT_IMAGE_SIZE_ERROR };
  }
  return { ok: true };
};

export type BulkTierForm = {
  minQty: string;
  maxQty: string;
  unitPrice: string;
};

export const emptyBulkTier = (): BulkTierForm => ({ minQty: '', maxQty: '', unitPrice: '' });

export const bulkTiersToForm = (tiers: BulkTier[]): BulkTierForm[] => {
  if (!tiers.length) return [emptyBulkTier()];
  return tiers.map((tier) => ({
    minQty: String(tier.minQty),
    maxQty: tier.maxQty == null ? '' : String(tier.maxQty),
    unitPrice: String(tier.unitPrice),
  }));
};

export const parseBulkTiers = (
  rows: BulkTierForm[],
): { ok: true; tiers: BulkTier[] } | { ok: false; error: string } => {
  const filled = rows.filter((row) => row.minQty.trim() || row.maxQty.trim() || row.unitPrice.trim());
  if (filled.length > MAX_BULK_TIERS) {
    return { ok: false, error: 'At most 5 bulk price tiers are allowed.' };
  }
  const tiers: BulkTier[] = [];
  for (const row of filled) {
    const minQty = parseFormNumber(row.minQty);
    const unitPrice = parseFormNumber(row.unitPrice);
    const maxQty = parseFormNumber(row.maxQty);
    if (minQty === null || unitPrice === null) {
      return { ok: false, error: 'Each bulk tier needs a min quantity and unit price.' };
    }
    if (minQty < 0 || unitPrice < 0 || (maxQty !== null && maxQty < 0)) {
      return { ok: false, error: 'Bulk tier quantities and prices cannot be negative.' };
    }
    if (maxQty !== null && maxQty < minQty) {
      return { ok: false, error: 'Bulk tier max quantity cannot be below min quantity.' };
    }
    tiers.push({ minQty, maxQty, unitPrice });
  }
  return { ok: true, tiers };
};

export type ProductFormValues = {
  title: string;
  sku: string;
  categoryId: string;
  description: string;
  specs: string;
  status: ProductStatus;
  image: string;
  price: string;
  priceUnit: string;
  priceCarton: string;
  piecesPerCarton: string;
  moq: string;
  customBranding: boolean;
  volume: string;
  volumeUnit: string;
  material: string;
  dimension: string;
  packSize: string;
};

export const EMPTY_PRODUCT_FORM: ProductFormValues = {
  title: '',
  sku: '',
  categoryId: '',
  description: '',
  specs: '',
  status: 'active',
  image: '',
  price: '',
  priceUnit: '',
  priceCarton: '',
  piecesPerCarton: '',
  moq: '',
  customBranding: false,
  volume: '',
  volumeUnit: '',
  material: '',
  dimension: '',
  packSize: '',
};

export const productToForm = (product: Product): ProductFormValues => ({
  title: product.title,
  sku: product.sku,
  categoryId: product.categoryId,
  description: product.description,
  specs: product.specs,
  status: product.status,
  image: product.image,
  price: String(product.price ?? ''),
  priceUnit: product.priceUnit == null ? '' : String(product.priceUnit),
  priceCarton: product.priceCarton == null ? '' : String(product.priceCarton),
  piecesPerCarton: product.piecesPerCarton == null ? '' : String(product.piecesPerCarton),
  moq: product.moq == null ? '' : String(product.moq),
  customBranding: product.customBranding,
  volume: product.volume || '',
  volumeUnit: product.volumeUnit || '',
  material: product.material || '',
  dimension: product.dimension || '',
  packSize: product.packSize || '',
});

export type ProductFormBody = {
  title: string;
  sku: string;
  categoryId: string;
  description: string;
  specs: string;
  status: ProductStatus;
  image: string;
  price: number;
  priceUnit: number | null;
  priceCarton: number | null;
  piecesPerCarton: number | null;
  moq: number | null;
  customBranding: boolean;
  bulkTiers: BulkTier[];
  volume: string | null;
  volumeUnit: string | null;
  material: string | null;
  dimension: string | null;
  packSize: string | null;
};

export const validateProductForm = (
  form: ProductFormValues,
  tiers: BulkTierForm[],
): { ok: true; body: ProductFormBody } | { ok: false; error: string } => {
  const price = parseFormNumber(form.price);
  if (!form.title.trim() || !form.sku.trim() || !form.categoryId) {
    return { ok: false, error: 'Name, SKU, and category are required.' };
  }
  if (price === null) {
    return { ok: false, error: 'Price is required.' };
  }
  const parsedTiers = parseBulkTiers(tiers);
  if (!parsedTiers.ok) return parsedTiers;
  return {
    ok: true,
    body: {
      title: form.title.trim(),
      sku: form.sku.trim(),
      categoryId: form.categoryId,
      description: form.description.trim(),
      specs: form.specs.trim(),
      status: form.status,
      image: form.image.trim(),
      price,
      priceUnit: parseFormNumber(form.priceUnit),
      priceCarton: parseFormNumber(form.priceCarton),
      piecesPerCarton: parseFormNumber(form.piecesPerCarton),
      moq: parseFormNumber(form.moq),
      customBranding: form.customBranding,
      bulkTiers: parsedTiers.tiers,
      volume: form.volume.trim() || null,
      volumeUnit: form.volumeUnit.trim() || null,
      material: form.material.trim() || null,
      dimension: form.dimension.trim() || null,
      packSize: form.packSize.trim() || null,
    },
  };
};

export const addBulkTierRow = (rows: BulkTierForm[]): BulkTierForm[] =>
  rows.length >= MAX_BULK_TIERS ? rows : [...rows, emptyBulkTier()];

export const removeBulkTierRow = (rows: BulkTierForm[], index: number): BulkTierForm[] =>
  rows.length === 1 ? [emptyBulkTier()] : rows.filter((_, i) => i !== index);

export const validateCategoryInput = (
  name: string,
  code = '',
): { ok: true; name: string; code?: string } | { ok: false; error: string } => {
  if (!name.trim()) return { ok: false, error: 'Category name is required.' };
  const trimmedCode = code.trim();
  return { ok: true, name: name.trim(), ...(trimmedCode ? { code: trimmedCode } : {}) };
};
