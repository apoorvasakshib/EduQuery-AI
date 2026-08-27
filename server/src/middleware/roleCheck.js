const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const userRole = req.user.role;
    const isAdminUser = ['admin', 'super_admin', 'dept_admin'].includes(userRole);
    const requiresAdmin = allowedRoles.some((r) => ['admin', 'super_admin', 'dept_admin'].includes(r));

    if (allowedRoles.includes(userRole) || (isAdminUser && requiresAdmin)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. Role '${userRole}' is not authorized for this operation.`,
    });
  };
};

module.exports = { requireRole };
