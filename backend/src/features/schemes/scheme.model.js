const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['income-support', 'insurance', 'soil-health', 'market-linkage', 'credit', 'equipment']
  },
  state: {
    type: String,
    required: true,
    default: 'national'
  },
  eligibility: [{
    type: String,
    required: true
  }],
  benefits: [{
    type: String,
    required: true
  }],
  requiredDocuments: [{
    type: String,
    required: true
  }],
  applicationProcess: [{
    type: String,
    required: true
  }],
  deadline: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'upcoming', 'closed'],
    default: 'active'
  },
  contactInfo: {
    helpline: String,
    website: String,
    email: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const applicationSchema = new mongoose.Schema({
  schemeId: {
    type: Number,
    required: true,
    ref: 'Scheme'
  },
  farmerName: {
    type: String,
    required: true
  },
  aadhaarNumber: {
    type: String,
    required: true,
    match: /^\d{12}$/
  },
  phoneNumber: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  landArea: {
    type: Number,
    required: true
  },
  annualIncome: Number,
  bankDetails: String,
  documents: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    required: true,
    enum: ['submitted', 'under-review', 'approved', 'rejected', 'pending-documents'],
    default: 'submitted'
  },
  applicationId: {
    type: String,
    required: true,
    unique: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: Date,
  approvedAt: Date,
  remarks: String,
  nextSteps: [{
    step: String,
    description: String,
    deadline: Date,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }]
});

schemeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

applicationSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'approved') {
    this.approvedAt = Date.now();
  }
  if (this.isModified('status') && ['approved', 'rejected'].includes(this.status)) {
    this.reviewedAt = Date.now();
  }
  next();
});

const Scheme = mongoose.model('Scheme', schemeSchema);
const Application = mongoose.model('Application', applicationSchema);

module.exports = { Scheme, Application };