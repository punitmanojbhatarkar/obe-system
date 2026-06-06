/**
 * Run this ONCE to create the admin account:
 * node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const existing = await User.findOne({ role: 'admin' });
  if (existing) {
    console.log('Admin already exists:', existing.employeeId);
    process.exit(0);
  }

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

  console.log('✅ Admin created!');
  console.log('   Employee ID: ADMIN001');
  console.log('   Password:    Admin@123');
  console.log('   ⚠️  Change the password after first login!');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
