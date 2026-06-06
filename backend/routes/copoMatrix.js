const express = require('express');
const router = express.Router();
const COPOMatrix = require('../models/COPOMatrix');
const AcademicContext = require('../models/AcademicContext');
const { auth, requireContextAccess } = require('../middleware/auth');

router.use(auth);

router.get('/:contextId', requireContextAccess, async (req, res) => {
  try {
    const doc = await COPOMatrix.findOne({ contextId: req.params.contextId });
    res.json(doc || { matrix: [], averages: {} });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:contextId', requireContextAccess, async (req, res) => {
  try {
    const { matrix } = req.body;
    const poList = ['PO1','PO2','PO3','PO4','PO5','PO6','PO7','PO8','PO9','PO10','PO11','PSO1','PSO2','PSO3'];
    const averages = {};
    poList.forEach(po => {
      const vals = matrix.map(r => r[po]).filter(v => v && v > 0);
      averages[po] = vals.length ? parseFloat((vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2)) : null;
    });
    const doc = await COPOMatrix.findOneAndUpdate(
      { contextId: req.params.contextId },
      { contextId: req.params.contextId, matrix, averages, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    const ctx = await AcademicContext.findById(req.params.contextId);
    if (!ctx.completedSteps.includes('copo')) { ctx.completedSteps.push('copo'); await ctx.save(); }
    res.json(doc);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
