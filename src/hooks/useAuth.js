import { useSelector, useDispatch } from 'react-redux';
import { logout, getCurrentUser } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, isLoading, error } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const refreshUser = () => {
    dispatch(getCurrentUser());
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    logout: handleLogout,
    refreshUser
  };
};

