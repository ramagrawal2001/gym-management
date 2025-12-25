import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, QrCode, FileText, Settings, Download, Upload, RefreshCw, Users, BarChart3 } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/common/Table';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import * as attendanceService from '../services/attendanceService';
import { useNotification } from '../hooks/useNotification';
import { format } from 'date-fns';

const Attendance = () => {
    const [activeTab, setActiveTab] = useState('today');
    const [loading, setLoading] = useState(false);
    const [attendance, setAttendance] = useState([]);
    const [stats, setStats] = useState({ present: 0, active: 0, total: 0, methodBreakdown: {} });
    const [memberId, setMemberId] = useState('');
    const [config, setConfig] = useState(null);
    const [reports, setReports] = useState(null);
    const [reportPeriod, setReportPeriod] = useState('daily');
    const [showOverrideModal, setShowOverrideModal] = useState(false);
    const [selectedAttendance, setSelectedAttendance] = useState(null);
    const [overrideData, setOverrideData] = useState({ action: 'force_checkout', reason: '' });
    const [qrInput, setQrInput] = useState('');
    const { success: showSuccess, error: showError } = useNotification();

    useEffect(() => {
        fetchTodayAttendance();
        fetchConfig();
    }, []);

    const fetchTodayAttendance = async () => {
        setLoading(true);
        try {
            const response = await attendanceService.getTodayAttendance();
            if (response.data.success) {
                setAttendance(response.data.data.attendance || []);
                setStats(response.data.data.stats || { present: 0, active: 0, total: 0, methodBreakdown: {} });
            }
        } catch (error) {
            showError('Failed to fetch attendance');
        } finally {
            setLoading(false);
        }
    };

    const fetchConfig = async () => {
        try {
            const response = await attendanceService.getAttendanceConfig();
            if (response.data.success) {
                setConfig(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch config:', error);
        }
    };

    const fetchReports = async (period = reportPeriod) => {
        setLoading(true);
        try {
            const response = await attendanceService.getReports({ period });
            if (response.data.success) {
                setReports(response.data.data);
            }
        } catch (error) {
            showError('Failed to fetch reports');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        if (!memberId.trim()) {
            showError('Please enter member ID');
            return;
        }
        try {
            const response = await attendanceService.checkIn(memberId);
            if (response.data.success) {
                showSuccess('Check-in successful');
                setMemberId('');
                fetchTodayAttendance();
            }
        } catch (error) {
            showError(error.response?.data?.message || 'Check-in failed');
        }
    };

    const handleQrCheckIn = async () => {
        if (!qrInput.trim()) {
            showError('Please enter or scan QR code');
            return;
        }
        try {
            const response = await attendanceService.qrCheckIn(qrInput);
            if (response.data.success) {
                showSuccess('QR Check-in successful');
                setQrInput('');
                fetchTodayAttendance();
            }
        } catch (error) {
            showError(error.response?.data?.message || 'QR Check-in failed');
        }
    };

    const handleCheckOut = async (attendanceId) => {
        try {
            const response = await attendanceService.checkOut(attendanceId);
            if (response.data.success) {
                showSuccess('Check-out successful');
                fetchTodayAttendance();
            }
        } catch (error) {
            showError(error.response?.data?.message || 'Check-out failed');
        }
    };

    const handleOverride = async () => {
        if (overrideData.reason.length < 10) {
            showError('Reason must be at least 10 characters');
            return;
        }
        try {
            const response = await attendanceService.staffOverride({
                attendanceId: selectedAttendance._id,
                action: overrideData.action,
                reason: overrideData.reason
            });
            if (response.data.success) {
                showSuccess('Override applied successfully');
                setShowOverrideModal(false);
                setSelectedAttendance(null);
                setOverrideData({ action: 'force_checkout', reason: '' });
                fetchTodayAttendance();
            }
        } catch (error) {
            showError(error.response?.data?.message || 'Override failed');
        }
    };

    const handleExport = async () => {
        try {
            const response = await attendanceService.exportAttendance({});
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `attendance_export_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            showSuccess('Export downloaded');
        } catch (error) {
            showError('Export failed');
        }
    };

    const handleToggleAttendance = async () => {
        try {
            const response = await attendanceService.toggleAttendance(!config.isEnabled);
            if (response.data.success) {
                setConfig(response.data.data);
                showSuccess(`Attendance ${!config.isEnabled ? 'enabled' : 'disabled'}`);
            }
        } catch (error) {
            showError('Failed to toggle attendance');
        }
    };

    const handleMethodToggle = async (method) => {
        const currentMethods = config.activeMethods || [];
        let newMethods;

        if (currentMethods.includes(method)) {
            // Don't allow removing the last method
            if (currentMethods.length === 1) {
                showError('At least one check-in method must be active');
                return;
            }
            newMethods = currentMethods.filter(m => m !== method);
        } else {
            newMethods = [...currentMethods, method];
        }

        try {
            const response = await attendanceService.updateAttendanceConfig({ activeMethods: newMethods });
            if (response.data.success) {
                setConfig(response.data.data);
                showSuccess('Active methods updated');
            }
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to update methods');
        }
    };

    // Method descriptions for user understanding
    const methodInfo = {
        manual: {
            name: 'Manual Entry',
            icon: Users,
            description: 'Staff manually enters member ID or name to check in members.',
            authenticity: 'Low - Relies on staff verification',
            pros: ['Simple and quick', 'No special hardware needed', 'Works for all members'],
            cons: ['Can be prone to errors', 'Requires staff presence', 'No verification of member identity']
        },
        qr: {
            name: 'QR Code',
            icon: QrCode,
            description: 'Members scan their unique QR code at entry. Can be displayed on phone or printed card.',
            authenticity: 'Medium - QR codes can be shared/copied',
            pros: ['Fast check-in', 'Self-service possible', 'Works offline'],
            cons: ['QR can be shared between members', 'Requires scanner device', 'Phone battery dependent']
        },
        nfc: {
            name: 'NFC Card/Tag',
            icon: Clock,
            description: 'Members tap their NFC-enabled card or wristband on reader for check-in.',
            authenticity: 'Medium-High - Physical card required',
            pros: ['Very fast tap-and-go', 'Hard to duplicate', 'No phone needed'],
            cons: ['Requires NFC reader hardware', 'Card replacement costs', 'Cards can be lost/stolen']
        },
        biometric: {
            name: 'Biometric',
            icon: CheckCircle,
            description: 'Fingerprint or face recognition ensures only the actual member can check in.',
            authenticity: 'High - Cannot be shared or duplicated',
            pros: ['Highest security', 'Cannot be shared', 'No cards to lose'],
            cons: ['Expensive hardware', 'Privacy concerns', 'Technical failures possible']
        }
    };

    const tabs = [
        { id: 'today', label: "Today's Attendance", icon: Calendar },
        { id: 'reports', label: 'Reports', icon: BarChart3 },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance</h1>
                    <p className="text-gray-500 dark:text-gray-400">Track daily check-ins and manage attendance.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExport}>
                        <Download size={16} className="mr-2" />
                        Export
                    </Button>
                    <Button variant="ghost" onClick={fetchTodayAttendance}>
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-slate-700">
                <nav className="flex gap-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                if (tab.id === 'reports') fetchReports();
                            }}
                            className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Today's Attendance Tab */}
            {activeTab === 'today' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        {/* Quick Check-in - Supports multiple methods */}
                        <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white dark:from-blue-700 dark:to-blue-800">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-white">Quick Check-in</h3>
                                <div className="flex gap-1">
                                    {config?.activeMethods?.map(m => (
                                        <Badge key={m} className="bg-white/20 text-white border-0 capitalize text-xs">
                                            {m}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Manual Check-in - always show if active */}
                            {(!config || config.activeMethods?.includes('manual')) && (
                                <div className="mb-4">
                                    <p className="text-blue-100 text-sm mb-2 flex items-center gap-2">
                                        <Users size={14} /> Manual Entry
                                    </p>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Member ID"
                                            className="bg-white/10 border-white/20 text-white placeholder-blue-200 focus:bg-white/20 focus:border-white focus:ring-0"
                                            value={memberId}
                                            onChange={(e) => setMemberId(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleCheckIn()}
                                        />
                                        <Button
                                            className="bg-white text-blue-600 hover:bg-blue-50"
                                            onClick={handleCheckIn}
                                        >
                                            Check In
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* QR Check-in */}
                            {config?.activeMethods?.includes('qr') && (
                                <div className="mb-4">
                                    <p className="text-blue-100 text-sm mb-2 flex items-center gap-2">
                                        <QrCode size={14} /> QR Code Scan
                                    </p>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Enter or scan QR Code"
                                            className="bg-white/10 border-white/20 text-white placeholder-blue-200 focus:bg-white/20 focus:border-white focus:ring-0"
                                            value={qrInput}
                                            onChange={(e) => setQrInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleQrCheckIn()}
                                        />
                                        <Button
                                            className="bg-white text-blue-600 hover:bg-blue-50"
                                            onClick={handleQrCheckIn}
                                        >
                                            Scan
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* NFC info */}
                            {config?.activeMethods?.includes('nfc') && (
                                <div className="mb-4 p-3 bg-white/10 rounded-lg">
                                    <p className="text-blue-100 text-sm flex items-center gap-2">
                                        <Clock size={14} /> NFC Card Ready
                                    </p>
                                    <p className="text-blue-200 text-xs mt-1">Tap NFC card on reader for instant check-in</p>
                                </div>
                            )}

                            {/* Biometric info */}
                            {config?.activeMethods?.includes('biometric') && (
                                <div className="mb-4 p-3 bg-white/10 rounded-lg">
                                    <p className="text-blue-100 text-sm flex items-center gap-2">
                                        <CheckCircle size={14} /> Biometric Scanner Ready
                                    </p>
                                    <p className="text-blue-200 text-xs mt-1">Use fingerprint or face scan for secure check-in</p>
                                </div>
                            )}

                            {/* Link to settings */}
                            <button
                                onClick={() => setActiveTab('settings')}
                                className="mt-2 text-xs text-blue-200 hover:text-white underline"
                            >
                                Manage check-in methods →
                            </button>
                        </Card>

                        <div className="grid grid-cols-2 gap-4">
                            <Card className="p-4 text-center">
                                <div className="w-10 h-10 mx-auto bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-2">
                                    <CheckCircle size={20} />
                                </div>
                                <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.present}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Present Today</p>
                            </Card>
                            <Card className="p-4 text-center">
                                <div className="w-10 h-10 mx-auto bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center mb-2">
                                    <Clock size={20} />
                                </div>
                                <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Currently In</p>
                            </Card>
                        </div>

                        {stats.methodBreakdown && (
                            <Card className="p-4">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Check-in Methods</h4>
                                <div className="space-y-2">
                                    {Object.entries(stats.methodBreakdown).map(([method, count]) => (
                                        <div key={method} className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{method}</span>
                                            <Badge variant="gray">{count}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>

                    <div className="lg:col-span-2">
                        <Card className="overflow-hidden">
                            <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                                <h3 className="font-semibold text-gray-900 dark:text-white">Today's Logs ({stats.total})</h3>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Member</TableHead>
                                        <TableHead>Check In</TableHead>
                                        <TableHead>Check Out</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8">
                                                <RefreshCw size={24} className="animate-spin mx-auto text-gray-400" />
                                            </TableCell>
                                        </TableRow>
                                    ) : attendance.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                No attendance records today
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        attendance.map((item) => (
                                            <TableRow key={item._id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
                                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.memberId?._id}`} alt="Avatar" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900 dark:text-white">
                                                                {item.memberId?.userId?.firstName} {item.memberId?.userId?.lastName}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                #{item.memberId?.memberId}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{format(new Date(item.checkIn), 'hh:mm a')}</TableCell>
                                                <TableCell>
                                                    {item.checkOut ? format(new Date(item.checkOut), 'hh:mm a') : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={item.method === 'qr' ? 'blue' : 'gray'}>
                                                        {item.method}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={item.status === 'completed' ? 'gray' : 'success'}>
                                                        {item.status === 'completed' ? 'Completed' : 'Active'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {item.status === 'active' ? (
                                                        <div className="flex gap-2">
                                                            <Button size="sm" onClick={() => handleCheckOut(item._id)}>
                                                                Check Out
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => {
                                                                    setSelectedAttendance(item);
                                                                    setShowOverrideModal(true);
                                                                }}
                                                            >
                                                                Override
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">
                                                            {item.duration} mins
                                                        </span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
                <div className="space-y-6">
                    <Card className="p-4">
                        <div className="flex gap-4 items-center">
                            <select
                                value={reportPeriod}
                                onChange={(e) => {
                                    setReportPeriod(e.target.value);
                                    fetchReports(e.target.value);
                                }}
                                className="border rounded-lg px-3 py-2 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                            <Button onClick={() => fetchReports(reportPeriod)}>
                                <RefreshCw size={16} className={loading ? 'animate-spin mr-2' : 'mr-2'} />
                                Refresh
                            </Button>
                        </div>
                    </Card>

                    {reports && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Card className="p-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Check-ins</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{reports.summary?.totalCheckIns || 0}</p>
                                </Card>
                                <Card className="p-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Unique Members</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{reports.summary?.uniqueMembers || 0}</p>
                                </Card>
                                <Card className="p-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Avg Duration</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{reports.summary?.avgDuration || '0 mins'}</p>
                                </Card>
                                <Card className="p-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Peak Hour</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{reports.summary?.peakHour || '-'}</p>
                                </Card>
                            </div>

                            <Card className="p-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Daily Breakdown</h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Total Check-ins</TableHead>
                                            <TableHead>Completed</TableHead>
                                            <TableHead>Avg Duration</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reports.dailyBreakdown?.map((day) => (
                                            <TableRow key={day.date}>
                                                <TableCell>{day.date}</TableCell>
                                                <TableCell>{day.total}</TableCell>
                                                <TableCell>{day.completed}</TableCell>
                                                <TableCell>{day.avgDuration} mins</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Card>
                        </>
                    )}
                </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && config && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Attendance Status</h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400">Enable/Disable Attendance</p>
                                <p className="text-sm text-gray-500 dark:text-gray-500">
                                    {config.isEnabled ? 'Attendance is currently enabled' : 'Attendance is disabled'}
                                </p>
                            </div>
                            <Button
                                variant={config.isEnabled ? 'danger' : 'primary'}
                                onClick={handleToggleAttendance}
                            >
                                {config.isEnabled ? 'Disable' : 'Enable'}
                            </Button>
                        </div>
                    </Card>

                    {/* Active Methods - Multiple selection */}
                    <Card className="p-6 md:col-span-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Active Check-in Methods</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Select one or more methods members can use to check in. You can enable multiple methods simultaneously.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {config.availableMethods?.map((method) => {
                                const info = methodInfo[method];
                                const isActive = config.activeMethods?.includes(method);
                                const Icon = info?.icon || Users;
                                return (
                                    <div
                                        key={method}
                                        onClick={() => handleMethodToggle(method)}
                                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${isActive
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-slate-700'
                                                }`}>
                                                <Icon className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'} size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-gray-900 dark:text-white">{info?.name || method}</p>
                                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isActive ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-slate-600'
                                                        }`}>
                                                        {isActive && <span className="text-white text-xs">✓</span>}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{info?.description}</p>
                                                <Badge className="mt-2" variant={
                                                    info?.authenticity?.includes('High') ? 'success' :
                                                        info?.authenticity?.includes('Medium-High') ? 'info' :
                                                            info?.authenticity?.includes('Medium') ? 'warning' : 'gray'
                                                }>
                                                    {info?.authenticity || 'Unknown'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Currently active methods display */}
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                <strong>Currently Active:</strong>{' '}
                                {config.activeMethods?.map((m, i) => (
                                    <Badge key={m} className="mr-1 capitalize">{methodInfo[m]?.name || m}</Badge>
                                ))}
                            </p>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">QR Settings</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">QR Type</span>
                                <Badge>{config.qrSettings?.type || 'static'}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">Multiple Check-ins</span>
                                <Badge variant={config.qrSettings?.allowMultipleCheckins ? 'success' : 'gray'}>
                                    {config.qrSettings?.allowMultipleCheckins ? 'Allowed' : 'Not Allowed'}
                                </Badge>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Auto Checkout</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">Status</span>
                                <Badge variant={config.autoCheckout?.enabled ? 'success' : 'gray'}>
                                    {config.autoCheckout?.enabled ? 'Enabled' : 'Disabled'}
                                </Badge>
                            </div>
                            {config.autoCheckout?.enabled && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">After Hours</span>
                                    <span className="text-gray-900 dark:text-white">{config.autoCheckout?.afterHours} hours</span>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            )}

            {/* Override Modal */}
            <Modal
                isOpen={showOverrideModal}
                onClose={() => {
                    setShowOverrideModal(false);
                    setSelectedAttendance(null);
                    setOverrideData({ action: 'force_checkout', reason: '' });
                }}
                title="Staff Override"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Action
                        </label>
                        <select
                            value={overrideData.action}
                            onChange={(e) => setOverrideData({ ...overrideData, action: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                        >
                            <option value="force_checkout">Force Checkout</option>
                            <option value="manual_checkout">Manual Checkout</option>
                            <option value="modify_time">Modify Time</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Reason (min 10 characters)
                        </label>
                        <textarea
                            value={overrideData.reason}
                            onChange={(e) => setOverrideData({ ...overrideData, reason: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                            rows={3}
                            placeholder="Enter reason for override..."
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setShowOverrideModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleOverride}>
                            Apply Override
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Attendance;
