const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  employeeId: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String },
  department: { type: String },
  designation: { type: String },
  password: { type: String },
  role: { type: String, enum: ['admin', 'champion', 'instructor'], default: null },
  isRegistered: { type: Boolean, default: false }, // admin approved
  assignedSubjects: [{
    contextId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicContext' },
    role: { type: String, enum: ['champion', 'instructor'] }
  }],
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
