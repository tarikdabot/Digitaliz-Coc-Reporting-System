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
