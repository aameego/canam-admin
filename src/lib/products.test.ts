import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  addBulkTierRow,
  bulkTiersToForm,
  CATEGORY_CODE_MAX,
  CATEGORY_NAME_MAX,
  duplicateProductForm,
  EMPTY_PRODUCT_FORM,
  parseBulkTiers,
  PRODUCT_DESCRIPTION_MAX,
  PRODUCT_IMAGE_SIZE_ERROR,
  PRODUCT_IMAGE_TYPE_ERROR,
  PRODUCT_SKU_MAX,
  PRODUCT_STATUS_FILTERS,
  PRODUCT_TITLE_MAX,
  productCountLabel,
  productImageExtension,
  productStatusClass,
  productStatusLabel,
  productToForm,
  removeBulkTierRow,
  selectableCategories,
  validateCategoryInput,
  validateProductForm,
  validateProductImageFile,
  validateProductStatusChange,
} from './products.ts';
import { routes } from '../routes.ts';
import type { Product } from '../types/api.ts';

describe('product status helpers', () => {
  it('labels and colours each publication state', () => {
    assert.equal(productStatusLabel('active'), 'Active');
    assert.equal(productStatusLabel('inactive'), 'Inactive');
    assert.equal(productStatusLabel('draft'), 'Draft');
    assert.ok(productStatusClass('active').includes('10b981'));
    assert.ok(productStatusClass('draft').includes('f59e0b'));
    assert.ok(productStatusClass('inactive').includes('canam-red'));
    assert.deepEqual(
      PRODUCT_STATUS_FILTERS.map((filter) => filter.id),
      ['all', 'active', 'inactive', 'draft'],
    );
  });
});

describe('validateProductImageFile', () => {
  it('accepts a photo under 5MB', () => {
    assert.deepEqual(validateProductImageFile({ name: 'napkins.jpg', type: 'image/jpeg', size: 120_000 }), {
      ok: true,
    });
  });

  it('rejects svg, pdf, and oversized files', () => {
    assert.deepEqual(validateProductImageFile({ name: 'logo.svg', type: 'image/svg+xml', size: 100 }), {
      ok: false,
      error: PRODUCT_IMAGE_TYPE_ERROR,
    });
    assert.deepEqual(validateProductImageFile({ name: 'brief.pdf', type: 'application/pdf', size: 100 }), {
      ok: false,
      error: PRODUCT_IMAGE_TYPE_ERROR,
    });
    assert.deepEqual(
      validateProductImageFile({ name: 'huge.jpg', type: 'image/jpeg', size: 5 * 1024 * 1024 + 1 }),
      { ok: false, error: PRODUCT_IMAGE_SIZE_ERROR },
    );
    assert.equal(validateProductImageFile({ name: 'empty.jpg', type: 'image/jpeg', size: 0 }).ok, false);
    assert.equal(validateProductImageFile({ name: 'napkins.jpg', type: '', size: 120_000 }).ok, true);
    assert.equal(validateProductImageFile({ name: 'napkins.exe', type: '', size: 120_000 }).ok, false);
  });
});

describe('parseBulkTiers', () => {
  it('skips blank rows and keeps a valid min/max/price band', () => {
    const parsed = parseBulkTiers([
      { minQty: '', maxQty: '', unitPrice: '' },
      { minQty: '10', maxQty: '49', unitPrice: '0.38' },
      { minQty: '50', maxQty: '', unitPrice: '0.32' },
    ]);
    assert.equal(parsed.ok, true);
    if (parsed.ok) {
      assert.deepEqual(parsed.tiers, [
        { minQty: 10, maxQty: 49, unitPrice: 0.38 },
        { minQty: 50, maxQty: null, unitPrice: 0.32 },
      ]);
    }
  });

  it('rejects a max below min and incomplete rows', () => {
    const inverted = parseBulkTiers([{ minQty: '20', maxQty: '10', unitPrice: '1' }]);
    assert.equal(inverted.ok, false);
    const incomplete = parseBulkTiers([{ minQty: '10', maxQty: '', unitPrice: '' }]);
    assert.equal(incomplete.ok, false);
    assert.equal(parseBulkTiers([{ minQty: '-1', maxQty: '', unitPrice: '1' }]).ok, false);
    assert.equal(parseBulkTiers([{ minQty: '10', maxQty: '', unitPrice: 'abc' }]).ok, false);
  });

  it('round-trips stored tiers into the form', () => {
    const form = bulkTiersToForm([{ minQty: 10, maxQty: 49, unitPrice: 0.38 }]);
    assert.deepEqual(form, [{ minQty: '10', maxQty: '49', unitPrice: '0.38' }]);
    assert.deepEqual(bulkTiersToForm([]), [{ minQty: '', maxQty: '', unitPrice: '' }]);
  });

  it('caps bulk rows at five and never removes the last empty row', () => {
    const five = Array.from({ length: 5 }, () => ({ minQty: '1', maxQty: '', unitPrice: '1' }));
    assert.equal(addBulkTierRow(five).length, 5);
    assert.deepEqual(removeBulkTierRow([{ minQty: '1', maxQty: '', unitPrice: '1' }], 0), [
      { minQty: '', maxQty: '', unitPrice: '' },
    ]);
    const tooMany = parseBulkTiers(Array.from({ length: 6 }, () => ({ minQty: '1', maxQty: '', unitPrice: '1' })));
    assert.equal(tooMany.ok, false);
  });
});

