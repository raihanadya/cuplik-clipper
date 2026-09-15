export const MAX_UPLOAD_SIZE_BYTES = 1024 * 1024 * 1024; // 1 GB
export const MAX_VOCABULARY_LENGTH = 200; // 200 chars limit per backend contract

export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validatePassword(password) {
  if (!password || typeof password !== 'string') return false;
  if (password.length < 8) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  return hasUpper && hasLower && hasDigit && hasSymbol;
}

export function getPasswordValidationState(password) {
  const pwd = password || '';
  return {
    length: pwd.length >= 8,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    digit: /[0-9]/.test(pwd),
    symbol: /[^A-Za-z0-9]/.test(pwd),
    isValid: validatePassword(pwd),
  };
}

export function validateVideoFile(file) {
  if (!file) {
    return { valid: false, isValid: false, error: 'Silakan pilih file video untuk diunggah.' };
  }

  const validExtensions = ['.mp4', '.mov'];
  const fileName = (file.name || '').toLowerCase();
  const hasValidExt = validExtensions.some((ext) => fileName.endsWith(ext));

  if (!hasValidExt) {
    return {
      valid: false,
      isValid: false,
      error: 'Format file tidak didukung. Harap unggah video format .mp4 atau .mov.',
    };
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return {
      valid: false,
      isValid: false,
      error: 'Ukuran file melebihi batas maksimal 1 GB.',
    };
  }

  return { valid: true, isValid: true, error: null };
}

export function validateCustomVocabulary(vocab) {
  if (!vocab) return { valid: true, error: null };
  if (vocab.length > MAX_VOCABULARY_LENGTH) {
    return {
      valid: false,
      error: `Custom vocabulary maksimal ${MAX_VOCABULARY_LENGTH} karakter (saat ini ${vocab.length} karakter).`,
    };
  }
  return { valid: true, error: null };
}
