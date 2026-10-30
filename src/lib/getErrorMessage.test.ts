import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getErrorMessage } from './getErrorMessage.ts';

describe('getErrorMessage', () => {
  it('prefers the API message, then a network-friendly copy, then the fallback', () => {
    assert.equal(
      getErrorMessage({ response: { data: { message: 'SKU already exists' } } }, 'Could not save.'),
      'SKU already exists',
    );
    assert.equal(
      getErrorMessage({ response: { data: { error: '  Missing category  ' } } }, 'Could not save.'),
      '  Missing category  ',
    );
    assert.equal(
      getErrorMessage({ message: 'Network Error' }, 'Could not save.'),
      'Network error. Please check your connection and try again.',
    );
    assert.equal(getErrorMessage({ message: 'timeout of 15000ms exceeded' }, 'Could not save.'), 'Network error. Please check your connection and try again.');
    assert.equal(getErrorMessage({ message: 'Request failed with status code 500' }, 'Could not save.'), 'Request failed with status code 500');
    assert.equal(getErrorMessage(null, 'Could not save.'), 'Could not save.');
    assert.equal(getErrorMessage({}, 'Could not save.'), 'Could not save.');
  });
});
