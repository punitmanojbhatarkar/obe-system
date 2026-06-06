const mongoose = require('mongoose');

const academicContextSchema = new mongoose.Schema({
  academicYear: { type: String, required: true },
  branch: { type: String, required: true },
  semester: { type: String, required: true },
  subjectName: { type: String, required: true },
  subjectCode: { type: String, required: true },
  class: { type: String }, // e.g. TY BTech
  divisions: [{ type: String }], // ['A', 'B']
  batches: [{ type: String }], // ['A1', 'A2']
  champion: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  instructors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lecturesPerWeek: { type: Number, default: 3 },
  examScheme: {
    IA: { type: Number, default: 30 },
    MSE: { type: Number, default: 20 },
    ESE: { type: Number, default: 50 }
  },
  isActive: { type: Boolean, default: true },
  completedSteps: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

academicContextSchema.index({ academicYear: 1, branch: 1, semester: 1, subjectCode: 1 }, { unique: true });

module.exports = mongoose.model('AcademicContext', academicContextSchema);
