const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const AcademicContext = require('../models/AcademicContext');
const { auth, requireContextAccess } = require('../middleware/auth');
const xlsx = require('xlsx');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.use(auth);

router.get('/:contextId', requireContextAccess, async (req, res) => {
  try {
    const { batch, division } = req.query;
    const filter = { contextId: req.params.contextId };
    if (batch) filter.batch = batch;
    if (division) filter.division = division;
    const students = await Student.find(filter).sort({ rollNo: 1 });
    res.json(students);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:contextId', requireContextAccess, async (req, res) => {
  try {
    const { prn, name, division, batch, rollNo } = req.body;
    const student = await Student.findOneAndUpdate(
      { contextId: req.params.contextId, prn },
      { contextId: req.params.contextId, prn, name, division, batch, rollNo },
      { upsert: true, new: true }
    );
    res.json(student);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Bulk upload via Excel
router.post('/:contextId/bulk', requireContextAccess, upload.single('file'), async (req, res) => {
  try {
    const wb = xlsx.read(req.file.buffer, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(ws);

    const ops = data.map(row => ({
      updateOne: {
        filter: { contextId: req.params.contextId, prn: String(row.PRN || row.prn) },
        update: {
          contextId: req.params.contextId,
          prn: String(row.PRN || row.prn),
          name: row.Name || row.name,
          division: row.Division || row.division || '',
          batch: row.Batch || row.batch || '',
          rollNo: String(row.RollNo || row.rollno || row['Roll No'] || '')
        },
        upsert: true
      }
    }));
    await Student.bulkWrite(ops);

    const ctx = await AcademicContext.findById(req.params.contextId);
    if (!ctx.completedSteps.includes('students')) { ctx.completedSteps.push('students'); await ctx.save(); }
    res.json({ message: `${data.length} students uploaded` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:contextId/:studentId', requireContextAccess, async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.studentId);
    res.json({ message: 'Student deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
