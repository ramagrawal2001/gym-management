import { useFeature } from '../../hooks/useFeature';

const FeatureGuard = ({ children, feature, fallback = null }) => {
  const { hasFeature } = useFeature();

  if (!feature) {
    return children;
  }

  if (!hasFeature(feature)) {
    return fallback || null;
  }

  return children;
};

export default FeatureGuard;

