const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/attainmentController');
const { auth, requireContextAccess } = require('../middleware/auth');

router.use(auth);
router.get('/:contextId', requireContextAccess, ctrl.getAttainment);
router.post('/:contextId/calculate', requireContextAccess, ctrl.calculateAttainment);
router.patch('/:contextId/weights', requireContextAccess, ctrl.updateWeights);

module.exports = router;
