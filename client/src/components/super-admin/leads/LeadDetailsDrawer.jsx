import React, { useState } from 'react';
import { X, Calendar, DollarSign, Mail, Phone, Building2, MessageSquare, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { addLeadNote, updateLead } from '../../../services/superAdminLeadService';
import Badge from '../../common/Badge';
import { formatDate } from '../../../utils/formatDate';
import WhatsAppButton from '../../common/WhatsAppButton';

const STATUSES = ['New', 'Contacted', 'Demo Scheduled', 'Negotiation', 'Converted', 'Lost'];

const LeadDetailsDrawer = ({ isOpen, onClose, lead, onUpdate }) => {
    const [noteText, setNoteText] = useState('');
    const [noteStatus, setNoteStatus] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen || !lead) return null;

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!noteText.trim() && !noteStatus) return;

        setLoading(true);
        try {
            await addLeadNote(lead._id, noteText, noteStatus || undefined);
            toast.success('Note added successfully');
            setNoteText('');
            setNoteStatus('');
            onUpdate();
            // Keep drawer open, but the parent needs to re-fetch and pass updated lead. 
            // Assuming parent updates the lead state or we just let it refetch on close.
        } catch (error) {
            toast.error('Failed to add note');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (newStatus === lead.status) return;
        try {
            await updateLead(lead._id, { status: newStatus });
            toast.success('Status updated');
            onUpdate();
        } catch (error) {
            toast.error('Failed to update status');
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

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 transition-opacity bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="flex items-center justify-center min-h-screen px-4 py-6">
                <div className="relative z-10 w-full max-w-2xl text-left bg-white dark:bg-slate-800 rounded-lg shadow-xl overflow-hidden">

                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-start bg-gray-50 dark:bg-slate-900/50">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                {lead.businessName}
                            </h2>
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                                {lead.contactName}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-500 bg-white dark:bg-slate-800 rounded-full shadow-sm"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto">
                        {/* Action Bar */}
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Pipeline Stage
                            </label>
                            <select
                                value={lead.status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="w-full rounded-md border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                            >
                                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        {/* Details */}
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Details</h3>
                            <div className="space-y-3">
                                <div className="flex items-center text-sm">
                                    <Mail className="w-4 h-4 text-gray-400 mr-3" />
                                    <span className="text-gray-900 dark:text-white">{lead.email || 'N/A'}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <Phone className="w-4 h-4 text-gray-400 mr-3" />
                                    <span className="text-gray-900 dark:text-white">{lead.phone || 'N/A'}</span>
                                    {lead.phone && <WhatsAppButton phone={lead.phone} className="ml-3" size={16} />}
                                </div>
                                <div className="flex items-center text-sm">
                                    <DollarSign className="w-4 h-4 text-gray-400 mr-3" />
                                    <span className="text-gray-900 dark:text-white">
                                        {lead.expectedValue ? `₹${lead.expectedValue.toLocaleString()}` : 'Not set'}
                                    </span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <Building2 className="w-4 h-4 text-gray-400 mr-3" />
                                    <span className="text-gray-900 dark:text-white">{lead.source}</span>
                                </div>
                                {lead.planInterest && (
                                    <div className="flex items-center text-sm">
                                        <span className="font-medium mr-2">Interested in:</span>
                                        <Badge variant="blue">{lead.planInterest}</Badge>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Timeline / Notes */}
                        <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Activity Timeline</h3>

                            <div className="space-y-4 mb-6">
                                {lead.notes && lead.notes.length > 0 ? (
                                    lead.notes.map((note, index) => (
                                        <div key={index} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                                    <MessageSquare size={14} className="text-blue-600 dark:text-blue-400" />
                                                </div>
                                                {index !== lead.notes.length - 1 && (
                                                    <div className="w-px h-full bg-gray-200 dark:bg-slate-700 my-1" />
                                                )}
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700">
                                                    <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{note.text}</p>
                                                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                                                        <span>{note.addedBy?.firstName} {note.addedBy?.lastName}</span>
                                                        <span>{formatDate(note.date, "MMM d, h:mm a")}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">No activity notes yet.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Add Note Input (Sticky Bottom) */}
                    <div className="p-4 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
                        <form onSubmit={handleAddNote} className="space-y-3">
                            <textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Log a call, meeting, or add a note..."
                                className="w-full rounded-md border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                rows={3}
                            />
                            <div className="flex justify-between items-center gap-2">
                                <select
                                    value={noteStatus}
                                    onChange={(e) => setNoteStatus(e.target.value)}
                                    className="text-sm rounded-md border border-gray-300 dark:border-slate-600 px-2 py-1.5 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                >
                                    <option value="">(No status change)</option>
                                    {STATUSES.map(s => <option key={s} value={s}>Change to {s}</option>)}
                                </select>
                                <button
                                    type="submit"
                                    disabled={loading || (!noteText.trim() && !noteStatus)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    <Plus size={16} />
                                    Add Note
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default LeadDetailsDrawer;
