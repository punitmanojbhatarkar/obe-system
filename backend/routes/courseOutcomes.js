const express = require('express');
const router = express.Router();
const CourseOutcome = require('../models/CourseOutcome');
const AcademicContext = require('../models/AcademicContext');
const { auth, requireContextAccess } = require('../middleware/auth');

router.use(auth);

router.get('/:contextId', requireContextAccess, async (req, res) => {
  try {
    const doc = await CourseOutcome.findOne({ contextId: req.params.contextId });
    if (!doc) {
      // Return default empty COs
      const defaults = ['CO1','CO2','CO3','CO4','CO5','CO6'].map(coNo => ({
        coNo, statement: '', bloomsLevel: '', targetPercent: 55,
        assessedIn: { IA: true, MSE: true, ESE: true }, isActive: false
      }));
      return res.json({ cos: defaults });
    }
    res.json(doc);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:contextId', requireContextAccess, async (req, res) => {
  try {
    const { cos } = req.body;
    const processed = cos.map(co => ({
      ...co,
      isActive: !!(co.statement && co.statement.trim())
    }));
    const doc = await CourseOutcome.findOneAndUpdate(
      { contextId: req.params.contextId },
      { contextId: req.params.contextId, cos: processed, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    const ctx = await AcademicContext.findById(req.params.contextId);
    if (!ctx.completedSteps.includes('cos')) { ctx.completedSteps.push('cos'); await ctx.save(); }
    res.json(doc);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
