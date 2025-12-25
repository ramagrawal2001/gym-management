import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleGuard from './components/auth/RoleGuard';
import FeatureGuard from './components/auth/FeatureGuard';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import MemberProfile from './pages/MemberProfile';
import Plans from './pages/Plans';
import Payments from './pages/Payments';
import Attendance from './pages/Attendance';
import Trainers from './pages/Trainers';
import Inventory from './pages/Inventory';
import Settings from './pages/Settings';
import CRM from './pages/CRM';
import Schedule from './pages/Schedule';
import Gyms from './pages/Gyms';
import GymDetails from './pages/GymDetails';
import SubscriptionPlans from './pages/SubscriptionPlans';
import GymSubscription from './pages/GymSubscription';
import PaymentLink from './pages/PaymentLink';
import { getCurrentUser } from './store/slices/authSlice';
import { getGym } from './store/slices/gymSlice';
import { useAuth } from './hooks/useAuth';

function AppRoutes() {
    const dispatch = useDispatch();
    const { isAuthenticated, user, token } = useAuth();

    useEffect(() => {
        // Check if we have a token in store but user data is missing (needs refresh)
        // Redux Persist will restore both token and user, but we may need to refresh user data
        if (token && !user && !isAuthenticated) {
            dispatch(getCurrentUser());
        }
    }, [dispatch, isAuthenticated, user, token]);

    useEffect(() => {
        // Only fetch gym if user has gymId (super_admin doesn't have gymId)
        if (user?.gymId && isAuthenticated) {
            const gymId = typeof user.gymId === 'object' ? user.gymId._id || user.gymId : user.gymId;
            if (gymId) {
                dispatch(getGym(gymId));
            }
        } else if (user?.role === 'super_admin' && isAuthenticated) {
            // For super_admin, set default features to all enabled
            // This ensures sidebar items show even without a gym
        }
    }, [dispatch, user?.gymId, user?.role, isAuthenticated]);

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Public payment link - No auth required */}
            <Route path="/pay/:token" element={<PaymentLink />} />

            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Dashboard />} />

                {/* Super Admin only routes */}
                <Route
                    path="gyms"
                    element={
                        <RoleGuard allowedRoles={['super_admin']}>
                            <Gyms />
                        </RoleGuard>
                    }
                />
                <Route
                    path="gyms/:id"
                    element={
                        <RoleGuard allowedRoles={['super_admin']}>
                            <GymDetails />
                        </RoleGuard>
                    }
                />
                <Route
                    path="subscription-plans"
                    element={
                        <RoleGuard allowedRoles={['super_admin']}>
                            <SubscriptionPlans />
                        </RoleGuard>
                    }
                />

                {/* Gym Owner - My Subscription */}
                <Route
                    path="my-subscription"
                    element={
                        <RoleGuard allowedRoles={['owner']}>
                            <GymSubscription />
                        </RoleGuard>
                    }
                />

                {/* CRM - Owner and Staff, requires CRM feature */}
                <Route
                    path="crm"
                    element={
                        <RoleGuard allowedRoles={['owner', 'staff']}>
                            <FeatureGuard feature="crm">
                                <CRM />
                            </FeatureGuard>
                        </RoleGuard>
                    }
                />

                {/* Schedule - Owner and Staff, requires scheduling feature */}
                <Route
                    path="schedule"
                    element={
                        <RoleGuard allowedRoles={['owner', 'staff']}>
                            <FeatureGuard feature="scheduling">
                                <Schedule />
                            </FeatureGuard>
                        </RoleGuard>
                    }
                />

                {/* Members - Super Admin, Owner, Staff */}
                <Route
                    path="members"
                    element={
                        <RoleGuard allowedRoles={['super_admin', 'owner', 'staff']}>
                            <Members />
                        </RoleGuard>
                    }
                />
                <Route
                    path="members/:id"
                    element={
                        <MemberProfile />
                    }
                />

                {/* Plans - Super Admin and Owner only */}
                <Route
                    path="plans"
                    element={
                        <RoleGuard allowedRoles={['super_admin', 'owner']}>
                            <Plans />
                        </RoleGuard>
                    }
                />

                {/* Payments - Super Admin and Owner only, requires payments feature */}
                <Route
                    path="payments"
                    element={
                        <RoleGuard allowedRoles={['super_admin', 'owner']}>
                            <FeatureGuard feature="payments">
                                <Payments />
                            </FeatureGuard>
                        </RoleGuard>
                    }
                />

                {/* Attendance - Owner and Staff, requires attendance feature */}
                <Route
                    path="attendance"
                    element={
                        <RoleGuard allowedRoles={['owner', 'staff']}>
                            <FeatureGuard feature="attendance">
                                <Attendance />
                            </FeatureGuard>
                        </RoleGuard>
                    }
                />

                {/* Trainers - Super Admin, Owner, Staff, requires staff feature */}
                <Route
                    path="trainers"
                    element={
                        <RoleGuard allowedRoles={['super_admin', 'owner', 'staff']}>
                            <FeatureGuard feature="staff">
                                <Trainers />
                            </FeatureGuard>
                        </RoleGuard>
                    }
                />

                {/* Inventory - Owner and Staff, requires inventory feature */}
                <Route
                    path="inventory"
                    element={
                        <RoleGuard allowedRoles={['owner', 'staff']}>
                            <FeatureGuard feature="inventory">
                                <Inventory />
                            </FeatureGuard>
                        </RoleGuard>
                    }
                />

                {/* Settings - Super Admin and Owner only */}
                <Route
                    path="settings"
                    element={
                        <RoleGuard allowedRoles={['super_admin', 'owner']}>
                            <Settings />
                        </RoleGuard>
                    }
                />
            </Route>

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

function App() {
    return (
        <ThemeProvider>
            <Router>
                <AppRoutes />
            </Router>
        </ThemeProvider>
    );
}

export default App;
