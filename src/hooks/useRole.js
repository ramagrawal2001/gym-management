import { useSelector } from 'react-redux';

export const useRole = () => {
  const { user } = useSelector((state) => state.auth);

  const hasRole = (roles) => {
    if (!user || !roles) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  const isSuperAdmin = () => hasRole('super_admin');
  const isOwner = () => hasRole('owner');
  const isStaff = () => hasRole('staff');
  const isMember = () => hasRole('member');
  const isOwnerOrAbove = () => hasRole(['super_admin', 'owner']);
  const isStaffOrAbove = () => hasRole(['super_admin', 'owner', 'staff']);

  return {
    role: user?.role,
    hasRole,
    isSuperAdmin,
    isOwner,
    isStaff,
    isMember,
    isOwnerOrAbove,
    isStaffOrAbove
  };
};

