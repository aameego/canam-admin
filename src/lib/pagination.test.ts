import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { paginationItems } from './pagination.ts';

describe('paginationItems', () => {
  it('returns nothing when there are no pages', () => {
    assert.deepEqual(paginationItems(1, 0), []);
  });

  it('shows every page when the list is short', () => {
    assert.deepEqual(paginationItems(1, 1), [1]);
    assert.deepEqual(paginationItems(3, 7), [1, 2, 3, 4, 5, 6, 7]);
  });

  it('keeps the first three, last three, and an ellipsis on page 1 of a long list', () => {
    assert.deepEqual(paginationItems(1, 37), [1, 2, 3, 'ellipsis', 35, 36, 37]);
  });

  it('shows neighbours around the current page with ellipsis on both sides', () => {
    assert.deepEqual(paginationItems(15, 32), [1, 2, 3, 'ellipsis', 14, 15, 16, 'ellipsis', 30, 31, 32]);
  });

  it('does not insert an ellipsis when the current window touches the start', () => {
    assert.deepEqual(paginationItems(4, 37), [1, 2, 3, 4, 5, 'ellipsis', 35, 36, 37]);
  });

  it('clamps an out-of-range page to the last page', () => {
    assert.deepEqual(paginationItems(99, 10), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
});
