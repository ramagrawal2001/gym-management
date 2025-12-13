import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Lock, Mail } from 'lucide-react';
import { login } from '../store/slices/authSlice';
import { useNotification } from '../hooks/useNotification';

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { error: showError } = useNotification();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await dispatch(login(formData)).unwrap();
            if (result) {
                navigate('/');
            }
        } catch (err) {
            const errorMessage = err || 'Login failed. Please check your credentials.';
            setError(errorMessage);
            showError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-slate-800">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 transform -rotate-12 shadow-lg hover:rotate-0 transition-transform duration-300">
                        <span className="text-white font-bold text-3xl">G</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Sign in to manage your gym</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        placeholder="admin@gympro.com"
                        icon={Mail}
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        icon={Lock}
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <div className="flex items-center justify-between">
                        <label className="flex items-center">
                            <input type="checkbox" className="rounded border-gray-300 dark:border-slate-600 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-slate-800" />
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Remember me</span>
                        </label>
                        <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">Forgot Password?</a>
                    </div>
                    <Button 
                        variant="primary" 
                        size="lg" 
                        className="w-full shadow-lg shadow-blue-500/30"
                        isLoading={isLoading}
                        disabled={isLoading}
                    >
                        Sign In
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default Login;
