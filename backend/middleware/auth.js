const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'Token invalid' });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token invalid' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: 'Access denied: insufficient role' });
  next();
};

const requireContextAccess = async (req, res, next) => {
  try {
    const contextId = req.params.contextId || req.body.contextId || req.query.contextId;
    if (!contextId) return res.status(400).json({ message: 'Context ID required' });

    if (req.user.role === 'admin') return next();

    const hasAccess = req.user.assignedSubjects.some(
      s => s.contextId.toString() === contextId
    );
    if (!hasAccess) return res.status(403).json({ message: 'No access to this subject context' });

    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { auth, requireRole, requireContextAccess };
