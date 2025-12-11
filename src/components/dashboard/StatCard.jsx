import Card from '../common/Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { clsx } from 'clsx';

const StatCard = ({ title, value, trend, trendValue, icon: Icon, color = 'blue' }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
        orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
    };

    const isPositive = trend === 'up';

    return (
        <Card className="p-6">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>

                    <div className="flex items-center mt-2 gap-2">
                        <span className={clsx(
                            "flex items-center text-xs font-medium px-2 py-0.5 rounded-full",
                            isPositive
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        )}>
                            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            <span className="ml-1">{trendValue}</span>
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">vs last month</span>
                    </div>
                </div>

                <div className={clsx("p-3 rounded-xl", colors[color])}>
                    <Icon size={24} />
                </div>
            </div>
        </Card>
    );
};

export default StatCard;
