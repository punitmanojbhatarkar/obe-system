const express = require('express');
const router = express.Router();
const PIMapping = require('../models/PIMapping');
const COPOMatrix = require('../models/COPOMatrix');
const AcademicContext = require('../models/AcademicContext');
const { auth, requireContextAccess } = require('../middleware/auth');
const { calculateCOPOFromPI } = require('../utils/attainmentCalculator');
const { DEFAULT_PI_TEMPLATE } = require('../utils/puneUniversityData');

router.use(auth);

router.get('/:contextId', requireContextAccess, async (req, res) => {
  try {
    let doc = await PIMapping.findOne({ contextId: req.params.contextId });
    if (!doc) {
      // Return default template
      return res.json({ mappings: DEFAULT_PI_TEMPLATE.map(t => ({ ...t, coMapping: { CO1:'N',CO2:'N',CO3:'N',CO4:'N',CO5:'N',CO6:'N' } })) });
    }
    res.json(doc);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:contextId', requireContextAccess, async (req, res) => {
  try {
    const { mappings } = req.body;
    const doc = await PIMapping.findOneAndUpdate(
      { contextId: req.params.contextId },
      { contextId: req.params.contextId, mappings, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    // Auto-calculate and update CO-PO matrix
    const copoMatrix = calculateCOPOFromPI(mappings);
    const avgRow = {};
    ['PO1','PO2','PO3','PO4','PO5','PO6','PO7','PO8','PO9','PO10','PO11','PSO1','PSO2','PSO3'].forEach(po => {
      const vals = copoMatrix.map(r => r[po]).filter(v => v && v > 0);
      avgRow[po] = vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : null;
    });
    await COPOMatrix.findOneAndUpdate(
      { contextId: req.params.contextId },
      { contextId: req.params.contextId, matrix: copoMatrix, averages: avgRow, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    const ctx = await AcademicContext.findById(req.params.contextId);
    if (!ctx.completedSteps.includes('pi')) { ctx.completedSteps.push('pi'); await ctx.save(); }
    res.json(doc);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
