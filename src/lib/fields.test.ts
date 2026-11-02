import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  EMAIL_MAX,
  NAME_MAX,
  PASSWORD_MAX,
  PASSWORD_MIN,
  clampPlainText,
  clampText,
  digitCount,
  hasMarkup,
  normalizeEmail,
  parseOptionalNonNegativeNumber,
  parseRequiredNumber,
  validateEmailField,
  validateNameField,
  validatePasswordField,
  validatePhoneField,
} from './fields.ts';

describe('normalizeEmail', () => {
  it('trims and lowercases', () => {
    assert.equal(normalizeEmail('  Pat@Cafe.COM '), 'pat@cafe.com');
  });
});

describe('validateEmailField', () => {
  it('accepts a normal business email', () => {
    const ok = validateEmailField('  Manager@can-am.ca ');
    assert.equal(ok.ok, true);
    if (ok.ok) assert.equal(ok.email, 'manager@can-am.ca');
  });

  it('rejects blank, malformed, and oversized values', () => {
    assert.equal(validateEmailField('').ok, false);
    assert.equal(validateEmailField('   ').ok, false);
    assert.equal(validateEmailField('not-an-email').ok, false);
    assert.equal(validateEmailField('pat@cafe').ok, false);
    assert.equal(validateEmailField(`${'a'.repeat(EMAIL_MAX)}@x.com`).ok, false);
    assert.equal(validateEmailField('pat@cafe.').ok, false);
    assert.equal(validateEmailField('@cafe.com').ok, false);
  });
});

describe('validatePhoneField', () => {
  it('accepts formatted North American numbers', () => {
    const ok = validatePhoneField('  +1 416-555-0101 ');
    assert.equal(ok.ok, true);
    if (ok.ok) assert.equal(ok.phone, '+1 416-555-0101');
  });

  it('rejects missing, short, long, and digit-less values', () => {
    assert.equal(validatePhoneField('').ok, false);
    assert.equal(validatePhoneField('555').ok, false);
    assert.equal(validatePhoneField('.......').ok, false);
    assert.equal(validatePhoneField('123456789012345678901').ok, false);
    assert.equal(digitCount('+1 416-555-0101'), 11);
    assert.equal(validatePhoneField('1234567').ok, true);
    assert.equal(validatePhoneField('123456').ok, false);
  });

  it('matches the backend rule: no letters, not all zeros, 7 to 15 digits', () => {
    const letters = validatePhoneField('abcdefgh');
    assert.equal(letters.ok, false);
    if (!letters.ok) assert.equal(letters.error, 'Enter a valid phone number (7 to 15 digits).');
    assert.equal(validatePhoneField('604555abcd').ok, false);
    assert.equal(validatePhoneField('0000000000').ok, false);
    assert.equal(validatePhoneField('1234567890123456').ok, false);
    assert.equal(validatePhoneField('604+5550199').ok, false);
    assert.equal(validatePhoneField('(604) 555.0199').ok, true);
  });
});

describe('validateNameField', () => {
  it('trims a valid name', () => {
    const ok = validateNameField('  Coastline Diner  ', 'Business name');
    assert.equal(ok.ok, true);
    if (ok.ok) assert.equal(ok.value, 'Coastline Diner');
  });

  it('rejects blank, short, long, and markup names', () => {
    assert.equal(validateNameField('  ', 'Business name').ok, false);
    assert.equal(validateNameField('A', 'Contact name').ok, false);
    assert.equal(validateNameField('A'.repeat(NAME_MAX + 1), 'Contact name').ok, false);
    assert.equal(validateNameField('AB', 'Contact name').ok, true);
    assert.equal(validateNameField('Cafe <script>', 'Business name').ok, false);
    assert.equal(hasMarkup('ok'), false);
  });
});

describe('validatePasswordField', () => {
  it('requires 8–128 characters when the field is required', () => {
    assert.equal(validatePasswordField('', true).ok, false);
    assert.equal(validatePasswordField('short', true).ok, false);
    assert.equal(validatePasswordField('a'.repeat(PASSWORD_MAX + 1), true).ok, false);
    assert.equal(validatePasswordField('a'.repeat(PASSWORD_MIN), true).ok, true);
    assert.equal(validatePasswordField('a'.repeat(PASSWORD_MAX), true).ok, true);
    const ok = validatePasswordField('Secret123', true);
    assert.equal(ok.ok, true);
    if (ok.ok) assert.equal(ok.password, 'Secret123');
  });

  it('allows a blank password on edit and still validates a typed one', () => {
    assert.equal(validatePasswordField('', false).ok, true);
    assert.equal(validatePasswordField('short', false).ok, false);
  });
});

describe('number parsers', () => {
  it('requires a finite non-negative number', () => {
    assert.equal(parseRequiredNumber('', 'Price').ok, false);
    assert.equal(parseRequiredNumber('nope', 'Price').ok, false);
    assert.equal(parseRequiredNumber('-1', 'Price').ok, false);
    assert.equal(parseRequiredNumber('Infinity', 'Price').ok, false);
    const ok = parseRequiredNumber(' 12.50 ', 'Price');
    assert.equal(ok.ok, true);
    if (ok.ok) assert.equal(ok.value, 12.5);
  });

  it('treats blank optional numbers as null and rejects garbage', () => {
    assert.deepEqual(parseOptionalNonNegativeNumber('', 'MOQ'), { ok: true, value: null });
    assert.equal(parseOptionalNonNegativeNumber('abc', 'MOQ').ok, false);
    assert.equal(parseOptionalNonNegativeNumber('-2', 'MOQ').ok, false);
    const ok = parseOptionalNonNegativeNumber('0', 'MOQ');
    assert.equal(ok.ok, true);
    if (ok.ok) assert.equal(ok.value, 0);
  });
});

describe('clampText', () => {
  it('trims and enforces a max length', () => {
    assert.deepEqual(clampText('  hello  ', 'Specs', 10), { ok: true, value: 'hello' });
    assert.equal(clampText('x'.repeat(11), 'Specs', 10).ok, false);
  });
});

describe('clampPlainText', () => {
  it('rejects markup while keeping a clean value', () => {
    assert.deepEqual(clampPlainText('  paper  ', 'Material', 20), { ok: true, value: 'paper' });
    assert.equal(clampPlainText('paper <b>', 'Material', 20).ok, false);
    assert.equal(clampPlainText('x'.repeat(21), 'Material', 20).ok, false);
  });
});
