const express = require('express');
const router = express.Router();
const Suggestion = require('../models/Suggestion');
const { auth, requireContextAccess } = require('../middleware/auth');

router.use(auth);

router.get('/:contextId', requireContextAccess, async (req, res) => {
  try {
    const suggestions = await Suggestion.find({ contextId: req.params.contextId })
      .populate('instructorId', 'name employeeId').sort({ createdAt: -1 });
    res.json(suggestions);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:contextId', requireContextAccess, async (req, res) => {
  try {
    const s = await Suggestion.create({ ...req.body, contextId: req.params.contextId, instructorId: req.user._id });
    res.status(201).json(s);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch('/:contextId/:suggestionId', requireContextAccess, async (req, res) => {
  try {
    const { status, championComment } = req.body;
    if (req.user.role !== 'champion' && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Only champion can review suggestions' });
    const s = await Suggestion.findByIdAndUpdate(req.params.suggestionId,
      { status, championComment, reviewedAt: new Date() }, { new: true });
    res.json(s);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
