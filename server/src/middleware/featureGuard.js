import Gym from '../models/Gym.js';

export const checkFeature = (featureName) => {
  return async (req, res, next) => {
    try {
      // Super admin has access to all features
      if (req.user.role === 'super_admin') {
        return next();
      }

      // Get gym to check features
      const gymId = req.user.gymId || req.body.gymId || req.params.gymId;
      
      if (!gymId) {
        return res.status(400).json({
          success: false,
          message: 'Gym ID is required'
        });
      }

      const gym = await Gym.findById(gymId);
      
      if (!gym) {
        return res.status(404).json({
          success: false,
          message: 'Gym not found'
        });
      }

      // Check if feature is enabled
      if (!gym.features[featureName]) {
        return res.status(403).json({
          success: false,
          message: `Feature '${featureName}' is not enabled for this gym`
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Feature check error',
        error: error.message
      });
    }
  };
};

