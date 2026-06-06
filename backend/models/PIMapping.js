const mongoose = require('mongoose');

// Pre-defined PO structure for Pune University (11 POs + 3 PSOs)
const piMappingSchema = new mongoose.Schema({
  contextId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicContext', required: true },
  mappings: [{
    poNo: { type: String }, // 'PO1' to 'PO11', 'PSO1','PSO2','PSO3'
    subCompetencyNo: { type: String }, // '1.1', '1.2' etc
    subCompetencyDesc: { type: String },
    indicator: { type: String },
    coMapping: {
      CO1: { type: String, enum: ['Y', 'N', ''], default: 'N' },
      CO2: { type: String, enum: ['Y', 'N', ''], default: 'N' },
      CO3: { type: String, enum: ['Y', 'N', ''], default: 'N' },
      CO4: { type: String, enum: ['Y', 'N', ''], default: 'N' },
      CO5: { type: String, enum: ['Y', 'N', ''], default: 'N' },
      CO6: { type: String, enum: ['Y', 'N', ''], default: 'N' }
    }
  }],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PIMapping', piMappingSchema);
