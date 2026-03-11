import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, LayoutGrid, List as ListIcon, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { getLeads, deleteLead } from '../../services/superAdminLeadService';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import LeadFormModal from '../../components/super-admin/leads/LeadFormModal';
import LeadDetailsDrawer from '../../components/super-admin/leads/LeadDetailsDrawer';
import KanbanBoard from '../../components/super-admin/leads/KanbanBoard';

const STATUSES = ['New', 'Contacted', 'Demo Scheduled', 'Negotiation', 'Converted', 'Lost'];

const LeadCRM = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('kanban'); // 'list' or 'kanban'
    const [searchQuery, setSearchQuery] = useState('');

    // Modals
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedLeadForEdit, setSelectedLeadForEdit] = useState(null);
    const [selectedLeadForDetails, setSelectedLeadForDetails] = useState(null);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const res = await getLeads();
            // Ensure we extract array depending on API structure
            const leadData = res.data?.data || res.data || [];
            const leadsArray = Array.isArray(leadData) ? leadData : [];
            setLeads(leadsArray);

            // Update the selected lead detail popup with fresh data
            setSelectedLeadForDetails(prev => {
                if (!prev) return null;
                return leadsArray.find(l => l._id === prev._id) || null;
            });
        } catch (error) {
            toast.error('Failed to load leads');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        setSelectedLeadForEdit(null);
        setIsFormOpen(true);
    };

    const handleEdit = (lead) => {
        setSelectedLeadForEdit(lead);
        setIsFormOpen(true);
    };

    const handleViewDetails = (lead) => {
        setSelectedLeadForDetails(lead);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this lead?')) {
            try {
                await deleteLead(id);
                toast.success('Lead deleted successfully');
                fetchLeads();
            } catch (error) {
                toast.error('Failed to delete lead');
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'New': return 'blue';
            case 'Contacted': return 'yellow';
            case 'Demo Scheduled': return 'purple';
            case 'Negotiation': return 'orange';
            case 'Converted': return 'green';
            case 'Lost': return 'red';
            default: return 'gray';
        }
    };

    const filteredLeads = leads.filter(lead => {
        if (!searchQuery) return true;
        const lowerQuery = searchQuery.toLowerCase();
        return (
            lead.businessName?.toLowerCase().includes(lowerQuery) ||
            lead.contactName?.toLowerCase().includes(lowerQuery) ||
            lead.email?.toLowerCase().includes(lowerQuery)
        );
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lead CRM</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage B2B platform leads and sales pipeline</p>
                </div>
                <button
                    onClick={handleCreateNew}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    <span>Add Lead</span>
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                    <div className="relative flex-1 max-w-md w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search leads by name, email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="bg-gray-100 dark:bg-slate-900 p-1 rounded-lg flex items-center">
                            <button
                                onClick={() => setViewMode('kanban')}
                                className={`p-2 rounded-md flex items-center gap-2 transition-colors ${viewMode === 'kanban'
                                    ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <LayoutGrid size={18} />
                                <span className="hidden sm:inline text-sm font-medium">Board</span>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md flex items-center gap-2 transition-colors ${viewMode === 'list'
                                    ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <ListIcon size={18} />
                                <span className="hidden sm:inline text-sm font-medium">List</span>
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                    </div>
                ) : viewMode === 'list' ? (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Business/Contact</TableHead>
                                    <TableHead>Contact Info</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Expected Value</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLeads.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                            No leads found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLeads.map((lead) => (
                                        <TableRow key={lead._id}>
                                            <TableCell>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {lead.businessName}
                                                </div>
                                                <div className="text-sm text-gray-500">{lead.contactName}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{lead.email}</div>
                                                <div className="text-sm text-gray-500">{lead.phone}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusColor(lead.status)}>{lead.status}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {lead.expectedValue ? `₹${lead.expectedValue.toLocaleString()}` : '-'}
                                            </TableCell>
                                            <TableCell>{lead.source}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleViewDetails(lead)}
                                                        className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                                        title="View Details"
                                                    >
                                                        <ArrowRight size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(lead)}
                                                        className="p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-700 rounded"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(lead._id)}
                                                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <KanbanBoard
                        leads={filteredLeads}
                        onChange={fetchLeads}
                        onLeadClick={handleViewDetails}
                    />
                )}
            </div>

            <LeadFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                lead={selectedLeadForEdit}
                onSuccess={fetchLeads}
            />

            <LeadDetailsDrawer
                isOpen={!!selectedLeadForDetails}
                onClose={() => setSelectedLeadForDetails(null)}
                lead={selectedLeadForDetails}
                onUpdate={fetchLeads}
            />
        </div>
    );
};

export default LeadCRM;
