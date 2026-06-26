const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema(
  {
    // Personal Info
    firstName:  { type: String, required: true, trim: true },
    middleName: { type: String, trim: true, default: '' },
    lastName:   { type: String, required: true, trim: true },
    sex:        { type: String, enum: ['Male', 'Female'], required: true },
    age:        { type: Number },
    occupation: { type: String, trim: true, default: '' },
    occLevel:   { type: String, trim: true, default: '' },
    regDate:    { type: String, default: '' },

    // Location
    region: { type: String, default: '' },
    zone:   { type: String, default: '' },
    wereda: { type: String, default: '' },
    mobile: { type: String, default: '' },

    // Institution
    institution:        { type: String, default: 'SHEWA BIRHAN COLLEGE', uppercase: true, trim: true },
    institutionAddress: { type: String, default: '' },
    dept: {
      type: String,
      required: true,
      default: 'WEB DEVELOPMENT AND DATABASE ADMINSTRATION',
    },
    owner: {
      type: String,
      enum: ['Government', 'Private', 'NGO', 'Other'],
      default: 'Private',
    },
    prog: {
      type: String,
      enum: ['Regular', 'Extension', 'Distance', 'Non-formal'],
      default: 'Regular',
    },

    // Employment
    emp: {
      type: String,
      enum: ['Government', 'Private Sector', 'Self Employment', 'Unemployment'],
      default: 'Unemployment',
    },
    empType:        { type: String, default: '' },
    enterpriseSize: { type: String, default: '' },

    // Assessment
    assessmentType: { type: String, enum: ['First Time', 'Re-assessment'], default: 'First Time' },
    status: {
      type: String,
      enum: ['Registered', 'Assessed', 'NotAssessed', 'Competent', 'Non-Competent'],
      default: 'Registered',
    },
    failType: {
      type: String,
      enum: ['', 'Only Knowledge', 'Only Practice', 'Both'],
      default: '',
    },

    // Units of Competency (auto-set when Competent)
    unitsOfCompetency: {
      uc1: { type: Boolean, default: false },
      uc2: { type: Boolean, default: false },
      uc3: { type: Boolean, default: false },
      uc4: { type: Boolean, default: false },
      uc5: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Virtual: full name
CandidateSchema.virtual('name').get(function () {
  return [this.firstName, this.middleName, this.lastName]
    .filter(Boolean)
    .join(' ')
    .toUpperCase();
});

CandidateSchema.set('toJSON', { virtuals: true });
CandidateSchema.set('toObject', { virtuals: true });

// Auto-set UCs when status becomes Competent
CandidateSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'Competent') {
    this.unitsOfCompetency = { uc1: true, uc2: true, uc3: true, uc4: true, uc5: true };
    this.failType = '';
  }
  if (this.isModified('status') && this.status !== 'Non-Competent') {
    if (this.status !== 'Non-Competent') this.failType = '';
  }
  next();
});

module.exports = mongoose.model('Candidate', CandidateSchema);
