import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Mail, KeyRound, ArrowLeft } from 'lucide-react';
import { requestOtp, verifyOtp } from '../store/slices/authSlice';
import { useNotification } from '../hooks/useNotification';

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { error: showError, success: showSuccess } = useNotification();
    const [loginMode, setLoginMode] = useState('email'); // 'email', 'otp'
    const [formData, setFormData] = useState({
        email: '',
        otp: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        if (!formData.email) {
            setError('Please enter your email address');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            await dispatch(requestOtp(formData.email)).unwrap();
            setOtpSent(true);
            setLoginMode('otp');
            showSuccess('OTP sent to your email');
            
            // Start countdown (10 minutes = 600 seconds)
            setCountdown(600);
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (err) {
            const errorMessage = err || 'Failed to send OTP';
            setError(errorMessage);
            showError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await dispatch(verifyOtp({ 
                email: formData.email, 
                otp: formData.otp 
            })).unwrap();
            
            if (result && result.user) {
                navigate('/');
            }
        } catch (err) {
            const errorMessage = err || 'Invalid OTP';
            setError(errorMessage);
            showError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToEmail = () => {
        setLoginMode('email');
        setOtpSent(false);
        setFormData({ ...formData, otp: '' });
        setError('');
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-slate-800">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 transform -rotate-12 shadow-lg hover:rotate-0 transition-transform duration-300">
                        <span className="text-white font-bold text-3xl">G</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        {loginMode === 'otp' ? 'Enter OTP sent to your email' : 'Sign in with OTP'}
                    </p>
                </div>

                {loginMode === 'email' && (
                    <form onSubmit={handleRequestOtp} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            placeholder="your@email.com"
                            icon={Mail}
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <Button 
                            variant="primary" 
                            size="lg" 
                            className="w-full shadow-lg shadow-blue-500/30"
                            isLoading={isLoading}
                            disabled={isLoading}
                        >
                            <KeyRound size={20} className="mr-2" />
                            Send OTP
                        </Button>
                        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                            We'll send a 6-digit OTP code to your email
                        </p>
                    </form>
                )}

                {loginMode === 'otp' && (
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 px-4 py-3 rounded-lg text-sm">
                            OTP sent to <strong>{formData.email}</strong>
                        </div>
                        <Input
                            label="Enter OTP"
                            name="otp"
                            type="text"
                            placeholder="123456"
                            icon={KeyRound}
                            value={formData.otp}
                            onChange={handleChange}
                            maxLength={6}
                            required
                            className="text-center text-2xl tracking-widest font-mono"
                        />
                        {countdown > 0 && (
                            <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                                OTP expires in: <strong>{formatTime(countdown)}</strong>
                            </p>
                        )}
                        <div className="flex gap-3">
                            <Button 
                                variant="primary" 
                                size="lg" 
                                className="flex-1 shadow-lg shadow-blue-500/30"
                                isLoading={isLoading}
                                disabled={isLoading || countdown === 0}
                            >
                                Verify OTP
                            </Button>
                            <Button 
                                type="button"
                                variant="ghost" 
                                size="lg" 
                                onClick={handleBackToEmail}
                                disabled={isLoading}
                            >
                                <ArrowLeft size={20} />
                            </Button>
                        </div>
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleRequestOtp}
                                disabled={isLoading || countdown > 0}
                                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Resend OTP {countdown > 0 && `(${formatTime(countdown)})`}
                            </button>
                        </div>
                    </form>
                )}

            </div>
        </div>
    );
};

export default Login;
