import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BusyOverlay, { BusyLabel } from '../components/BusyOverlay.tsx';
import {
  useCategories,
  useCreateProduct,
  useProduct,
  useUpdateProduct,
  useUploadProductImage,
} from '../hooks/useProducts.ts';
import { getErrorMessage } from '../lib/getErrorMessage.ts';
import {
  addBulkTierRow,
  bulkTiersToForm,
  EMPTY_PRODUCT_FORM,
  emptyBulkTier,
  MAX_BULK_TIERS,
  PRODUCT_IMAGE_ACCEPT,
  productToForm,
  removeBulkTierRow,
  validateProductForm,
  validateProductImageFile,
  type BulkTierForm,
} from '../lib/products.ts';
import { routes } from '../routes.ts';
import type { ProductStatus } from '../types/api.ts';

const fieldClass =
  'w-full rounded-[6px] border border-line bg-white px-3 py-2.5 font-body text-[14px] text-ink outline-none focus:border-navy';
const labelClass = 'font-display text-[13px] font-bold text-navy';

export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const existing = useProduct(id);
  const categories = useCategories();
  const create = useCreateProduct();
  const update = useUpdateProduct();
  const uploadPhoto = useUploadProductImage();
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY_PRODUCT_FORM);
  const [tiers, setTiers] = useState<BulkTierForm[]>([emptyBulkTier()]);

  useEffect(() => {
    if (!existing.data) return;
    setForm(productToForm(existing.data));
    setTiers(bulkTiersToForm(existing.data.bulkTiers));
  }, [existing.data]);

  const onChange = (key: keyof typeof EMPTY_PRODUCT_FORM) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setError('');
      const value = event.target.type === 'checkbox' ? (event.target as HTMLInputElement).checked : event.target.value;
      setForm((current) => ({ ...current, [key]: value }));
    };

  const onTierChange = (index: number, key: keyof BulkTierForm) => (event: ChangeEvent<HTMLInputElement>) => {
    setError('');
    const value = event.target.value;
    setTiers((current) => current.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  };

  const onPhotoPick = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError('');
    const check = validateProductImageFile(file);
    if (!check.ok) {
      setError(check.error);
      return;
    }
    try {
      const res = await uploadPhoto.mutateAsync(file);
      setForm((current) => ({ ...current, image: res.data.url }));
    } catch (err) {
      setError(getErrorMessage(err, 'Could not upload this photo.'));
    }
  };

  const clearPhoto = () => {
    setError('');
    setForm((current) => ({ ...current, image: '' }));
  };

  const addTier = () => {
    setError('');
    setTiers((current) => addBulkTierRow(current));
  };

  const removeTier = (index: number) => {
    setError('');
    setTiers((current) => removeBulkTierRow(current, index));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    const parsed = validateProductForm(form, tiers);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    const body = parsed.body;
    try {
      if (isEdit && id) {
        await update.mutateAsync({ id, body });
        navigate(routes.product(id));
      } else {
        const res = await create.mutateAsync(body);
        navigate(routes.product(res.data.item.id));
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save this product.'));
    }
  };

  const uploading = uploadPhoto.isPending;
  const saving = create.isPending || update.isPending;
  const busy = uploading || saving;

  if (isEdit && existing.isLoading) {
    return (
      <div className="relative min-h-48 w-full min-w-0 max-w-4xl rounded-lg border border-line bg-white">
        <BusyOverlay label="Loading product…" />
      </div>
    );
  }

  return (
    <section className="w-full min-w-0 max-w-4xl">
      <Link to={routes.products} className="font-display text-[13px] font-bold text-navy">
        ← Products
      </Link>
      <form
        onSubmit={onSubmit}
        aria-busy={busy}
        className="relative mt-4 rounded-lg border border-line bg-white p-5 sm:p-8"
      >
        {saving ? <BusyOverlay label={isEdit ? 'Saving product…' : 'Creating product…'} /> : null}
        {error && (
          <p className="mb-4 font-body text-[13px] text-canam-red" role="alert">
            {error}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Product name" htmlFor="title">
            <input id="title" className={fieldClass} value={form.title} onChange={onChange('title')} required />
          </Field>
          <Field label="SKU" htmlFor="sku">
            <input id="sku" className={fieldClass} value={form.sku} onChange={onChange('sku')} required />
          </Field>
          <Field label="Category" htmlFor="categoryId">
            <select id="categoryId" className={fieldClass} value={form.categoryId} onChange={onChange('categoryId')} required>
              <option value="">Select category</option>
              {(categories.data ?? []).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status" htmlFor="status">
            <select id="status" className={fieldClass} value={form.status} onChange={onChange('status')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description" htmlFor="description">
              <textarea id="description" className={`${fieldClass} min-h-24`} value={form.description} onChange={onChange('description')} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Specs" htmlFor="specs">
              <input id="specs" className={fieldClass} value={form.specs} onChange={onChange('specs')} />
            </Field>
          </div>
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="product-photo">
              Product photo
            </label>
            <p className="font-body text-[12px] text-muted">JPG, PNG, WEBP, or GIF. Max 5MB. Uploads to Cloudinary.</p>
            <div className="relative mt-1 size-28 overflow-hidden rounded-[6px] border border-line bg-canvas">
              {form.image ? (
                <img src={form.image} alt="" className="size-full object-cover" />
              ) : null}
              {uploading ? <BusyOverlay label="Uploading…" /> : null}
            </div>
            <input
              id="product-photo"
              type="file"
              accept={PRODUCT_IMAGE_ACCEPT}
              disabled={busy}
              onChange={(event) => void onPhotoPick(event)}
              className="w-full max-w-md font-body text-[13px] text-ink file:mr-3 file:h-11 file:rounded-[6px] file:border file:border-line file:bg-canvas file:px-3 file:font-display file:text-[13px] file:font-bold file:text-navy"
            />
            {form.image && (
              <button
                type="button"
                className="self-start font-display text-[13px] font-bold text-navy disabled:opacity-50"
                onClick={clearPhoto}
                disabled={busy}
              >
                Remove photo
              </button>
            )}
            <Field label="Or paste image URL" htmlFor="image">
              <input
                id="image"
                className={fieldClass}
                value={form.image}
                onChange={onChange('image')}
                placeholder="https://"
              />
            </Field>
          </div>
          <Field label="Price" htmlFor="price">
            <input id="price" type="number" step="0.01" className={fieldClass} value={form.price} onChange={onChange('price')} required />
          </Field>
          <Field label="Unit price" htmlFor="priceUnit">
            <input id="priceUnit" type="number" step="0.01" className={fieldClass} value={form.priceUnit} onChange={onChange('priceUnit')} />
          </Field>
          <Field label="Carton price" htmlFor="priceCarton">
            <input id="priceCarton" type="number" step="0.01" className={fieldClass} value={form.priceCarton} onChange={onChange('priceCarton')} />
          </Field>
          <Field label="Pieces per carton" htmlFor="piecesPerCarton">
            <input id="piecesPerCarton" type="number" className={fieldClass} value={form.piecesPerCarton} onChange={onChange('piecesPerCarton')} />
          </Field>
          <Field label="MOQ" htmlFor="moq">
            <input id="moq" type="number" className={fieldClass} value={form.moq} onChange={onChange('moq')} />
          </Field>
          <Field label="Pack size" htmlFor="packSize">
            <input id="packSize" className={fieldClass} value={form.packSize} onChange={onChange('packSize')} />
          </Field>
          <Field label="Dimension" htmlFor="dimension">
            <input id="dimension" className={fieldClass} value={form.dimension} onChange={onChange('dimension')} />
          </Field>
          <Field label="Material" htmlFor="material">
            <input id="material" className={fieldClass} value={form.material} onChange={onChange('material')} />
          </Field>
          <Field label="Volume" htmlFor="volume">
            <input id="volume" className={fieldClass} value={form.volume} onChange={onChange('volume')} />
          </Field>
          <Field label="Volume unit" htmlFor="volumeUnit">
            <input id="volumeUnit" className={fieldClass} value={form.volumeUnit} onChange={onChange('volumeUnit')} />
          </Field>
          <label className="flex items-center gap-2 font-display text-[13px] font-bold text-navy sm:col-span-2">
            <input type="checkbox" checked={form.customBranding} onChange={onChange('customBranding')} />
            Custom branding available
          </label>
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <p className={labelClass}>Bulk price tiers</p>
              <button
                type="button"
                className="font-display text-[13px] font-bold text-navy disabled:opacity-40"
                onClick={addTier}
                disabled={tiers.length >= MAX_BULK_TIERS}
              >
                + Add tier
              </button>
            </div>
            <p className="mt-1 font-body text-[12px] text-muted">Up to {MAX_BULK_TIERS} quantity bands. Leave blank if unused.</p>
            <div className="mt-3 flex flex-col gap-2">
              {tiers.map((tier, index) => (
                <div key={index} className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
                  <input
                    aria-label={`Tier ${index + 1} min quantity`}
                    className={fieldClass}
                    inputMode="numeric"
                    placeholder="Min qty"
                    value={tier.minQty}
                    onChange={onTierChange(index, 'minQty')}
                  />
                  <input
                    aria-label={`Tier ${index + 1} max quantity`}
                    className={fieldClass}
                    inputMode="numeric"
                    placeholder="Max qty"
                    value={tier.maxQty}
                    onChange={onTierChange(index, 'maxQty')}
                  />
                  <input
                    aria-label={`Tier ${index + 1} unit price`}
                    className={fieldClass}
                    inputMode="decimal"
                    placeholder="Unit price"
                    value={tier.unitPrice}
                    onChange={onTierChange(index, 'unitPrice')}
                  />
                  <button
                    type="button"
                    className="h-11 rounded-[6px] border border-line px-3 font-display text-[13px] font-bold text-navy"
                    onClick={() => removeTier(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={busy}
            className="h-11 rounded-[6px] bg-canam-red px-4 font-display text-[13px] font-bold text-white disabled:opacity-70"
          >
            <BusyLabel
              pending={busy}
              pendingLabel={uploading ? 'Uploading photo…' : isEdit ? 'Saving…' : 'Creating…'}
              idle={isEdit ? 'Save changes' : 'Create product'}
            />
          </button>
          <Link
            to={isEdit && id ? routes.product(id) : routes.products}
            className="flex h-11 items-center justify-center px-4 font-display text-[13px] font-bold text-navy"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={labelClass} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}