describe('productImageExtension', () => {
  it('reads a lowercase extension and ignores missing names', () => {
    assert.equal(productImageExtension('photo.PNG'), 'png');
    assert.equal(productImageExtension('/tmp/folder/file.jpeg'), 'jpeg');
    assert.equal(productImageExtension('noext'), '');
  });
});

describe('validateProductForm', () => {
  const sample: Product = {
    id: 'p1',
    title: 'Napkins',
    sku: 'PD-63',
    zohoItemId: null,
    categoryId: 'cat-1',
    categoryCode: 'NAP',
    categoryName: 'Napkins',
    description: 'White',
    specs: '1-ply',
    status: 'active',
    image: 'https://img/n.jpg',
    piecesPerCarton: 100,
    priceCarton: 12,
    priceUnit: 0.12,
    price: 0.4,
    moq: 10,
    customBranding: true,
    inStock: false,
    bulkTiers: [{ minQty: 10, maxQty: 49, unitPrice: 0.38 }],
    volume: '500',
    volumeUnit: 'ml',
    material: 'paper',
    dimension: '10x10',
    packSize: '100',
  };

  it('requires name, SKU, category, and price', () => {
    assert.equal(validateProductForm(EMPTY_PRODUCT_FORM, []).ok, false);
    const noPrice = validateProductForm({ ...EMPTY_PRODUCT_FORM, title: 'Napkins', sku: 'PD-1', categoryId: 'c' }, []);
    assert.equal(noPrice.ok, false);
  });

  it('maps a stored product into a saveable write body', () => {
    const form = productToForm(sample);
    const parsed = validateProductForm(form, bulkTiersToForm(sample.bulkTiers));
    assert.equal(parsed.ok, true);
    if (parsed.ok) {
      assert.equal(parsed.body.title, 'Napkins');
      assert.equal(parsed.body.sku, 'PD-63');
      assert.equal(parsed.body.price, 0.4);
      assert.equal(parsed.body.customBranding, true);
      assert.equal(parsed.body.inStock, false);
      assert.equal(parsed.body.bulkTiers.length, 1);
    }
  });

  it('keeps the SKU as typed and rejects prices with more than 2 decimals', () => {
    const typed = validateProductForm({ ...productToForm(sample), sku: ' CA-BW-LCubBOT16-159 ' }, []);
    assert.equal(typed.ok, true);
    if (typed.ok) assert.equal(typed.body.sku, 'CA-BW-LCubBOT16-159');

    const base = productToForm(sample);
    const tooPrecise = validateProductForm({ ...base, price: '1.2345' }, []);
    assert.equal(tooPrecise.ok, false);
    if (!tooPrecise.ok) assert.equal(tooPrecise.error, 'Price can have at most 2 decimal places.');
    assert.equal(validateProductForm({ ...base, priceCarton: '72.555' }, []).ok, false);
    assert.equal(validateProductForm({ ...base, priceUnit: '0.075' }, []).ok, false);
    assert.equal(
      validateProductForm(base, [{ minQty: '10', maxQty: '', unitPrice: '0.125' }]).ok,
      false,
    );
    assert.equal(validateProductForm({ ...base, price: '72.55' }, []).ok, true);
  });

  it('rejects negative, garbage, and non-http image values', () => {
    const valid = { ...productToForm(sample), sku: ' pd-99 ', price: '1' };
    const saved = validateProductForm(valid, []);
    assert.equal(saved.ok, true);
    if (saved.ok) assert.equal(saved.body.sku, 'pd-99');

    assert.equal(validateProductForm({ ...valid, price: '-1' }, []).ok, false);
    assert.equal(validateProductForm({ ...valid, price: 'Infinity' }, []).ok, false);
    assert.equal(validateProductForm({ ...valid, moq: 'abc' }, []).ok, false);
    assert.equal(validateProductForm({ ...valid, piecesPerCarton: '-2' }, []).ok, false);
    assert.equal(validateProductForm({ ...valid, image: 'javascript:alert(1)' }, []).ok, false);
    assert.equal(validateProductForm({ ...valid, image: 'ftp://files/n.jpg' }, []).ok, false);
    assert.equal(validateProductForm({ ...valid, title: 'Cups <b>' }, []).ok, false);
    assert.equal(validateProductForm({ ...valid, sku: 'A' }, []).ok, false);
    assert.equal(validateProductForm({ ...valid, title: 'N' }, []).ok, false);
    assert.equal(validateProductForm({ ...valid, title: 'N'.repeat(PRODUCT_TITLE_MAX + 1) }, []).ok, false);
    assert.equal(validateProductForm({ ...valid, sku: 'S'.repeat(PRODUCT_SKU_MAX + 1) }, []).ok, false);
    assert.equal(validateProductForm({ ...valid, description: 'd'.repeat(PRODUCT_DESCRIPTION_MAX + 1) }, []).ok, false);
    assert.equal(validateProductForm({ ...valid, status: 'archived' as Product['status'] }, []).ok, false);
    assert.equal(validateProductForm({ ...valid, price: '0' }, []).ok, true);
    const httpImage = validateProductForm({ ...valid, image: 'http://cdn.example/n.jpg' }, []);
    assert.equal(httpImage.ok, true);
    assert.equal(validateProductStatusChange('active').ok, true);
    assert.equal(validateProductStatusChange('draft').ok, true);
    assert.equal(validateProductStatusChange('lost').ok, false);
  });

  it('prefills a duplicate as an unsaved draft copy', () => {
    const copy = duplicateProductForm(sample);
    assert.equal(copy.title, 'Napkins (copy)');
    assert.equal(copy.sku, 'PD-63-COPY');
    assert.equal(copy.status, 'draft');
    assert.equal(copy.price, '0.4');
    assert.equal(copy.image, sample.image);
    assert.equal(duplicateProductForm({ ...sample, sku: 'S'.repeat(PRODUCT_SKU_MAX) }).sku.length, PRODUCT_SKU_MAX);
    assert.equal(routes.productDuplicate('p1'), '/products/new?from=p1');
  });
});

