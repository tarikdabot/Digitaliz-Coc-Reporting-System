/**
 * Seed script: initializes admin user and settings only.
 * No sample/static students are seeded — all candidate data comes from real registrations.
 * Run: node server/seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Candidate = require('./models/Candidate');
const User = require('./models/User');
const Settings = require('./models/Settings');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear all existing data
  await Candidate.deleteMany({});
  await User.deleteMany({});
  await Settings.deleteMany({});
  console.log('🗑️  Cleared all existing data');

  // Seed default settings only
  await Settings.create({
    sigRegistrar:  'TARIK DABOT SEMAGN',
    sigAssessment: 'ZAKARIAS GENET',
    sigSupervisor: 'AYNALEM DEGNET',
    centerName:    'SHEWA BIRHAN COLLEGE',
    departments:   ['WEB DEVELOPMENT AND DATABASE ADMINSTRATION', 'Pharmacy', 'Accounting'],
  });
  console.log('✅ Seeded default settings');

  // Seed admin user only
  await User.create({ username: 'admin', password: 'admin123', role: 'admin' });
  console.log('✅ Seeded admin user (username: admin, password: admin123)');

  await mongoose.disconnect();
  console.log('✅ Done. No sample candidates — start fresh from the Registration page.');
}

seed().catch(console.error);
