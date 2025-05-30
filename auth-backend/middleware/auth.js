const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// Regular authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, msg: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, msg: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Admin role middleware
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.userType !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      msg: 'Access denied. Admin privileges required.' 
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin
}; 