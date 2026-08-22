export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

export function isValidUsername(value) {
  return /^[A-Za-z0-9]{5,15}$/.test(String(value || ''));
}

export function isValidPassword(value) {
  const v = String(value || '');
  return v.length >= 5 && v.length <= 15;
}

export function isValidPhone(value) {
  return /^[0-9+\s-]{8,15}$/.test(String(value || '').trim());
}

export function isValidPhone10(value) {
  return /^[0-9]{10}$/.test(String(value || '').trim());
}

export function isValidAddress(value, maxLength = 100) {
  return String(value || '').trim().length <= maxLength;
}

export function required(value) {
  return String(value ?? '').trim().length > 0;
}
