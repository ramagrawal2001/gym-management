import { useState } from 'react';
import { CalendarCheck, Clock, CheckCircle, XCircle } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/common/Table';
import Badge from '../components/common/Badge';

const attendanceData = [
    { id: 1, name: 'John Doe', timeIn: '09:30 AM', timeOut: '11:00 AM', status: 'Present', date: '2023-10-25' },
    { id: 2, name: 'Mike Johnson', timeIn: '07:15 AM', timeOut: '08:45 AM', status: 'Present', date: '2023-10-25' },
    { id: 3, name: 'Sarah Wilson', timeIn: '-', timeOut: '-', status: 'Absent', date: '2023-10-25' },
    { id: 4, name: 'Jane Smith', timeIn: '06:00 PM', timeOut: '-', status: 'Checked In', date: '2023-10-25' },
];

const Attendance = () => {
    const [memberId, setMemberId] = useState('');

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Check-in Section */}
                <div className="md:w-1/3 space-y-6">
                    <Card className="bg-blue-600 text-white border-blue-600">
                        <h2 className="text-xl font-bold mb-2">Quick Check-in</h2>
                        <p className="text-blue-100 text-sm mb-6">Enter Member ID or scan QR code</p>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Member ID"
                                className="w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none"
                                value={memberId}
                                onChange={(e) => setMemberId(e.target.value)}
                            />
                            <Button className="w-full bg-white text-blue-600 hover:bg-blue-50">Check In Now</Button>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="font-bold text-gray-900 mb-4">Today's Stats</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-green-50 rounded-lg text-center">
                                <div className="text-2xl font-bold text-green-600">45</div>
                                <div className="text-xs text-green-800 font-medium">Present</div>
                            </div>
                            <div className="p-4 bg-orange-50 rounded-lg text-center">
                                <div className="text-2xl font-bold text-orange-600">12</div>
                                <div className="text-xs text-orange-800 font-medium">Currently In</div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Logs Section */}
                <div className="md:w-2/3">
                    <Card className="h-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Attendance Log</h3>
                            <input type="date" className="border border-gray-300 rounded-lg px-3 py-1 text-sm outline-none" />
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Member</TableHead>
                                    <TableHead>Time In</TableHead>
                                    <TableHead>Time Out</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {attendanceData.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell className="font-medium text-gray-900">{record.name}</TableCell>
                                        <TableCell>{record.timeIn}</TableCell>
                                        <TableCell>{record.timeOut}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                record.status === 'Present' ? 'success' :
                                                    record.status === 'Absent' ? 'danger' : 'warning'
                                            }>
                                                {record.status}
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
