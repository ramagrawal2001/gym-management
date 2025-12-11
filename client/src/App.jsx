import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import MemberProfile from './pages/MemberProfile';
import Plans from './pages/Plans';
import Payments from './pages/Payments';
import Attendance from './pages/Attendance';
import Trainers from './pages/Trainers';
import Inventory from './pages/Inventory';
import Settings from './pages/Settings';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="members" element={<Members />} />
          <Route path="members/:id" element={<MemberProfile />} />
          <Route path="plans" element={<Plans />} />
          <Route path="payments" element={<Payments />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="trainers" element={<Trainers />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
