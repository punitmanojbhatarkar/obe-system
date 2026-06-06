const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const { auth, requireRole } = require('../middleware/auth');

router.use(auth, requireRole('admin'));

router.get('/dashboard', ctrl.getDashboard);
router.get('/faculty', ctrl.getAllFaculty);
router.get('/faculty/pending', ctrl.getPendingFaculty);
router.post('/faculty/assign-role', ctrl.assignRole);
router.post('/faculty/add-subject', ctrl.addSubjectToFaculty);
router.post('/faculty/reset-password', ctrl.resetPassword);
router.post('/contexts', ctrl.createContext);
router.get('/contexts', ctrl.getAllContexts);
router.post('/attainment-config', ctrl.setAttainmentConfig);
router.get('/attainment-config', ctrl.getAttainmentConfig);

module.exports = router;