describe('category pickers and counts', () => {
  const categories = [
    { id: 'a', name: 'Bags', code: 'BG', slug: 'bags', image: '', isActive: true },
    { id: 'b', name: 'Straws', code: 'ST', slug: 'straws', image: '', isActive: false },
  ];

  it('offers only visible categories, keeping a product’s current hidden one', () => {
    assert.deepEqual(
      selectableCategories(categories, '').map((row) => [row.id, row.label]),
      [['a', 'Bags']],
    );
    assert.deepEqual(
      selectableCategories(categories, 'b').map((row) => [row.id, row.label]),
      [
        ['a', 'Bags'],
        ['b', 'Straws (hidden)'],
      ],
    );
  });

  it('says 1 product, not 1 products', () => {
    assert.equal(productCountLabel(0), '0 products');
    assert.equal(productCountLabel(1), '1 product');
    assert.equal(productCountLabel(2), '2 products');
    assert.equal(productCountLabel(undefined), '0 products');
  });
});

describe('validateCategoryInput', () => {
  it('requires a name and keeps an optional code', () => {
    assert.equal(validateCategoryInput('  ').ok, false);
    const named = validateCategoryInput('  Napkins  ', '  NAP  ');
    assert.equal(named.ok, true);
    if (named.ok) {
      assert.equal(named.name, 'Napkins');
      assert.equal(named.code, 'NAP');
    }
    const noCode = validateCategoryInput('Bowls', '  ');
    assert.equal(noCode.ok, true);
    if (noCode.ok) assert.equal(noCode.code, undefined);
    const lowerCode = validateCategoryInput('Bowls', ' nap ');
    assert.equal(lowerCode.ok, true);
    if (lowerCode.ok) assert.equal(lowerCode.code, 'NAP');
    assert.equal(validateCategoryInput('A').ok, false);
    assert.equal(validateCategoryInput('Napkins <b>').ok, false);
    assert.equal(validateCategoryInput('N'.repeat(CATEGORY_NAME_MAX + 1)).ok, false);
    assert.equal(validateCategoryInput('Napkins', 'x'.repeat(CATEGORY_CODE_MAX + 1)).ok, false);
  });

  it('keeps an optional http(s) image URL and rejects javascript or ftp values', () => {
    const blank = validateCategoryInput('Napkins', 'NAP', '  ');
    assert.equal(blank.ok, true);
    if (blank.ok) assert.equal(blank.image, '');
    const ok = validateCategoryInput('Napkins', 'NAP', ' https://cdn.example/napkins.png ');
    assert.equal(ok.ok, true);
    if (ok.ok) assert.equal(ok.image, 'https://cdn.example/napkins.png');
    assert.equal(validateCategoryInput('Napkins', 'NAP', 'javascript:alert(1)').ok, false);
    assert.equal(validateCategoryInput('Napkins', 'NAP', 'ftp://files/n.jpg').ok, false);
  });
});
