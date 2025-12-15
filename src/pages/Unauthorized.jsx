import { Link } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';
import Button from '../components/common/Button';

const Unauthorized = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-slate-800 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto flex items-center justify-center mb-4">
                    <AlertCircle className="text-red-600 dark:text-red-400" size={32} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    You don't have permission to access this page. Please contact your administrator if you believe this is an error.
                </p>
                <Link to="/">
                    <Button variant="primary" className="w-full">
                        <Home size={20} className="mr-2" />
                        Go to Dashboard
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default Unauthorized;

