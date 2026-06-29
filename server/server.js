const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// CORS — allow all origins (handles both local dev and any Render deployment)
app.use(cors({ origin: true, credentials: true }));

app.use(express.json());

// API Routes
app.use('/api/candidates', require('./routes/candidateRoutes'));
app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/settings',   require('./routes/settingsRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// One-time setup: creates admin user + default settings if they don't exist
// Visit: /api/setup  — safe to call multiple times (idempotent)
app.get('/api/setup', async (req, res) => {
  try {
    const User     = require('./models/User');
    const Settings = require('./models/Settings');
    const results  = [];

    const existingUser = await User.findOne({ username: 'admin' });
    if (!existingUser) {
      await User.create({ username: 'admin', password: 'admin123', role: 'admin' });
      results.push('✅ Admin user created (admin / admin123)');
    } else {
      results.push('ℹ️ Admin user already exists');
    }

    const existingSettings = await Settings.findOne();
    if (!existingSettings) {
      await Settings.create({
        sigRegistrar:  'TARIK DABOT SEMAGN',
        sigAssessment: 'ZAKARIAS GENET',
        sigSupervisor: 'AYNALEM DEGNET',
        centerName:    'SHEWA BIRHAN COLLEGE',
        departments:   ['WEB DEVELOPMENT AND DATABASE ADMINSTRATION', 'Pharmacy', 'Accounting'],
      });
      results.push('✅ Default settings created');
    } else {
      results.push('ℹ️ Settings already exist');
    }

    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// MongoDB connection + server start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
