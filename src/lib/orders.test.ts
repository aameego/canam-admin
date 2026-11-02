import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ORDER_NOTES_MAX,
  ORDER_STATUS_FILTERS,
  chartBarHeight,
  formatOrderDate,
  isOrderDirty,
  isOrderStatus,
  orderItemSummary,
  orderStatusClass,
  orderStatusLabel,
  orderTotals,
  validateOrderUpdate,
} from './orders.ts';
import type { OrderItem } from '../types/api.ts';

const item = (overrides: Partial<OrderItem> = {}): OrderItem => ({
  productId: 'p1',
  zohoItemId: 'p1',
  productName: 'Vinyl Gloves',
  sku: 'CA-GP-VG',
  categoryId: '',
  quantity: 2,
  unitPrice: 31,
  lineTotal: 62,
  isCustomBranding: false,
  brandingText: '',
  additionalInstruction: '',
  artworkUrl: '',
  artworkFileName: '',
  ...overrides,
});

describe('order labels', () => {
  it('maps statuses to Figma-style badge copy and colors', () => {
    assert.equal(orderStatusLabel('pending'), 'Pending');
    assert.equal(orderStatusLabel('shipped'), 'Shipped');
    assert.match(orderStatusClass('pending'), /#f59e0b/);
    assert.match(orderStatusClass('cancelled'), /canam-red/);
    assert.match(orderStatusClass('delivered'), /text-muted/);
    assert.deepEqual(
      ORDER_STATUS_FILTERS.map((filter) => filter.id),
      ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    );
  });

  it('summarizes line items and formats UTC dates', () => {
    assert.equal(orderItemSummary([]), 'No items');
    assert.equal(orderItemSummary([item()]), 'Vinyl Gloves × 2');
    assert.equal(orderItemSummary([item(), item({ productName: 'Cups' })]), 'Vinyl Gloves × 2 + 1 more');
    assert.equal(orderItemSummary([item({ productName: '', sku: 'CA-CUP', quantity: 0 })]), 'CA-CUP');
    assert.equal(formatOrderDate('2026-06-14T12:00:00.000Z'), 'Jun 14, 2026');
  });

  it('exposes money totals and a non-zero chart floor', () => {
    const totals = orderTotals({ subtotal: 62, discount: 0, gst: 3.1, total: 65.1 });
    assert.equal(totals[3]?.label, 'Total');
    assert.match(totals[3]?.value ?? '', /65\.10/);
    assert.equal(chartBarHeight(0, 10), 4);
    assert.equal(chartBarHeight(10, 10), 72);
    assert.equal(chartBarHeight(5, 0), 4);
    assert.equal(formatOrderDate('not-a-date'), '—');
    assert.equal(formatOrderDate(), '—');
  });
});

describe('order updates', () => {
  it('accepts a known status and trims notes', () => {
    const ok = validateOrderUpdate('shipped', '  Left at dock  ');
    assert.equal(ok.ok, true);
    if (ok.ok) {
      assert.equal(ok.body.status, 'shipped');
      assert.equal(ok.body.notes, 'Left at dock');
    }
  });

  it('rejects unknown statuses and oversized notes', () => {
    assert.equal(validateOrderUpdate('lost', '').ok, false);
    assert.equal(validateOrderUpdate('pending', 'x'.repeat(ORDER_NOTES_MAX + 1)).ok, false);
    assert.equal(isOrderStatus('delivered'), true);
    assert.equal(isOrderStatus('lost'), false);
  });

  it('detects dirty status or notes', () => {
    assert.equal(
      isOrderDirty({ status: 'pending', notes: '' }, { status: 'pending', notes: '' }),
      false,
    );
    assert.equal(
      isOrderDirty({ status: 'pending', notes: '' }, { status: 'confirmed', notes: '' }),
      true,
    );
    assert.equal(
      isOrderDirty({ status: 'pending', notes: '' }, { status: 'pending', notes: 'dock' }),
      true,
    );
    const blankNotes = validateOrderUpdate('cancelled', '   ');
    assert.equal(blankNotes.ok, true);
    if (blankNotes.ok) assert.equal(blankNotes.body.notes, '');
  });
});
