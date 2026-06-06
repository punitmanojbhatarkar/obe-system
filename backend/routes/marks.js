const express = require('express');
const router = express.Router();
const StudentMarks = require('../models/StudentMarks');
const Student = require('../models/Student');
const Activity = require('../models/Activity');
const AcademicContext = require('../models/AcademicContext');
const { auth, requireContextAccess } = require('../middleware/auth');
const xlsx = require('xlsx');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.use(auth);

// Get all marks for a context and activity
router.get('/:contextId/:activityId', requireContextAccess, async (req, res) => {
  try {
    const marks = await StudentMarks.find({
      contextId: req.params.contextId,
      activityId: req.params.activityId
    }).populate('studentId', 'prn name rollNo batch division');
    res.json(marks);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Save marks for one student
router.post('/:contextId', requireContextAccess, async (req, res) => {
  try {
    const { studentId, activityId, activityType, coMarks, questionMarks } = req.body;
    const totalMarks = coMarks
      ? coMarks.reduce((sum, cm) => sum + (cm.marksObtained || 0), 0)
      : questionMarks?.reduce((sum, qm) => sum + (qm.marksObtained || 0), 0) || 0;

    const doc = await StudentMarks.findOneAndUpdate(
      { contextId: req.params.contextId, studentId, activityId },
      { contextId: req.params.contextId, studentId, activityId, activityType, coMarks, questionMarks, totalMarks, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json(doc);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Bulk save marks for all students in an activity
router.post('/:contextId/:activityId/bulk-save', requireContextAccess, async (req, res) => {
  try {
    const { marksData } = req.body; // Array of { studentId, coMarks, questionMarks }
    const ops = marksData.map(m => ({
      updateOne: {
        filter: { contextId: req.params.contextId, studentId: m.studentId, activityId: req.params.activityId },
        update: {
          contextId: req.params.contextId,
          studentId: m.studentId,
          activityId: req.params.activityId,
          activityType: m.activityType,
          coMarks: m.coMarks,
          questionMarks: m.questionMarks,
          totalMarks: m.totalMarks,
          updatedAt: new Date()
        },
        upsert: true
      }
    }));
    await StudentMarks.bulkWrite(ops);
    const ctx = await AcademicContext.findById(req.params.contextId);
    if (!ctx.completedSteps.includes('marks')) { ctx.completedSteps.push('marks'); await ctx.save(); }
    res.json({ message: 'Marks saved successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Bulk upload marks via Excel
router.post('/:contextId/:activityId/upload', requireContextAccess, upload.single('file'), async (req, res) => {
  try {
    const wb = xlsx.read(req.file.buffer, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(ws);

    const actDoc = await Activity.findOne({ contextId: req.params.contextId });
    const activity = actDoc?.activities.find(a => a._id.toString() === req.params.activityId);
    if (!activity) return res.status(404).json({ message: 'Activity not found' });

    const ops = [];
    for (const row of data) {
      const prn = String(row.PRN || row.prn);
      const student = await Student.findOne({ contextId: req.params.contextId, prn });
      if (!student) continue;

      const coMarks = activity.cosMapped.map(coNo => ({
        coNo,
        marksObtained: parseFloat(row[coNo] || 0),
        maxMarks: activity.maxMarks / activity.cosMapped.length
      }));

      ops.push({
        updateOne: {
          filter: { contextId: req.params.contextId, studentId: student._id, activityId: req.params.activityId },
          update: {
            contextId: req.params.contextId,
            studentId: student._id,
            activityId: req.params.activityId,
            activityType: activity.type,
            coMarks,
            totalMarks: coMarks.reduce((s, c) => s + c.marksObtained, 0),
            updatedAt: new Date()
          },
          upsert: true
        }
      });
    }
    await StudentMarks.bulkWrite(ops);
    res.json({ message: `Marks uploaded for ${ops.length} students` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Download marks template
router.get('/:contextId/:activityId/template', requireContextAccess, async (req, res) => {
  try {
    const students = await Student.find({ contextId: req.params.contextId }).sort({ rollNo: 1 });
    const actDoc = await Activity.findOne({ contextId: req.params.contextId });
    const activity = actDoc?.activities.find(a => a._id.toString() === req.params.activityId);

    const headers = ['PRN', 'Name', 'RollNo', ...(activity?.cosMapped || ['CO1'])];
    const rows = students.map(s => ({ PRN: s.prn, Name: s.name, RollNo: s.rollNo }));

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(rows, { header: headers });
    xlsx.utils.book_append_sheet(wb, ws, 'Marks');
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="marks_template.xlsx"`);
    res.send(buffer);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
