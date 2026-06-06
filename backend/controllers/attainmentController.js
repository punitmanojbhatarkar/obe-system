const AcademicContext = require('../models/AcademicContext');
const CourseOutcome = require('../models/CourseOutcome');
const Activity = require('../models/Activity');
const Student = require('../models/Student');
const StudentMarks = require('../models/StudentMarks');
const ExitSurvey = require('../models/ExitSurvey');
const COPOMatrix = require('../models/COPOMatrix');
const Attainment = require('../models/Attainment');
const AttainmentConfig = require('../models/AttainmentConfig');
const {
  calculateCOAttainment,
  mergeIndirectAttainment,
  calculatePOAttainment
} = require('../utils/attainmentCalculator');

exports.calculateAttainment = async (req, res) => {
  try {
    const { contextId } = req.params;
    const context = await AcademicContext.findById(contextId);
    if (!context) return res.status(404).json({ message: 'Context not found' });

    // Get thresholds
    const config = await AttainmentConfig.findOne({ academicYear: context.academicYear });
    const thresholds = config
      ? { level1: config.level1, level2: config.level2, level3: config.level3 }
      : { level1: 65, level2: 75, level3: 85 };

    // Get existing attainment doc for weights
    const existingAttainment = await Attainment.findOne({ contextId });
    const directWeight = existingAttainment?.directWeight || 0.8;
    const indirectWeight = existingAttainment?.indirectWeight || 0.2;

    // Get COs
    const coDoc = await CourseOutcome.findOne({ contextId });
    if (!coDoc) return res.status(400).json({ message: 'Course outcomes not defined' });
    const cos = coDoc.cos.filter(co => co.isActive);

    // Get activities
    const actDoc = await Activity.findOne({ contextId });
    const activities = actDoc ? actDoc.activities : [];

    // Get students
    const students = await Student.find({ contextId });
    if (!students.length) return res.status(400).json({ message: 'No students found' });

    // Get all marks
    const allMarks = await StudentMarks.find({ contextId });

    // Calculate direct attainment
    let coAttainment = calculateCOAttainment(
      students, allMarks, activities, cos, context.examScheme, thresholds
    );

    // Get exit survey indirect attainment
    const survey = await ExitSurvey.findOne({ contextId });
    if (survey && survey.coAverages.length > 0) {
      coAttainment = mergeIndirectAttainment(
        coAttainment, survey.coAverages, thresholds, directWeight, indirectWeight
      );
    } else {
      // If no survey, final = direct only
      coAttainment = coAttainment.map(co => ({ ...co, surveyPercent: null, indirectLevel: 0, finalLevel: co.directLevel }));
    }

    // Get CO-PO matrix
    const copoDoc = await COPOMatrix.findOne({ contextId });
    const copoMatrix = copoDoc ? copoDoc.matrix : [];

    // Calculate PO attainment
    const poAttainment = calculatePOAttainment(coAttainment, copoMatrix);

    // Calculate batch-wise breakdown
    const batches = [...new Set(students.map(s => s.batch).filter(Boolean))];
    const batchWise = await Promise.all(batches.map(async batch => {
      const batchStudents = students.filter(s => s.batch === batch);
      const batchCOAtt = calculateCOAttainment(
        batchStudents, allMarks, activities, cos, context.examScheme, thresholds
      );
      return { batch, coAttainment: batchCOAtt };
    }));

    // Save to DB
    const attainment = await Attainment.findOneAndUpdate(
      { contextId },
      {
        contextId, thresholds, directWeight, indirectWeight,
        coAttainment, poAttainment, batchWise, calculatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Mark step complete
    if (!context.completedSteps.includes('attainment')) {
      context.completedSteps.push('attainment');
      await context.save();
    }

    res.json(attainment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getAttainment = async (req, res) => {
  try {
    const { contextId } = req.params;
    const attainment = await Attainment.findOne({ contextId });
    if (!attainment) return res.status(404).json({ message: 'Attainment not yet calculated' });
    res.json(attainment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateWeights = async (req, res) => {
  try {
    const { contextId } = req.params;
    const { directWeight, indirectWeight } = req.body;
    if (Math.abs(directWeight + indirectWeight - 1) > 0.001)
      return res.status(400).json({ message: 'Weights must sum to 1' });

    await Attainment.findOneAndUpdate(
      { contextId },
      { directWeight, indirectWeight },
      { upsert: true }
    );
    res.json({ message: 'Weights updated. Recalculate attainment to apply.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
