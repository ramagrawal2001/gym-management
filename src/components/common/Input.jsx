import clsx from 'clsx';
import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, icon: Icon, className, ...props }, ref) => {
    return (
        <div className={clsx('w-full', className)}>
            {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
            <div className="relative">
                <input
                    ref={ref}
                    className={clsx(
                        'w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-offset-0 outline-none transition-all',
                        Icon ? 'pl-10' : '',
                        error
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100 text-gray-900 placeholder-gray-400'
                    )}
                    {...props}
                />
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon className="h-5 w-5 text-gray-400" />
                    </div>
                )}
            </div>
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
