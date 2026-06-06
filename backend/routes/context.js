const express = require('express');
const router = express.Router();
const AcademicContext = require('../models/AcademicContext');
const { auth, requireContextAccess } = require('../middleware/auth');

router.use(auth);

router.get('/my', async (req, res) => {
  try {
    let contexts;
    if (req.user.role === 'admin') {
      contexts = await AcademicContext.find()
        .populate('champion', 'name employeeId')
        .populate('instructors', 'name employeeId');
    } else {
      const ids = req.user.assignedSubjects.map(s => s.contextId);
      contexts = await AcademicContext.find({ _id: { $in: ids } })
        .populate('champion', 'name employeeId')
        .populate('instructors', 'name employeeId');
    }
    res.json(contexts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:contextId', requireContextAccess, async (req, res) => {
  try {
    const ctx = await AcademicContext.findById(req.params.contextId)
      .populate('champion', 'name employeeId designation')
      .populate('instructors', 'name employeeId designation');
    if (!ctx) return res.status(404).json({ message: 'Not found' });
    res.json(ctx);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:contextId', requireContextAccess, async (req, res) => {
  try {
    const ctx = await AcademicContext.findByIdAndUpdate(req.params.contextId, req.body, { new: true });
    res.json(ctx);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch('/:contextId/complete-step', requireContextAccess, async (req, res) => {
  try {
    const { step } = req.body;
    const ctx = await AcademicContext.findById(req.params.contextId);
    if (!ctx.completedSteps.includes(step)) ctx.completedSteps.push(step);
    await ctx.save();
    res.json(ctx);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
