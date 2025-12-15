import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Mail, User } from 'lucide-react';
import { register } from '../store/slices/authSlice';
import { useNotification } from '../hooks/useNotification';

const Register = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { error: showError, success: showSuccess } = useNotification();
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'member'
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await dispatch(register(formData)).unwrap();
            if (result) {
                showSuccess('Registration successful!');
                navigate('/');
            }
        } catch (err) {
            const errorMessage = err || 'Registration failed. Please try again.';
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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Sign up to get started</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="First Name"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Last Name"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        placeholder="user@example.com"
                        icon={Mail}
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="Phone Number"
                        name="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 px-4 py-3 rounded-lg text-sm">
                        <p>After registration, you'll use OTP-based login with your email address.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Role
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="block w-full rounded-lg border border-gray-300 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                        >
                            <option value="member">Member</option>
                            <option value="staff">Staff</option>
                            <option value="owner">Owner</option>
                        </select>
                    </div>
                    <Button 
                        variant="primary" 
                        size="lg" 
                        className="w-full shadow-lg shadow-blue-500/30"
                        isLoading={isLoading}
                        disabled={isLoading}
                    >
                        Create Account
                    </Button>
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;

