const express = require('express');
const router = express.Router();
const ActionReport = require('../models/ActionReport');
const Attainment = require('../models/Attainment');
const AcademicContext = require('../models/AcademicContext');
const { auth, requireContextAccess } = require('../middleware/auth');

router.use(auth);

router.get('/:contextId', requireContextAccess, async (req, res) => {
  try {
    const doc = await ActionReport.findOne({ contextId: req.params.contextId });
    if (!doc) {
      // Auto-generate structure from attainment data
      const attainment = await Attainment.findOne({ contextId: req.params.contextId });
      if (!attainment) return res.json({ highAttainment: [], lowAttainment: [] });
      const high = attainment.poAttainment.filter(p => p.percentAchievement >= 75 && p.target !== null);
      const low = attainment.poAttainment.filter(p => p.percentAchievement < 75 && p.target !== null);
      return res.json({
        highAttainment: high.map(p => ({ poNo: p.poNo, cosMapped: [], actionTaken: '', justification: '', planNextYear: '', driveLink: '' })),
        lowAttainment: low.map(p => ({ poNo: p.poNo, cosMapped: [], actionTaken: '', justification: '', planNextYear: '', driveLink: '' }))
      });
    }
    res.json(doc);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:contextId', requireContextAccess, async (req, res) => {
  try {
    const doc = await ActionReport.findOneAndUpdate(
      { contextId: req.params.contextId },
      { ...req.body, contextId: req.params.contextId, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    const ctx = await AcademicContext.findById(req.params.contextId);
    if (!ctx.completedSteps.includes('action')) { ctx.completedSteps.push('action'); await ctx.save(); }
    res.json(doc);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
