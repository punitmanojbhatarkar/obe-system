const mongoose = require('mongoose');

const attainmentConfigSchema = new mongoose.Schema({
  academicYear: { type: String, required: true, unique: true },
  level1: { type: Number, default: 65 },
  level2: { type: Number, default: 75 },
  level3: { type: Number, default: 85 },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AttainmentConfig', attainmentConfigSchema);
