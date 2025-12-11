import Card from '../common/Card';
import clsx from 'clsx';

const StatCard = ({ title, value, trend, trendLabel, icon: Icon, color }) => {
    const colorStyles = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
    };

    return (
        <Card className="flex flex-col">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
                </div>
                <div className={clsx('p-3 rounded-xl', colorStyles[color || 'blue'])}>
                    <Icon size={24} />
                </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
                {trend && (
                    <span className={clsx('font-medium flex items-center', trend > 0 ? 'text-green-600' : 'text-red-600')}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
                <span className="text-gray-400 ml-2">{trendLabel}</span>
            </div>
        </Card>
    );
};

export default StatCard;
