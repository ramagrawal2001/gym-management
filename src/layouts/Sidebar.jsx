import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    CreditCard,
    CalendarCheck,
    Dumbbell,
    Package,
    Settings,
    LogOut,
    Building2,
    Receipt,
    DollarSign,
    TrendingUp,
    PieChart,
    HelpCircle,
    MessageCircle,
    FileQuestion,
    Shield
} from 'lucide-react';
import { clsx } from 'clsx';
import { useRole } from '../hooks/useRole';
import { useFeature } from '../hooks/useFeature';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { hasRole, isSuperAdmin } = useRole();
    const { hasFeature } = useFeature();
    const { logout, user } = useAuth();
    const { hasActiveSubscription } = useSubscription();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        // Dashboard - All roles (no subscription required)
        { icon: LayoutDashboard, label: 'Dashboard', path: '/', roles: ['super_admin', 'owner', 'staff', 'member'] },

        // Super Admin only (no subscription required)
        { icon: Building2, label: 'Gyms', path: '/gyms', roles: ['super_admin'] },
        { icon: Receipt, label: 'Subscription Plans', path: '/subscription-plans', roles: ['super_admin'] },

        // Gym Owner - My Subscription (always visible for owners)
        { icon: Receipt, label: 'My Subscription', path: '/my-subscription', roles: ['owner'] },

        // Premium features - require subscription
        { icon: Users, label: 'Leads CRM', path: '/crm', feature: 'crm', roles: ['owner', 'staff'], requiresSubscription: true },
        { icon: CalendarCheck, label: 'Schedule', path: '/schedule', feature: 'scheduling', roles: ['owner', 'staff'], requiresSubscription: true },
        { icon: Users, label: 'Members', path: '/members', roles: ['super_admin', 'owner', 'staff'], requiresSubscription: true },
        { icon: CreditCard, label: 'Plans', path: '/plans', roles: ['super_admin', 'owner'], requiresSubscription: true },
        { icon: CreditCard, label: 'Payments', path: '/payments', feature: 'payments', roles: ['super_admin', 'owner'], requiresSubscription: true },
        { icon: CalendarCheck, label: 'Attendance', path: '/attendance', feature: 'attendance', roles: ['owner', 'staff'], requiresSubscription: true },
        { icon: Dumbbell, label: 'Trainers', path: '/trainers', feature: 'staff', roles: ['super_admin', 'owner', 'staff'], requiresSubscription: true },
        { icon: Package, label: 'Inventory', path: '/inventory', feature: 'inventory', roles: ['owner', 'staff'], requiresSubscription: true },
        { icon: DollarSign, label: 'Expenses', path: '/expenses', feature: 'financial', roles: ['super_admin', 'owner'], requiresSubscription: true },
        { icon: TrendingUp, label: 'Revenue', path: '/revenue', feature: 'financial', roles: ['super_admin', 'owner'], requiresSubscription: true },
        { icon: PieChart, label: 'Financial Reports', path: '/financial-reports', feature: 'financial', roles: ['super_admin', 'owner'], requiresSubscription: true },

        // Support & Help (no subscription required)
        { icon: HelpCircle, label: 'Support', path: '/support', roles: ['super_admin', 'owner', 'staff', 'member'] },

        // Support Admin - require subscription for owners/staff
        { icon: MessageCircle, label: 'Support Tickets', path: '/support-tickets', roles: ['super_admin', 'owner', 'staff'], requiresSubscription: true },

        // Settings & Management - require subscription
        { icon: Shield, label: 'Member Access', path: '/member-access', roles: ['super_admin', 'owner'], requiresSubscription: true },
        { icon: FileQuestion, label: 'FAQ Management', path: '/faq-management', roles: ['super_admin', 'owner'], requiresSubscription: true },
        { icon: Settings, label: 'Settings', path: '/settings', roles: ['super_admin', 'owner'], requiresSubscription: true },
    ];

    const filteredMenuItems = menuItems.filter(item => {
        // If user is not loaded yet, show only non-subscription items
        if (!user) return !item.requiresSubscription;

        // Check role
        if (item.roles && !hasRole(item.roles)) return false;

        // Check feature (for non-super-admin users)
        // Super admin bypasses feature checks
        if (item.feature && !isSuperAdmin() && !hasFeature(item.feature)) return false;

        // Check subscription (for non-super-admin users)
        // Super admin bypasses subscription checks
        if (item.requiresSubscription && !isSuperAdmin() && !hasActiveSubscription()) return false;

        return true;
    });

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
                {filteredMenuItems.map((item) => {
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
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
