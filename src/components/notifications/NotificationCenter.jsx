import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, X, ExternalLink } from 'lucide-react';
import notificationService from '../../services/notificationService.js';

/**
 * NotificationCenter - Bell icon with dropdown for in-app notifications
 */
const NotificationCenter = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    // Fetch unread count on mount and periodically
    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // Every 30 seconds
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch notifications when dropdown opens
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchUnreadCount = async () => {
        try {
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const result = await notificationService.getNotifications({ limit: 10 });
            setNotifications(result.notifications || []);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const getTimeAgo = (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    };

    const getNotificationIcon = (type) => {
        const icons = {
            membership_expiry_warning: '⚠️',
            membership_expired: '🔴',
            payment_reminder: '💰',
            payment_received: '✅',
            welcome: '👋',
            birthday: '🎂',
            announcement: '📢',
            general: '🔔'
        };
        return icons[type] || '🔔';
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />

                {/* Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 max-h-[480px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Notifications
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                            >
                                <CheckCheck className="w-3 h-3" />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto max-h-[380px]">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                                <Bell className="w-10 h-10 mb-2 opacity-50" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                        }`}
                                    onClick={() => {
                                        if (!notification.isRead) {
                                            handleMarkAsRead(notification._id);
                                        }
                                        if (notification.actionUrl) {
                                            window.location.href = notification.actionUrl;
                                        }
                                    }}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-xl">
                                            {getNotificationIcon(notification.type)}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${!notification.isRead
                                                    ? 'font-semibold text-gray-900 dark:text-white'
                                                    : 'text-gray-700 dark:text-gray-300'
                                                }`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                {getTimeAgo(notification.createdAt)}
                                            </p>
                                        </div>
                                        {!notification.isRead && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                            <button
                                onClick={() => window.location.href = '/notifications'}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline w-full text-center"
                            >
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
