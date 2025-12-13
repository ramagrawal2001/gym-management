// Middleware to enforce gymId scoping for multi-tenant isolation

export const enforceGymScope = (req, res, next) => {
  try {
    // Super admin can access all gyms
    if (req.user.role === 'super_admin') {
      return next();
    }

    // For other roles, ensure gymId matches user's gymId
    const userGymId = req.user.gymId?.toString();
    
    // Check gymId in params
    if (req.params.gymId && req.params.gymId !== userGymId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Invalid gym scope'
      });
    }

    // Check gymId in body
    if (req.body.gymId && req.body.gymId.toString() !== userGymId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Invalid gym scope'
      });
    }

    // Check gymId in query
    if (req.query.gymId && req.query.gymId !== userGymId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Invalid gym scope'
      });
    }

    // Automatically set gymId from user if not provided
    if (!req.body.gymId && !req.params.gymId && !req.query.gymId) {
      req.body.gymId = req.user.gymId;
    }

    // Attach gymId to request for use in controllers
    req.gymId = userGymId;

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gym scope enforcement error',
      error: error.message
    });
  }
};

