// Middleware to enforce gymId scoping for multi-tenant isolation

export const enforceGymScope = (req, res, next) => {
  try {
    // Super admin can access all gyms
    // If gymId is provided in query, use it; otherwise can access all
    if (req.user.role === 'super_admin') {
      if (req.query.gymId) {
        req.gymId = req.query.gymId;
      }
      return next();
    }

    // For other roles, ensure gymId matches user's gymId
    const userGymId = req.user.gymId?.toString();
    
    if (!userGymId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: User does not have a gym association'
      });
    }
    
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

// Middleware to enforce member scope (members can only access their own data)
export const enforceMemberScope = (req, res, next) => {
  try {
    // Only apply to member role
    if (req.user.role !== 'member') {
      return next();
    }

    const userId = req.user._id.toString();

    // For member routes, ensure they can only access their own data
    // Check userId in params (e.g., /members/:id should be their own ID)
    if (req.params.id && req.params.id !== userId) {
      // Check if it's a member record ID (not user ID)
      // In this case, we need to verify the member record belongs to the user
      // This will be handled in the controller
      req.memberOnly = true;
      req.memberUserId = userId;
    }

    // Check userId in body
    if (req.body.userId && req.body.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Cannot access other users\' data'
      });
    }

    // For /me endpoints, automatically set userId
    if (req.path.includes('/me')) {
      req.userId = userId;
    }

    // Attach userId for use in controllers
    req.memberUserId = userId;

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Member scope enforcement error',
      error: error.message
    });
  }
};

