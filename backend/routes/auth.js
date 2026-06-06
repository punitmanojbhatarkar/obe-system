const express = require('express');
const router = express.Router();
const { register, login, checkEmployee, getMe } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/check/:employeeId', checkEmployee);
router.get('/me', auth, getMe);

module.exports = router;
