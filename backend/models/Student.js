const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  contextId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicContext', required: true },
  prn: { type: String, required: true },
  name: { type: String, required: true },
  division: { type: String },
  batch: { type: String },
  rollNo: { type: String },
  createdAt: { type: Date, default: Date.now }
});

studentSchema.index({ contextId: 1, prn: 1 }, { unique: true });

module.exports = mongoose.model('Student', studentSchema);
