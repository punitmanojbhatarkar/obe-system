const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
  contextId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicContext', required: true },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['CO_CHANGE', 'MAPPING_CHANGE', 'ATTAINMENT_LEVEL', 'MARKS_CORRECTION', 'OTHER'] },
  description: { type: String, required: true },
  proposedChange: { type: mongoose.Schema.Types.Mixed }, // JSON of proposed change
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  championComment: { type: String },
  reviewedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Suggestion', suggestionSchema);
