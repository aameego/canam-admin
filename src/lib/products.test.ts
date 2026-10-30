import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  addBulkTierRow,
  bulkTiersToForm,
  EMPTY_PRODUCT_FORM,
  parseBulkTiers,
  parseFormNumber,
  PRODUCT_IMAGE_SIZE_ERROR,
  PRODUCT_IMAGE_TYPE_ERROR,
  PRODUCT_STATUS_FILTERS,
  productImageExtension,
  productStatusClass,
  productStatusLabel,
  productToForm,
  removeBulkTierRow,
  validateCategoryInput,
  validateProductForm,
  validateProductImageFile,
} from './products.ts';
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

describe('parseFormNumber', () => {
  it('treats blank as null and rejects garbage', () => {
    assert.equal(parseFormNumber(''), null);
    assert.equal(parseFormNumber('12.5'), 12.5);
    assert.equal(parseFormNumber('nope'), null);
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
    bulkTiers: [{ minQty: 10, maxQty: 49, unitPrice: 0.38 }],
    volume: '500',
    volumeUnit: 'ml',
    material: 'paper',
    dimension: '10x10',
    packSize: '100',
  };

  it('requires name, SKU, category, and price', () => {
    assert.equal(validateProductForm(EMPTY_PRODUCT_FORM, []).ok, false);
    const noPrice = validateProductForm({ ...EMPTY_PRODUCT_FORM, title: 'N', sku: 'S', categoryId: 'c' }, []);
    assert.equal(noPrice.ok, false);
  });

  it('maps a stored product into a saveable write body', () => {
    const form = productToForm(sample);
    const parsed = validateProductForm(form, bulkTiersToForm(sample.bulkTiers));
    assert.equal(parsed.ok, true);
    if (parsed.ok) {
      assert.equal(parsed.body.title, 'Napkins');
      assert.equal(parsed.body.price, 0.4);
      assert.equal(parsed.body.customBranding, true);
      assert.equal(parsed.body.bulkTiers.length, 1);
    }
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
  });
});
