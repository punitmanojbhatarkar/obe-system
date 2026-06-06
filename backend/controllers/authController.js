const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Faculty self-registration
exports.register = async (req, res) => {
  try {
    const { name, employeeId, email, phone, department, designation } = req.body;
    const existing = await User.findOne({ $or: [{ email }, { employeeId }] });
    if (existing) return res.status(400).json({ message: 'Faculty already registered' });
    const user = await User.create({ name, employeeId, email, phone, department, designation });
    res.status(201).json({ message: 'Registration successful. Admin will assign your role and provide credentials.', userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { employeeId, password, role } = req.body;
    
    const user = await User.findOne({ employeeId });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    
    if (!user.isRegistered || !user.password) 
      return res.status(400).json({ message: 'Account not activated. Contact admin.' });
    
    if (user.role !== role) 
      return res.status(403).json({ message: `This account is not a ${role}` });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        assignedSubjects: user.assignedSubjects
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Check if employee exists
exports.checkEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const user = await User.findOne({ employeeId }).select('name employeeId isRegistered role');
    if (!user) return res.json({ exists: false });
    res.json({ exists: true, isActivated: user.isRegistered, role: user.role, name: user.name });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  res.json(req.user);
};