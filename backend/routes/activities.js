const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const AcademicContext = require('../models/AcademicContext');
const { auth, requireContextAccess } = require('../middleware/auth');

router.use(auth);

router.get('/:contextId', requireContextAccess, async (req, res) => {
  try {
    const doc = await Activity.findOne({ contextId: req.params.contextId });
    res.json(doc || { activities: [] });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:contextId', requireContextAccess, async (req, res) => {
  try {
    const { activities } = req.body;
    const doc = await Activity.findOneAndUpdate(
      { contextId: req.params.contextId },
      { contextId: req.params.contextId, activities, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    const ctx = await AcademicContext.findById(req.params.contextId);
    if (!ctx.completedSteps.includes('activities')) { ctx.completedSteps.push('activities'); await ctx.save(); }
    res.json(doc);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:contextId/:activityId', requireContextAccess, async (req, res) => {
  try {
    const doc = await Activity.findOne({ contextId: req.params.contextId });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    doc.activities = doc.activities.filter(a => a._id.toString() !== req.params.activityId);
    await doc.save();
    res.json({ message: 'Activity deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
