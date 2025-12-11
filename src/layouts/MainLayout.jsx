import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
            <Sidebar />
            <Header />
            <main className="pt-20 pb-8 px-6 md:pl-72 transition-all duration-300">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
