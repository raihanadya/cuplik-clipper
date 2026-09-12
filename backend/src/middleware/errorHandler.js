const errorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Ukuran file melebihi 1GB.' });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'ID tidak valid.' });
  }

  res.status(500).json({ error: 'Terjadi kesalahan server. Silakan coba lagi.' });
};

module.exports = errorHandler;
