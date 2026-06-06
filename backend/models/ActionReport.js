const mongoose = require('mongoose');

const actionReportSchema = new mongoose.Schema({
  contextId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicContext', required: true },
  highAttainment: [{
    poNo: String,
    cosMapped: [String],
    actionTaken: String,
    justification: String,
    planNextYear: String,
    driveLink: String
  }],
  lowAttainment: [{
    poNo: String,
    cosMapped: [String],
    actionTaken: String,
    justification: String,
    planNextYear: String,
    driveLink: String
  }],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActionReport', actionReportSchema);
