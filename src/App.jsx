import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
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

function App() {
    return (
        <ThemeProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route path="/" element={<MainLayout />}>
                        <Route index element={<Dashboard />} />
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

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;
