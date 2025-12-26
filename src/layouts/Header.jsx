import { useState } from 'react';
import { Search, Moon, Sun, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/common/Input';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { NotificationCenter } from '../components/notifications';

const Header = () => {
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 fixed top-0 right-0 left-0 md:left-64 z-20 px-6 flex items-center justify-between transition-colors">
            <div className="w-96">
                <Input
                    placeholder="Search..."
                    icon={Search}
                    className="bg-gray-50 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-700 transition-colors"
                />
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={toggleTheme}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* New NotificationCenter Component */}
                <NotificationCenter />

                <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-slate-700">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user?.firstName && user?.lastName
                                ? `${user.firstName} ${user.lastName}`
                                : user?.email || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {user?.role?.replace('_', ' ') || 'User'}
                        </p>
                    </div>
                    <div className="w-9 h-9 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        {user?.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.firstName || 'User'}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600 dark:text-gray-300">
                                {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
