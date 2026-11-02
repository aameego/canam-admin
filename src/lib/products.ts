import type { BulkTier, Category, Product, ProductStatus } from '../types/api.ts';
import {
  clampPlainText,
  clampText,
  parseOptionalMoney,
  parseOptionalNonNegativeNumber,
  parseRequiredMoney,
} from './fields.ts';

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

export const PRODUCT_STATUSES: ProductStatus[] = ['active', 'inactive', 'draft'];

export const PRODUCT_TITLE_MAX = 200;
export const PRODUCT_SKU_MAX = 80;
export const PRODUCT_DESCRIPTION_MAX = 4000;
export const PRODUCT_SPECS_MAX = 1000;
export const PRODUCT_IMAGE_URL_MAX = 1000;
export const PRODUCT_VOLUME_MAX = 80;
export const PRODUCT_VOLUME_UNIT_MAX = 40;
export const PRODUCT_MATERIAL_MAX = 120;
export const PRODUCT_DIMENSION_MAX = 120;
export const PRODUCT_PACK_SIZE_MAX = 80;
export const CATEGORY_NAME_MAX = 120;
export const CATEGORY_CODE_MAX = 40;

export const isProductStatus = (value: string): value is ProductStatus =>
  PRODUCT_STATUSES.includes(value as ProductStatus);

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
  if (file.size <= 0 || file.size > PRODUCT_IMAGE_MAX_BYTES) {
    return { ok: false, error: file.size <= 0 ? 'Photo file is empty.' : PRODUCT_IMAGE_SIZE_ERROR };
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
    const minQty = parseOptionalNonNegativeNumber(row.minQty, 'Bulk tier min quantity');
    if (!minQty.ok) return minQty;
    const unitPrice = parseOptionalMoney(row.unitPrice, 'Bulk tier unit price');
    if (!unitPrice.ok) return unitPrice;
    const maxQty = parseOptionalNonNegativeNumber(row.maxQty, 'Bulk tier max quantity');
    if (!maxQty.ok) return maxQty;
    if (minQty.value === null || unitPrice.value === null) {
      return { ok: false, error: 'Each bulk tier needs a min quantity and unit price.' };
    }
    if (maxQty.value !== null && maxQty.value < minQty.value) {
      return { ok: false, error: 'Bulk tier max quantity cannot be below min quantity.' };
    }
    tiers.push({ minQty: minQty.value, maxQty: maxQty.value, unitPrice: unitPrice.value });
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
  inStock: boolean;
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
  inStock: true,
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
  inStock: product.inStock !== false,
  volume: product.volume || '',
  volumeUnit: product.volumeUnit || '',
  material: product.material || '',
  dimension: product.dimension || '',
  packSize: product.packSize || '',
});

const COPY_SKU_SUFFIX = '-COPY';

/** A new, unsaved draft prefilled from an existing product; nothing is created until the admin saves. */
export const duplicateProductForm = (product: Product): ProductFormValues => ({
  ...productToForm(product),
  title: `${product.title} (copy)`.slice(0, PRODUCT_TITLE_MAX),
  sku: `${product.sku.slice(0, PRODUCT_SKU_MAX - COPY_SKU_SUFFIX.length)}${COPY_SKU_SUFFIX}`,
  status: 'draft',
});

/** Visible categories for the product picker, plus the product's current one even when hidden. */
export const selectableCategories = (
  categories: Category[],
  currentId: string,
): Array<{ id: string; label: string }> =>
  categories
    .filter((category) => category.isActive || category.id === currentId)
    .map((category) => ({
      id: category.id,
      label: category.isActive ? category.name : `${category.name} (hidden)`,
    }));

