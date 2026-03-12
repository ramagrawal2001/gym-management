import { useSelector } from 'react-redux';

export const useFeature = () => {
  const { features } = useSelector((state) => state.gym);
  const { user } = useSelector((state) => state.auth);

  // Super admin has access to all features
  const hasFeature = (featureName) => {
    if (!featureName) return false;
    // Super admin always has access to all features
    if (user?.role === 'super_admin') return true;
    // If features haven't loaded yet, default to true (will be filtered once loaded)
    if (Object.keys(features).length === 0) return true;
    return features[featureName] === true;
  };

  return {
    features,
    hasFeature
  };
};

