const mongoose = require('mongoose');

const copoMatrixSchema = new mongoose.Schema({
  contextId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicContext', required: true },
  matrix: [{
    coNo: { type: String }, // CO1-CO6
    PO1: { type: Number }, PO2: { type: Number }, PO3: { type: Number },
    PO4: { type: Number }, PO5: { type: Number }, PO6: { type: Number },
    PO7: { type: Number }, PO8: { type: Number }, PO9: { type: Number },
    PO10: { type: Number }, PO11: { type: Number },
    PSO1: { type: Number }, PSO2: { type: Number }, PSO3: { type: Number }
  }],
  // Averages row auto-calculated
  averages: {
    PO1: Number, PO2: Number, PO3: Number, PO4: Number, PO5: Number,
    PO6: Number, PO7: Number, PO8: Number, PO9: Number, PO10: Number,
    PO11: Number, PSO1: Number, PSO2: Number, PSO3: Number
  },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('COPOMatrix', copoMatrixSchema);
