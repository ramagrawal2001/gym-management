import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getSupportTickets, updateSupportTicket, assignTicket, getTicketStats } from '../services/supportService';
import { getStaff } from '../services/staffService';
import { toast } from 'react-hot-toast';
import { MessageCircle, Filter, User, CheckCircle2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SupportTickets() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [staff, setStaff] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPriority, setFilterPriority] = useState('');

    useEffect(() => {
        fetchTickets();
        fetchStaff();
        fetchStats();
    }, [filterStatus, filterPriority]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filterStatus) params.status = filterStatus;
            if (filterPriority) params.priority = filterPriority;

            const response = await getSupportTickets(params);
            setTickets(response.data.data || []);
        } catch (error) {
            console.error('Error fetching tickets:', error);
            toast.error('Failed to load tickets');
        } finally {
            setLoading(false);
        }
    };

    const fetchStaff = async () => {
        try {
            const response = await getStaff();
            setStaff(response.data.data || []);
        } catch (error) {
            console.error('Error fetching staff:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await getTicketStats();
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleUpdateStatus = async (ticketId, status) => {
        try {
            await updateSupportTicket(ticketId, { status });
            toast.success('Ticket status updated');
            fetchTickets();
            fetchStats();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleAssignTicket = async (ticketId, assignedTo) => {
        try {
            await assignTicket(ticketId, assignedTo);
            toast.success('Ticket assigned successfully');
            fetchTickets();
        } catch (error) {
            console.error('Error assigning ticket:', error);
            toast.error('Failed to assign ticket');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            open: 'bg-blue-100 text-blue-800',
            in_progress: 'bg-yellow-100 text-yellow-800',
            resolved: 'bg-green-100 text-green-800',
            closed: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            low: 'text-green-600',
            medium: 'text-yellow-600',
            high: 'text-orange-600',
            urgent: 'text-red-600'
        };
        return colors[priority] || 'text-gray-600';
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <MessageCircle className="w-7 h-7" />
                    Support Tickets
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Manage customer support requests</p>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{stats.open}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Open</div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{stats.in_progress}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Resolved</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-gray-600">{stats.total}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6 flex gap-4">
                <div className="flex-1">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    >
                        <option value="">All Status</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
                <div className="flex-1">
                    <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    >
                        <option value="">All Priorities</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>
            </div>

            {/* Tickets Table */}
            {loading ? (
                <div className="text-center py-12">Loading...</div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {tickets.map((ticket) => (
                                <tr key={ticket._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                                        {ticket.ticketNumber}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {ticket.userId?.firstName} {ticket.userId?.lastName}
                                        </div>
                                        <div className="text-sm text-gray-500">{ticket.userId?.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 dark:text-white">{ticket.subject}</div>
                                        <div className="text-sm text-gray-500 line-clamp-1">{ticket.description}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                                            {ticket.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={ticket.status}
                                            onChange={(e) => handleUpdateStatus(ticket._id, e.target.value)}
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)} border-none`}
                                        >
                                            <option value="open">Open</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={ticket.assignedTo?._id || ''}
                                            onChange={(e) => handleAssignTicket(ticket._id, e.target.value)}
                                            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm"
                                        >
                                            <option value="">Unassigned</option>
                                            {staff.map((s) => (
                                                <option key={s._id} value={s.userId._id}>
                                                    {s.userId.firstName} {s.userId.lastName}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button
                                            onClick={() => navigate('/support')}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
