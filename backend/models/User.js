const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  employeeId: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String },
  department: { type: String },
  designation: { type: String },
  password: { type: String },
  role: { type: String, enum: ['admin', 'champion', 'instructor'], default: null },
  isRegistered: { type: Boolean, default: false },
  assignedSubjects: [{
    contextId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicContext' },
    role: { type: String, enum: ['champion', 'instructor'] }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);