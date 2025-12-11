import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    CreditCard,
    CalendarCheck,
    Dumbbell,
    Package,
    Settings,
    LogOut
} from 'lucide-react';
import { clsx } from 'clsx';

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Users, label: 'Leads CRM', path: '/crm' },
        { icon: CalendarCheck, label: 'Schedule', path: '/schedule' },
        { icon: Users, label: 'Members', path: '/members' },
        { icon: CreditCard, label: 'Plans', path: '/plans' },
        { icon: CreditCard, label: 'Payments', path: '/payments' },
        { icon: CalendarCheck, label: 'Attendance', path: '/attendance' },
        { icon: Dumbbell, label: 'Trainers', path: '/trainers' },
        { icon: Package, label: 'Inventory', path: '/inventory' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 h-screen fixed left-0 top-0 hidden md:flex flex-col transition-colors z-30">
            <div className="p-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <span className="text-white font-bold text-xl">G</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">GymPro</span>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-200"
                            )}
                        >
                            <Icon size={20} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-slate-800">
                <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
