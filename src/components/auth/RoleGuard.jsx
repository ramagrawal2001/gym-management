import { useRole } from '../../hooks/useRole';

const RoleGuard = ({ children, allowedRoles, fallback = null }) => {
  const { hasRole } = useRole();

  if (!allowedRoles || allowedRoles.length === 0) {
    return children;
  }

  if (!hasRole(allowedRoles)) {
    return fallback || (
      <div className="p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">You don't have permission to access this page.</p>
      </div>
    );
  }

  return children;
};

export default RoleGuard;

