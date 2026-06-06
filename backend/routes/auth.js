const express = require('express');
const router = express.Router();
const { register, login, checkEmployee, getMe } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/check/:employeeId', checkEmployee);
router.get('/me', auth, getMe);

router.get('/create-admin', async (req, res) => {
  try {
    const User = require('../models/User');
    const existing = await User.findOne({ role: 'admin' });
    if (existing) return res.json({ message: 'Admin already exists', employeeId: existing.employeeId });
    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash('Admin@123', 12);
    await User.create({
      name: 'System Administrator',
      employeeId: 'ADMIN001',
      email: 'admin@mitaoe.ac.in',
      department: 'Administration',
      designation: 'Administrator',
      role: 'admin',
      password: hashed,
      isRegistered: true,
    });
    res.json({ message: 'Admin created!', employeeId: 'ADMIN001', password: 'Admin@123' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/reset-admin', async (req, res) => {
  try {
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');
    await User.deleteOne({ employeeId: 'ADMIN001' });
    const hashed = await bcrypt.hash('Admin@123', 12);
    await User.create({
      name: 'System Administrator',
      employeeId: 'ADMIN001',
      email: 'admin@mitaoe.ac.in',
      department: 'Administration',
      designation: 'Administrator',
      role: 'admin',
      password: hashed,
      isRegistered: true,
    });
    res.json({ message: 'Admin reset done!', employeeId: 'ADMIN001', password: 'Admin@123' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;