import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  applyListFilter,
  applyListPage,
  applyListSearch,
  parseAccountStatusFilter,
  parsePageParam,
  parseProductStatusFilter,
  parseRangeFilter,
} from './listQuery.ts';

describe('parsePageParam', () => {
  it('defaults to page 1 and rejects garbage', () => {
    assert.equal(parsePageParam(null), 1);
    assert.equal(parsePageParam('3'), 3);
    assert.equal(parsePageParam('0'), 1);
    assert.equal(parsePageParam('-2'), 1);
    assert.equal(parsePageParam('nope'), 1);
  });
});

describe('status and range filters', () => {
  it('clamps unknown product and customer statuses to all', () => {
    assert.equal(parseProductStatusFilter('draft'), 'draft');
    assert.equal(parseProductStatusFilter('inactive'), 'inactive');
    assert.equal(parseProductStatusFilter('bogus'), 'all');
    assert.equal(parseAccountStatusFilter('pending'), 'pending');
    assert.equal(parseAccountStatusFilter('blocked'), 'all');
    assert.equal(parseRangeFilter('30d'), '30d');
    assert.equal(parseRangeFilter('7d'), '');
  });
});

describe('list URL updates', () => {
  it('writes a trimmed search and resets to page 1', () => {
    const next = applyListSearch(new URLSearchParams('page=4&status=active'), '  napkins  ');
    assert.equal(next.get('q'), 'napkins');
    assert.equal(next.get('page'), '1');
    assert.equal(next.get('status'), 'active');
  });

  it('clears an empty search', () => {
    const next = applyListSearch(new URLSearchParams('q=old&page=2'), '   ');
    assert.equal(next.has('q'), false);
    assert.equal(next.get('page'), '1');
  });

  it('applies a filter, resets page, and drops range unless pending', () => {
    const products = applyListFilter(new URLSearchParams('page=5&q=cups'), 'status', 'draft');
    assert.equal(products.get('status'), 'draft');
    assert.equal(products.get('page'), '1');

    const all = applyListFilter(new URLSearchParams('status=draft&page=2'), 'status', 'all');
    assert.equal(all.has('status'), false);

    const leavingPending = applyListFilter(
      new URLSearchParams('status=pending&range=30d&page=2'),
      'status',
      'approved',
    );
    assert.equal(leavingPending.get('status'), 'approved');
    assert.equal(leavingPending.has('range'), false);

    const stayingPending = applyListFilter(new URLSearchParams('range=30d'), 'status', 'pending');
    assert.equal(stayingPending.get('range'), '30d');
  });

  it('changes only the page', () => {
    const next = applyListPage(new URLSearchParams('q=cups&status=active'), 4);
    assert.equal(next.get('page'), '4');
    assert.equal(next.get('q'), 'cups');
  });
});
