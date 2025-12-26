import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getSupportTickets, createSupportTicket, getSupportTicketById, addTicketReply } from '../services/supportService';
import { getFAQs, rateFAQ } from '../services/faqService';
import { toast } from 'react-hot-toast';
import { PlusCircle, Search, MessageCircle, CheckCircle, Clock, AlertCircle, ThumbsUp, ThumbsDown } from 'lucide-react';

export default function Support() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('tickets');
    const [tickets, setTickets] = useState([]);
    const [faqs, setFAQs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateTicket, setShowCreateTicket] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const [newTicket, setNewTicket] = useState({
        subject: '',
        description: '',
        category: 'other',
        priority: 'medium'
    });

    const [replyMessage, setReplyMessage] = useState('');

    useEffect(() => {
        if (activeTab === 'tickets') {
            fetchTickets();
        } else if (activeTab === 'faq') {
            fetchFAQs();
        }
    }, [activeTab]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await getSupportTickets();
            setTickets(response.data.data || []);
        } catch (error) {
            console.error('Error fetching tickets:', error);
            toast.error('Failed to load tickets');
        } finally {
            setLoading(false);
        }
    };

    const fetchFAQs = async () => {
        try {
            setLoading(true);
            const params = {};
            if (searchQuery) params.search = searchQuery;
            if (selectedCategory) params.category = selectedCategory;

            const response = await getFAQs(params);
            setFAQs(response.data.data || []);
        } catch (error) {
            console.error('Error fetching FAQs:', error);
            toast.error('Failed to load FAQs');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        try {
            await createSupportTicket(newTicket);
            toast.success('Support ticket created successfully');
            setShowCreateTicket(false);
            setNewTicket({ subject: '', description: '', category: 'other', priority: 'medium' });
            fetchTickets();
        } catch (error) {
            console.error('Error creating ticket:', error);
            toast.error('Failed to create ticket');
        }
    };

    const handleViewTicket = async (ticketId) => {
        try {
            const response = await getSupportTicketById(ticketId);
            setSelectedTicket(response.data.data);
        } catch (error) {
            console.error('Error fetching ticket details:', error);
            toast.error('Failed to load ticket details');
        }
    };

    const handleAddReply = async (e) => {
        e.preventDefault();
        if (!replyMessage.trim()) return;

        try {
            await addTicketReply(selectedTicket._id, replyMessage);
            toast.success('Reply added successfully');
            setReplyMessage('');
            handleViewTicket(selectedTicket._id); // Refresh ticket
        } catch (error) {
            console.error('Error adding reply:', error);
            toast.error('Failed to add reply');
        }
    };

    const handleRateFAQ = async (faqId, helpful) => {
        try {
            await rateFAQ(faqId, helpful);
            toast.success('Thank you for your feedback!');
            fetchFAQs();
        } catch (error) {
            console.error('Error rating FAQ:', error);
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Help & Support</h1>
                <p className="text-gray-600 dark:text-gray-400">Get help with your questions and issues</p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('tickets')}
                        className={`${activeTab === 'tickets'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                    >
                        <MessageCircle className="inline-block w-5 h-5 mr-2" />
                        My Tickets
                    </button>
                    <button
                        onClick={() => setActiveTab('faq')}
                        className={`${activeTab === 'faq'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                    >
                        FAQ
                    </button>
                </nav>
            </div>

            {/* My Tickets Tab */}
            {activeTab === 'tickets' && (
                <div>
                    <div className="mb-6 flex justify-between items-center">
                        <div className="flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Search tickets..."
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                            />
                        </div>
                        <button
                            onClick={() => setShowCreateTicket(true)}
                            className="ml-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <PlusCircle className="w-5 h-5 mr-2" />
                            New Ticket
                        </button>
                    </div>

                    {/* Tickets List */}
                    {loading ? (
                        <div className="text-center py-12">Loading...</div>
                    ) : tickets.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                            <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">No tickets yet. Create one to get started!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {tickets.map((ticket) => (
                                <div
                                    key={ticket._id}
                                    onClick={() => handleViewTicket(ticket._id)}
                                    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-sm font-mono text-gray-500">{ticket.ticketNumber}</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                                    {ticket.status.replace('_', ' ')}
                                                </span>
                                                <span className={`text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                                                    {ticket.priority}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{ticket.subject}</h3>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{ticket.description}</p>
                                            <div className="mt-2 text-xs text-gray-500">
                                                Created {new Date(ticket.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Create Ticket Modal */}
                    {showCreateTicket && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
                                <h2 className="text-xl font-bold mb-4">Create Support Ticket</h2>
                                <form onSubmit={handleCreateTicket}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Subject *</label>
                                            <input
                                                type="text"
                                                required
                                                value={newTicket.subject}
                                                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Description *</label>
                                            <textarea
                                                required
                                                rows={5}
                                                value={newTicket.description}
                                                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Category</label>
                                                <select
                                                    value={newTicket.category}
                                                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                                                >
                                                    <option value="membership">Membership</option>
                                                    <option value="payments">Payments</option>
                                                    <option value="classes">Classes</option>
                                                    <option value="technical">Technical</option>
                                                    <option value="complaint">Complaint</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Priority</label>
                                                <select
                                                    value={newTicket.priority}
                                                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                                                >
                                                    <option value="low">Low</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="high">High</option>
                                                    <option value="urgent">Urgent</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateTicket(false)}
                                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            Create Ticket
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Ticket Details Modal */}
                    {selectedTicket && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold mb-2">{selectedTicket.subject}</h2>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-mono text-gray-500">{selectedTicket.ticketNumber}</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>
                                                {selectedTicket.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedTicket(null)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                                    <p className="text-gray-700 dark:text-gray-300">{selectedTicket.description}</p>
                                </div>

                                {/* Replies */}
                                <div className="space-y-4 mb-6">
                                    {selectedTicket.replies?.map((reply, index) => (
                                        <div
                                            key={index}
                                            className={`p-4 rounded-lg ${reply.isStaff ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-700'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-medium">
                                                    {reply.userId?.firstName} {reply.userId?.lastName}
                                                </span>
                                                {reply.isStaff && (
                                                    <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">Staff</span>
                                                )}
                                                <span className="text-xs text-gray-500">
                                                    {new Date(reply.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-gray-700 dark:text-gray-300">{reply.message}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Add Reply */}
                                <form onSubmit={handleAddReply}>
                                    <textarea
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                        placeholder="Type your reply..."
                                        rows={3}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 mb-3"
                                    />
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Send Reply
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* FAQ Tab */}
            {activeTab === 'faq' && (
                <div>
                    <div className="mb-6 flex gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search FAQs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && fetchFAQs()}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                            />
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                fetchFAQs();
                            }}
                            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                        >
                            <option value="">All Categories</option>
                            <option value="membership">Membership</option>
                            <option value="payments">Payments</option>
                            <option value="classes">Classes</option>
                            <option value="technical">Technical</option>
                            <option value="general">General</option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">Loading...</div>
                    ) : (
                        <div className="space-y-4">
                            {faqs.map((faq) => (
                                <div key={faq._id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                                    <div className="flex items-start justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">{faq.question}</h3>
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full">
                                            {faq.category}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 mb-4">{faq.answer}</p>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="text-gray-500">Was this helpful?</span>
                                        <button
                                            onClick={() => handleRateFAQ(faq._id, true)}
                                            className="flex items-center gap-1 text-green-600 hover:text-green-700"
                                        >
                                            <ThumbsUp className="w-4 h-4" />
                                            {faq.helpful || 0}
                                        </button>
                                        <button
                                            onClick={() => handleRateFAQ(faq._id, false)}
                                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                                        >
                                            <ThumbsDown className="w-4 h-4" />
                                            {faq.notHelpful || 0}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
