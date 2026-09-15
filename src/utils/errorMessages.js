export function getFriendlyErrorMessage(err, defaultFallback = 'Terjadi kesalahan. Silakan coba lagi.') {
  if (!err) return defaultFallback;

  if (typeof err === 'string') return err;

  if (err.message) {
    if (err.status === 401) {
      return 'Sesi Anda telah kedaluwarsa atau tidak valid. Silakan masuk kembali.';
    }
    if (err.status === 403) {
      return err.message || 'Akses ditolak. Anda tidak memiliki izin untuk tindakan ini.';
    }
    if (err.status === 404) {
      if (err.message.toLowerCase().includes('file') || err.message.toLowerCase().includes('not found')) {
        return 'File atau data yang diminta tidak ditemukan. Perlu diketahui bahwa file video fisik dihapus otomatis setelah 24 jam demi kebijakan retensi privasi.';
      }
      return err.message;
    }
    return err.message;
  }

  return defaultFallback;
}
