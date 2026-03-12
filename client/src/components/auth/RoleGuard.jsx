import { Navigate } from 'react-router-dom';
import { useRole } from '../../hooks/useRole';

const RoleGuard = ({ children, allowedRoles, fallback = null }) => {
  const { hasRole } = useRole();

  if (!allowedRoles || allowedRoles.length === 0) {
    return children;
  }

  if (!hasRole(allowedRoles)) {
    // Redirect to unauthorized page instead of showing fallback
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleGuard;

