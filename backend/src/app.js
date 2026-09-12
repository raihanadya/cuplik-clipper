const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');
const ENV = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');
const clipRoutes = require('./routes/clipRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { ensureDir } = require('./utils/fileUtils');

const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PATCH', 'DELETE'] }));

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/workspace', workspaceRoutes);
app.use('/api/v1/clips', clipRoutes);
app.use('/api/v1/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Error handler
app.use(errorHandler);

// File retention cron - setiap jam
cron.schedule('0 * * * *', async () => {
  console.log('[CRON] Running file retention cleanup...');
  try {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;

    const cleanupDir = (dir) => {
      if (!fs.existsSync(dir)) return 0;
      let removed = 0;
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.mtimeMs < cutoff) {
          fs.unlinkSync(filePath);
          removed++;
        }
      }
      return removed;
    };

    const uploadRemoved = cleanupDir(ENV.UPLOAD_DIR);
    const outputRemoved = cleanupDir(ENV.OUTPUT_DIR);
    console.log(`[CRON] Cleaned ${uploadRemoved} uploads, ${outputRemoved} outputs`);
  } catch (error) {
    console.error('[CRON] Cleanup error:', error);
  }
});

// Start server
const start = async () => {
  ensureDir(ENV.UPLOAD_DIR);
  ensureDir(ENV.OUTPUT_DIR);
  await connectDB();

  app.listen(ENV.PORT, () => {
    console.log(`Cuplik backend running on port ${ENV.PORT}`);
  });
};

start();

module.exports = app;
