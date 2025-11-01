// middleware/checkRole.js
module.exports = function checkRole(...allowedRoles) {
  return (req, res, next) => {
    const user = req.user; // đã được gắn trong middleware "protect"

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: 'Access denied: insufficient role' });
    }

    next();
  };
};
