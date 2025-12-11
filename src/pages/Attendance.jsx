import { useState } from 'react';
import { Calendar, CheckCircle, Clock } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/common/Table';
import Badge from '../components/common/Badge';

const Attendance = () => {
    const [memberId, setMemberId] = useState('');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance</h1>
                <p className="text-gray-500 dark:text-gray-400">Track daily check-ins.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <Card className="p-6 bg-blue-600 text-white dark:bg-blue-700 dark:border-blue-600">
                        <h3 className="text-lg font-semibold mb-2 text-white">Quick Check-in</h3>
                        <p className="text-blue-100 text-sm mb-6">Enter member ID or scan code.</p>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Member ID"
                                className="bg-white/10 border-white/20 text-white placeholder-blue-200 focus:bg-white/20 focus:border-white focus:ring-0 dark:bg-slate-900/40"
                                value={memberId}
                                onChange={(e) => setMemberId(e.target.value)}
                            />
                            <Button className="bg-white text-blue-600 hover:bg-blue-50 dark:bg-slate-900 dark:text-blue-400 dark:hover:bg-slate-800">Check In</Button>
                        </div>
                    </Card>

                    <div className="grid grid-cols-2 gap-4">
                        <Card className="p-4 text-center">
                            <div className="w-10 h-10 mx-auto bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-2">
                                <CheckCircle size={20} />
                            </div>
                            <h4 className="text-2xl font-bold text-gray-900 dark:text-white">124</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Present Today</p>
                        </Card>
                        <Card className="p-4 text-center">
                            <div className="w-10 h-10 mx-auto bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center mb-2">
                                <Clock size={20} />
                            </div>
                            <h4 className="text-2xl font-bold text-gray-900 dark:text-white">45</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Currently In</p>
                        </Card>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <Card className="overflow-hidden">
                        <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Today's Logs</h3>
                            <Button variant="ghost" size="sm">View All</Button>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Member</TableHead>
                                    <TableHead>Check In</TableHead>
                                    <TableHead>Check Out</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[1, 2, 3, 4, 5].map((item) => (
                                    <TableRow key={item}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
                                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=att-${item}`} alt="Avatar" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">Alex Morgan</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">#M230{item}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>09:3{item} AM</TableCell>
                                        <TableCell>{item % 2 === 0 ? `11:0${item} AM` : '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant={item % 2 === 0 ? 'gray' : 'success'}>
                                                {item % 2 === 0 ? 'Completed' : 'Active'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Attendance;
