// src/components/validation.ts
export type Rule =
  | { type: 'required'; message?: string }
  | { type: 'email'; message?: string }
  | { type: 'minLength'; value: number; message?: string }
  | { type: 'maxLength'; value: number; message?: string }
  | { type: 'regex'; value: RegExp; message?: string };

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function runValidators(
  value: string,
  rules: Rule[] = [],
  inputType: 'text' | 'email' | 'password' | 'number' = 'text',
  required = false
): true | string {
  const val = (value ?? '').trim();

  if (required && val === '') {
    return 'This field is required';
  }

  for (const rule of rules) {
    switch (rule.type) {
      case 'required':
        if (val === '') return rule.message || 'This field is required';
        break;
      case 'email':
        if (val !== '' && !EMAIL_RX.test(val))
          return rule.message || 'Please enter a valid email address';
        break;
      case 'minLength':
        if (val.length < rule.value)
          return rule.message || `Must be at least ${rule.value} characters`;
        break;
      case 'maxLength':
        if (val.length > rule.value)
          return rule.message || `Must be at most ${rule.value} characters`;
        break;
      case 'regex':
        if (!rule.value.test(val))
          return rule.message || 'Invalid format';
        break;
    }
  }

  // sensible default for email inputs without explicit rule
  if (!rules.some(r => r.type === 'email') && inputType === 'email' && val !== '' && !EMAIL_RX.test(val)) {
    return 'Please enter a valid email address';
  }

  return true;
}

// --- Date rules ---
export type DateRule =
  | { type: 'minDate'; value: Date; message?: string }
  | { type: 'maxDate'; value: Date; message?: string };

export function runDateValidators(
  value: Date | null,
  rules: DateRule[] = [],
  required = false
): true | string {
  if (required && !value) return 'This field is required';
  if (!value) return true;

  for (const r of rules) {
    if (r.type === 'minDate' && value < r.value) return r.message || 'Date is too early';
    if (r.type === 'maxDate' && value > r.value) return r.message || 'Date is too late';
  }
  return true;
}

// --- Boolean rules (e.g., terms checkbox) ---
export type BoolRule =
  | { type: 'mustBeTrue'; message?: string }
  | { type: 'custom'; validate: (v: boolean) => boolean | string };

export function runBoolValidators(
  value: boolean,
  rules: BoolRule[] = [],
  required = false
): true | string {
  if (required && !value) return 'This field is required';
  for (const r of rules) {
    if (r.type === 'mustBeTrue' && !value) return r.message || 'Please confirm to continue';
    if (r.type === 'custom') {
      const res = r.validate(value);
      if (res !== true) return typeof res === 'string' ? res : 'Invalid';
    }
  }
  return true;
}


// --- Image rules (string url or null) ---
export type ImageRule =
  | { type: 'required'; message?: string }; // room to extend later: size, mime, ratio, width/height

export function runImageValidators(
  value: string | null,
  rules: ImageRule[] = [],
  required = false
): true | string {
  const has = !!value && String(value).trim() !== '';
  if (required && !has) return 'This field is required';

  for (const r of rules) {
    if (r.type === 'required' && !has) return r.message || 'This field is required';
  }
  return true;
}

// --- Select/Dropdown rules ---
export type SelectRule =
  | { type: 'required'; message?: string }
  | { type: 'in'; values: (string | number)[]; message?: string };

export function runSelectValidators(
  value: string | number | null | undefined,
  rules: SelectRule[] = [],
  required = false
): true | string {
  const empty = value === '' || value == null;
  if (required && empty) return 'This field is required';
  for (const r of rules) {
    if (r.type === 'required' && empty) return r.message || 'This field is required';
    if (r.type === 'in' && !empty && !r.values.includes(value as any)) {
      return r.message || 'Invalid selection';
    }
  }
  return true;
}