import { useDispatch, useSelector } from 'react-redux';
import {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification
} from '../store/slices/notificationSlice';

export const useNotification = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector((state) => state.notifications);

  const notify = (message, type = 'info', duration = 5000) => {
    const notificationId = Date.now();
    const notification = {
      id: notificationId,
      message,
      type, // 'success', 'error', 'warning', 'info'
      duration
    };
    dispatch(addNotification(notification));

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        dispatch(removeNotification(notificationId));
      }, duration);
    }
  };

  const success = (message, duration) => notify(message, 'success', duration);
  const error = (message, duration) => notify(message, 'error', duration);
  const warning = (message, duration) => notify(message, 'warning', duration);
  const info = (message, duration) => notify(message, 'info', duration);

  return {
    notifications,
    unreadCount,
    notify,
    success,
    error,
    warning,
    info,
    markAsRead: (id) => dispatch(markAsRead(id)),
    markAllAsRead: () => dispatch(markAllAsRead()),
    remove: (id) => dispatch(removeNotification(id))
  };
};

