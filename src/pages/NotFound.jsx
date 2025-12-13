import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-gray-200 dark:text-slate-800">404</h1>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">Page Not Found</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <div className="flex gap-4 justify-center">
                    <Link to="/">
                        <Button>
                            <Home size={18} className="mr-2" />
                            Go Home
                        </Button>
                    </Link>
                    <Button variant="secondary" onClick={() => window.history.back()}>
                        <ArrowLeft size={18} className="mr-2" />
                        Go Back
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;

