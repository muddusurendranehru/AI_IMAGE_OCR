/**
 * Normalize and validate India mobile numbers for patient_assessments.
 * Strips non-digits; uses last 10 digits when longer (e.g. +91 prefix).
 */
function normalizeIndiaMobile(raw) {
  if (raw == null || String(raw).trim() === '') {
    return {
      ok: false,
      error: 'Mobile number is required. Enter a valid 10-digit India mobile number.'
    };
  }

  const digits = String(raw).replace(/\D/g, '');
  const mobile = digits.length > 10 ? digits.slice(-10) : digits;

  if (mobile.length !== 10) {
    return {
      ok: false,
      error: 'Invalid mobile number. Enter a valid 10-digit India mobile number.'
    };
  }

  if (!/^[6-9]\d{9}$/.test(mobile)) {
    return {
      ok: false,
      error: 'Invalid mobile number. India mobile numbers must be 10 digits starting with 6–9.'
    };
  }

  return { ok: true, mobile };
}

module.exports = { normalizeIndiaMobile };
