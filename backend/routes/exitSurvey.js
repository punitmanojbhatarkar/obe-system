const express = require('express');
const router = express.Router();
const ExitSurvey = require('../models/ExitSurvey');
const CourseOutcome = require('../models/CourseOutcome');
const AcademicContext = require('../models/AcademicContext');
const { auth, requireContextAccess } = require('../middleware/auth');
const crypto = require('crypto');

router.use('/submit', (req, res, next) => next()); // public
router.use('/view/:token', (req, res, next) => next()); // public

// Auth for all other routes
router.use((req, res, next) => {
  if (req.path.startsWith('/submit') || req.path.startsWith('/view')) return next();
  auth(req, res, next);
});

// Get survey for context
router.get('/:contextId', auth, requireContextAccess, async (req, res) => {
  try {
    const doc = await ExitSurvey.findOne({ contextId: req.params.contextId });
    res.json(doc || {});
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Create/update survey questions
router.post('/:contextId/setup', auth, requireContextAccess, async (req, res) => {
  try {
    const { questions } = req.body;
    const token = crypto.randomBytes(16).toString('hex');
    const doc = await ExitSurvey.findOneAndUpdate(
      { contextId: req.params.contextId },
      { contextId: req.params.contextId, questions, surveyLink: token, isOpen: true },
      { upsert: true, new: true }
    );
    res.json(doc);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// View survey by token (public - for students)
router.get('/view/:token', async (req, res) => {
  try {
    const survey = await ExitSurvey.findOne({ surveyLink: req.params.token, isOpen: true });
    if (!survey) return res.status(404).json({ message: 'Survey not found or closed' });
    const ctx = await AcademicContext.findById(survey.contextId).select('subjectName subjectCode academicYear semester');
    res.json({ survey: { questions: survey.questions, _id: survey._id }, context: ctx });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Submit response (public - for students)
router.post('/submit/:token', async (req, res) => {
  try {
    const { studentPRN, answers } = req.body;
    const survey = await ExitSurvey.findOne({ surveyLink: req.params.token, isOpen: true });
    if (!survey) return res.status(404).json({ message: 'Survey not found or closed' });

    const alreadySubmitted = survey.responses.find(r => r.studentPRN === studentPRN);
    if (alreadySubmitted) return res.status(400).json({ message: 'You have already submitted this survey' });

    survey.responses.push({ studentPRN, answers, submittedAt: new Date() });

    // Recalculate CO averages
    const coMap = {};
    survey.responses.forEach(resp => {
      resp.answers.forEach(ans => {
        if (!coMap[ans.coMapped]) coMap[ans.coMapped] = [];
        coMap[ans.coMapped].push(ans.score);
      });
    });
    survey.coAverages = Object.keys(coMap).map(coNo => {
      const scores = coMap[coNo];
      const avg = scores.reduce((a,b)=>a+b,0) / scores.length;
      return { coNo, avgScore: parseFloat(avg.toFixed(4)), avgPercent: parseFloat(((avg/5)*100).toFixed(4)), attainmentLevel: avg>=4.25?3:avg>=3.75?2:avg>=3.25?1:0 };
    });

    await survey.save();
    res.json({ message: 'Survey submitted successfully. Thank you!' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Close survey
router.patch('/:contextId/close', auth, requireContextAccess, async (req, res) => {
  try {
    await ExitSurvey.findOneAndUpdate({ contextId: req.params.contextId }, { isOpen: false });
    const ctx = await AcademicContext.findById(req.params.contextId);
    if (!ctx.completedSteps.includes('survey')) { ctx.completedSteps.push('survey'); await ctx.save(); }
    res.json({ message: 'Survey closed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
