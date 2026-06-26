const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  sigRegistrar:  { type: String, default: 'TARIK DABOT SEMAGN' },
  sigAssessment: { type: String, default: 'ZAKARIAS GENET' },
  sigSupervisor: { type: String, default: 'AYNALEM DEGNET' },
  centerName:    { type: String, default: 'SHEWA BIRHAN COLLEGE' },
  departments: {
    type: [String],
    default: [
      'WEB DEVELOPMENT AND DATABASE ADMINSTRATION',
      'Pharmacy',
      'Accounting',
    ],
  },
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
