import { Navigate } from 'react-router-dom';
import { useFeature } from '../../hooks/useFeature';
import { useRole } from '../../hooks/useRole';

const FeatureGuard = ({ children, feature, fallback = null }) => {
  const { hasFeature } = useFeature();
  const { isSuperAdmin } = useRole();

  if (!feature) {
    return children;
  }

  // Super admin bypasses feature checks
  if (isSuperAdmin()) {
    return children;
  }

  if (!hasFeature(feature)) {
    // Redirect to unauthorized page if feature is disabled
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default FeatureGuard;

