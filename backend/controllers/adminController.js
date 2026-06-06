const User = require('../models/User');
const AcademicContext = require('../models/AcademicContext');
const AttainmentConfig = require('../models/AttainmentConfig');
const bcrypt = require('bcryptjs');

// Get all pending (unregistered) faculty
exports.getPendingFaculty = async (req, res) => {
  try {
    const faculty = await User.find({ isRegistered: false }).select('-password');
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all faculty
exports.getAllFaculty = async (req, res) => {
  try {
    const faculty = await User.find({ role: { $ne: 'admin' } }).select('-password').populate('assignedSubjects.contextId', 'subjectName subjectCode academicYear semester');
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve and assign role to faculty
exports.assignRole = async (req, res) => {
  try {
    const { userId, role, contextId, password } = req.body;
    if (!['champion', 'instructor'].includes(role))
      return res.status(400).json({ message: 'Invalid role' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Faculty not found' });

    user.role = role;
    user.password = password; // will be hashed by pre-save hook
    user.isRegistered = true;

    if (contextId) {
      // Check if already assigned
      const alreadyAssigned = user.assignedSubjects.find(s => s.contextId.toString() === contextId);
      if (!alreadyAssigned) {
        user.assignedSubjects.push({ contextId, role });
      }
      // Update context
      const context = await AcademicContext.findById(contextId);
      if (context) {
        if (role === 'champion') context.champion = userId;
        else if (!context.instructors.includes(userId)) context.instructors.push(userId);
        await context.save();
      }
    }

    await user.save();
    res.json({ message: 'Faculty role assigned successfully', user: { ...user.toObject(), password: undefined } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add subject to existing faculty
exports.addSubjectToFaculty = async (req, res) => {
  try {
    const { userId, contextId, role } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Faculty not found' });

    const alreadyAssigned = user.assignedSubjects.find(s => s.contextId.toString() === contextId);
    if (!alreadyAssigned) user.assignedSubjects.push({ contextId, role });

    const context = await AcademicContext.findById(contextId);
    if (context) {
      if (role === 'champion') context.champion = userId;
      else if (!context.instructors.includes(userId)) context.instructors.push(userId);
      await context.save();
    }

    await user.save();
    res.json({ message: 'Subject assigned' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Academic Context (subject)
exports.createContext = async (req, res) => {
  try {
    const context = await AcademicContext.create(req.body);
    res.status(201).json(context);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Subject already exists for this year/branch/semester' });
    res.status(500).json({ message: err.message });
  }
};

// Get all contexts
exports.getAllContexts = async (req, res) => {
  try {
    const contexts = await AcademicContext.find()
      .populate('champion', 'name employeeId')
      .populate('instructors', 'name employeeId')
      .sort({ createdAt: -1 });
    res.json(contexts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Set attainment thresholds for academic year
exports.setAttainmentConfig = async (req, res) => {
  try {
    const { academicYear, level1, level2, level3 } = req.body;
    const config = await AttainmentConfig.findOneAndUpdate(
      { academicYear },
      { level1, level2, level3, updatedBy: req.user._id, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAttainmentConfig = async (req, res) => {
  try {
    const configs = await AttainmentConfig.find().sort({ academicYear: -1 });
    res.json(configs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Dashboard summary
exports.getDashboard = async (req, res) => {
  try {
    const totalFaculty = await User.countDocuments({ role: { $ne: 'admin' } });
    const pendingApproval = await User.countDocuments({ isRegistered: false });
    const totalSubjects = await AcademicContext.countDocuments();
    const contexts = await AcademicContext.find()
      .populate('champion', 'name')
      .select('subjectName academicYear semester branch completedSteps');
    res.json({ totalFaculty, pendingApproval, totalSubjects, contexts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reset faculty password
exports.resetPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