export const productCountLabel = (count: number | undefined): string => {
  const n = count ?? 0;
  return `${n} ${n === 1 ? 'product' : 'products'}`;
};

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
  inStock: boolean;
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
  const title = clampPlainText(form.title, 'Product name', PRODUCT_TITLE_MAX);
  if (!title.ok) return title;
  if (title.value.length < 2) return { ok: false, error: 'Name, SKU, and category are required.' };
  const sku = clampPlainText(form.sku, 'SKU', PRODUCT_SKU_MAX);
  if (!sku.ok) return sku;
  if (sku.value.length < 2) return { ok: false, error: 'Name, SKU, and category are required.' };
  if (!form.categoryId.trim()) return { ok: false, error: 'Name, SKU, and category are required.' };
  if (!isProductStatus(form.status)) return { ok: false, error: 'Choose a valid product status.' };
  const price = parseRequiredMoney(form.price, 'Price');
  if (!price.ok) return price;
  const priceUnit = parseOptionalMoney(form.priceUnit, 'Unit price');
  if (!priceUnit.ok) return priceUnit;
  const priceCarton = parseOptionalMoney(form.priceCarton, 'Carton price');
  if (!priceCarton.ok) return priceCarton;
  const piecesPerCarton = parseOptionalNonNegativeNumber(form.piecesPerCarton, 'Pieces per carton');
  if (!piecesPerCarton.ok) return piecesPerCarton;
  const moq = parseOptionalNonNegativeNumber(form.moq, 'MOQ');
  if (!moq.ok) return moq;
  const description = clampPlainText(form.description, 'Description', PRODUCT_DESCRIPTION_MAX);
  if (!description.ok) return description;
  const specs = clampPlainText(form.specs, 'Specs', PRODUCT_SPECS_MAX);
  if (!specs.ok) return specs;
  const image = validateOptionalImageUrl(form.image);
  if (!image.ok) return image;
  const volume = clampPlainText(form.volume, 'Volume', PRODUCT_VOLUME_MAX);
  if (!volume.ok) return volume;
  const volumeUnit = clampPlainText(form.volumeUnit, 'Volume unit', PRODUCT_VOLUME_UNIT_MAX);
  if (!volumeUnit.ok) return volumeUnit;
  const material = clampPlainText(form.material, 'Material', PRODUCT_MATERIAL_MAX);
  if (!material.ok) return material;
  const dimension = clampPlainText(form.dimension, 'Dimension', PRODUCT_DIMENSION_MAX);
  if (!dimension.ok) return dimension;
  const packSize = clampPlainText(form.packSize, 'Pack size', PRODUCT_PACK_SIZE_MAX);
  if (!packSize.ok) return packSize;
  const parsedTiers = parseBulkTiers(tiers);
  if (!parsedTiers.ok) return parsedTiers;
  return {
    ok: true,
    body: {
      title: title.value,
      sku: sku.value,
      categoryId: form.categoryId.trim(),
      description: description.value,
      specs: specs.value,
      status: form.status,
      image: image.value,
      price: price.value,
      priceUnit: priceUnit.value,
      priceCarton: priceCarton.value,
      piecesPerCarton: piecesPerCarton.value,
      moq: moq.value,
      customBranding: Boolean(form.customBranding),
      inStock: form.inStock !== false,
      bulkTiers: parsedTiers.tiers,
      volume: volume.value || null,
      volumeUnit: volumeUnit.value || null,
      material: material.value || null,
      dimension: dimension.value || null,
      packSize: packSize.value || null,
    },
  };
};

export const addBulkTierRow = (rows: BulkTierForm[]): BulkTierForm[] =>
  rows.length >= MAX_BULK_TIERS ? rows : [...rows, emptyBulkTier()];

export const removeBulkTierRow = (rows: BulkTierForm[], index: number): BulkTierForm[] =>
  rows.length === 1 ? [emptyBulkTier()] : rows.filter((_, i) => i !== index);

export const validateOptionalImageUrl = (
  value: string,
): { ok: true; value: string } | { ok: false; error: string } => {
  const image = clampText(value, 'Image URL', PRODUCT_IMAGE_URL_MAX);
  if (!image.ok) return image;
  if (image.value && !/^https?:\/\//i.test(image.value)) {
    return { ok: false, error: 'Image URL must start with http:// or https://.' };
  }
  return { ok: true, value: image.value };
};

export const validateCategoryInput = (
  name: string,
  code = '',
  image = '',
): { ok: true; name: string; code?: string; image: string } | { ok: false; error: string } => {
  const parsedName = clampPlainText(name, 'Category name', CATEGORY_NAME_MAX);
  if (!parsedName.ok) return parsedName;
  if (parsedName.value.length < 2) return { ok: false, error: 'Category name is required.' };
  const parsedCode = clampPlainText(code, 'Category code', CATEGORY_CODE_MAX);
  if (!parsedCode.ok) return parsedCode;
  const parsedImage = validateOptionalImageUrl(image);
  if (!parsedImage.ok) return parsedImage;
  return {
    ok: true,
    name: parsedName.value,
    image: parsedImage.value,
    ...(parsedCode.value ? { code: parsedCode.value.toUpperCase() } : {}),
  };
};

export const validateProductStatusChange = (
  status: string,
): { ok: true; status: ProductStatus } | { ok: false; error: string } => {
  if (isProductStatus(status)) return { ok: true, status };
  return { ok: false, error: 'Choose a valid product status.' };
};
