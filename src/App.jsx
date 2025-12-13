import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
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
import { getCurrentUser } from './store/slices/authSlice';
import { getGym } from './store/slices/gymSlice';
import { useAuth } from './hooks/useAuth';

function AppRoutes() {
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && !isAuthenticated) {
            dispatch(getCurrentUser());
        }
    }, [dispatch, isAuthenticated]);

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

            <Route 
                path="/" 
                element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Dashboard />} />
                <Route path="gyms" element={<Gyms />} />
                <Route path="crm" element={<CRM />} />
                <Route path="schedule" element={<Schedule />} />
                <Route path="members" element={<Members />} />
                <Route path="members/:id" element={<MemberProfile />} />
                <Route path="plans" element={<Plans />} />
                <Route path="payments" element={<Payments />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="trainers" element={<Trainers />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="settings" element={<Settings />} />
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
