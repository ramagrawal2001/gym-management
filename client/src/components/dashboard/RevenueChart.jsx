import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../common/Card';

const data = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 2000 },
    { name: 'Apr', value: 2780 },
    { name: 'May', value: 1890 },
    { name: 'Jun', value: 2390 },
    { name: 'Jul', value: 3490 },
    { name: 'Aug', value: 4200 },
    { name: 'Sep', value: 3800 },
    { name: 'Oct', value: 5100 },
    { name: 'Nov', value: 4800 },
    { name: 'Dec', value: 6000 },
];

const RevenueChart = ({ data = [] }) => {
    const chartData = data && data.length > 0 ? data : [
        { date: 'Jan', revenue: 0 },
        { date: 'Feb', revenue: 0 },
        { date: 'Mar', revenue: 0 },
        { date: 'Apr', revenue: 0 },
        { date: 'May', revenue: 0 },
        { date: 'Jun', revenue: 0 }
    ];

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Overview</h3>
                <select className="text-sm border-gray-300 dark:border-slate-600 rounded-lg text-gray-500 dark:text-gray-400 dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500">
                    <option>This Year</option>
                    <option>Last Year</option>
                </select>
            </div>

            <div className="h-80 w-full min-h-[320px] min-w-0">
                <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                            name="Revenue"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default RevenueChart;
