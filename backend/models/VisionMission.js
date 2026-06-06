const mongoose = require('mongoose');

const visionMissionSchema = new mongoose.Schema({
  contextId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicContext', required: true },
  institute: {
    vision: String,
    mission: String,
    qualityPolicy: String
  },
  department: {
    vision: String,
    mission: String,
    PEOs: [{ no: Number, statement: String }]
  },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VisionMission', visionMissionSchema);
