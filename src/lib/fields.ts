export const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
export const MARKUP_PATTERN = /[<>]/;
export const EMAIL_MAX = 254;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;
export const NAME_MIN = 2;
export const NAME_MAX = 100;
export const PHONE_MIN_LENGTH = 7;
export const PHONE_MAX_LENGTH = 20;
export const PHONE_MIN_DIGITS = 7;
export const PHONE_MAX_DIGITS = 15;

export const normalizeEmail = (value: string): string => value.trim().toLowerCase();

export const hasMarkup = (value: string): boolean => MARKUP_PATTERN.test(value);

export const digitCount = (value: string): number => (value.match(/\d/g) || []).length;

export const validateEmailField = (
  value: string,
): { ok: true; email: string } | { ok: false; error: string } => {
  const email = normalizeEmail(value);
  if (!email) return { ok: false, error: 'Email is required.' };
  if (email.length > EMAIL_MAX) return { ok: false, error: `Email must be ${EMAIL_MAX} characters or fewer.` };
  if (!EMAIL_PATTERN.test(email)) return { ok: false, error: 'Please enter a valid email address.' };
  return { ok: true, email };
};

export const PHONE_ERROR = 'Enter a valid phone number (7 to 15 digits).';

/** Same rule as the backend `isValidPhone`: digits with + - ( ) . spaces, 7–15 digits, not all zeros. */
export const validatePhoneField = (
  value: string,
): { ok: true; phone: string } | { ok: false; error: string } => {
  const phone = value.trim();
  if (!phone) return { ok: false, error: 'Phone number is required.' };
  if (phone.length < PHONE_MIN_LENGTH || phone.length > PHONE_MAX_LENGTH) {
    return { ok: false, error: 'Phone number must be between 7 and 20 characters.' };
  }
  const digits = phone.replace(/\D/g, '');
  if (!/^\+?[\d\s().-]+$/.test(phone) || digits.length < PHONE_MIN_DIGITS || digits.length > PHONE_MAX_DIGITS) {
    return { ok: false, error: PHONE_ERROR };
  }
  if (!/[1-9]/.test(digits)) return { ok: false, error: PHONE_ERROR };
  return { ok: true, phone };
};

export const validateNameField = (
  value: string,
  label: string,
): { ok: true; value: string } | { ok: false; error: string } => {
  const trimmed = value.trim();
  if (!trimmed) return { ok: false, error: `${label} is required.` };
  if (trimmed.length < NAME_MIN) return { ok: false, error: `${label} must be at least ${NAME_MIN} characters.` };
  if (trimmed.length > NAME_MAX) return { ok: false, error: `${label} must be ${NAME_MAX} characters or fewer.` };
  if (hasMarkup(trimmed)) return { ok: false, error: `${label} contains invalid characters.` };
  return { ok: true, value: trimmed };
};

export const validatePasswordField = (
  value: string,
  required: boolean,
): { ok: true; password?: string } | { ok: false; error: string } => {
  if (!value) {
    if (required) return { ok: false, error: `Password must be at least ${PASSWORD_MIN} characters.` };
    return { ok: true };
  }
  if (value.length < PASSWORD_MIN) {
    return { ok: false, error: `Password must be at least ${PASSWORD_MIN} characters.` };
  }
  if (value.length > PASSWORD_MAX) {
    return { ok: false, error: `Password must be ${PASSWORD_MAX} characters or fewer.` };
  }
  return { ok: true, password: value };
};

export const parseRequiredNumber = (
  value: string,
  label: string,
): { ok: true; value: number } | { ok: false; error: string } => {
  const trimmed = value.trim();
  if (!trimmed) return { ok: false, error: `${label} is required.` };
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) return { ok: false, error: `${label} must be a valid number.` };
  if (parsed < 0) return { ok: false, error: `${label} cannot be negative.` };
  return { ok: true, value: parsed };
};

export const parseOptionalNonNegativeNumber = (
  value: string,
  label: string,
): { ok: true; value: number | null } | { ok: false; error: string } => {
  const trimmed = value.trim();
  if (!trimmed) return { ok: true, value: null };
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) return { ok: false, error: `${label} must be a valid number.` };
  if (parsed < 0) return { ok: false, error: `${label} cannot be negative.` };
  return { ok: true, value: parsed };
};

export const hasAtMostTwoDecimals = (value: number): boolean =>
  Math.abs(value * 100 - Math.round(value * 100)) < 1e-6;

/** Money as the API stores it: non-negative and at most 2 decimal places. */
export const parseOptionalMoney = (
  value: string,
  label: string,
): { ok: true; value: number | null } | { ok: false; error: string } => {
  const parsed = parseOptionalNonNegativeNumber(value, label);
  if (parsed.ok && parsed.value !== null && !hasAtMostTwoDecimals(parsed.value)) {
    return { ok: false, error: `${label} can have at most 2 decimal places.` };
  }
  return parsed;
};

export const parseRequiredMoney = (
  value: string,
  label: string,
): { ok: true; value: number } | { ok: false; error: string } => {
  const parsed = parseRequiredNumber(value, label);
  if (parsed.ok && !hasAtMostTwoDecimals(parsed.value)) {
    return { ok: false, error: `${label} can have at most 2 decimal places.` };
  }
  return parsed;
};

export const clampText = (
  value: string,
  label: string,
  max: number,
): { ok: true; value: string } | { ok: false; error: string } => {
  const trimmed = value.trim();
  if (trimmed.length > max) return { ok: false, error: `${label} must be ${max} characters or fewer.` };
  return { ok: true, value: trimmed };
};

export const clampPlainText = (
  value: string,
  label: string,
  max: number,
): { ok: true; value: string } | { ok: false; error: string } => {
  const clamped = clampText(value, label, max);
  if (!clamped.ok) return clamped;
  if (hasMarkup(clamped.value)) return { ok: false, error: `${label} contains invalid characters.` };
  return clamped;
};
