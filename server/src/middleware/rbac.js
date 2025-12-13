// Role-based access control middleware

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }

    next();
  };
};

// Super Admin only
export const superAdminOnly = authorize('super_admin');

// Owner or Super Admin
export const ownerOrSuperAdmin = authorize('super_admin', 'owner');

// Staff or above
export const staffOrAbove = authorize('super_admin', 'owner', 'staff');

