const express = require('express');
const router = express.Router();
const VisionMission = require('../models/VisionMission');
const AcademicContext = require('../models/AcademicContext');
const { auth, requireContextAccess } = require('../middleware/auth');

router.use(auth);

router.get('/:contextId', requireContextAccess, async (req, res) => {
  try {
    const vm = await VisionMission.findOne({ contextId: req.params.contextId });
    res.json(vm || {});
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:contextId', requireContextAccess, async (req, res) => {
  try {
    const vm = await VisionMission.findOneAndUpdate(
      { contextId: req.params.contextId },
      { ...req.body, contextId: req.params.contextId, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    const ctx = await AcademicContext.findById(req.params.contextId);
    if (!ctx.completedSteps.includes('vision')) { ctx.completedSteps.push('vision'); await ctx.save(); }
    res.json(vm);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
