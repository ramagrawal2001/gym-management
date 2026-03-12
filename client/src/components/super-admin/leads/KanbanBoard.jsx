import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, DollarSign, Building2, Phone } from 'lucide-react';
import Badge from '../../common/Badge';
import { updateLead } from '../../../services/superAdminLeadService';
import toast from 'react-hot-toast';
import WhatsAppButton from '../../common/WhatsAppButton';

const COLUMNS = [
    { id: 'New', title: 'New Leads', color: 'border-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10' },
    { id: 'Contacted', title: 'Contacted', color: 'border-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/10' },
    { id: 'Demo Scheduled', title: 'Demo Scheduled', color: 'border-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/10' },
    { id: 'Negotiation', title: 'Negotiation', color: 'border-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/10' },
    { id: 'Converted', title: 'Converted', color: 'border-green-500', bg: 'bg-green-50 dark:bg-green-900/10' },
    { id: 'Lost', title: 'Lost', color: 'border-red-500', bg: 'bg-red-50 dark:bg-red-900/10' }
];

const KanbanBoard = ({ leads, onChange, onLeadClick }) => {
    const [localLeads, setLocalLeads] = useState(leads);
    const [draggedLeadId, setDraggedLeadId] = useState(null);

    useEffect(() => {
        setLocalLeads(leads);
    }, [leads]);

    const handleDragStart = (e, leadId) => {
        setDraggedLeadId(leadId);
        e.dataTransfer.effectAllowed = 'move';
        // Firefox requires data to be set
        e.dataTransfer.setData('text/plain', leadId);

        // Add a slight delay before hiding the original element for a better drag image
        setTimeout(() => {
            const el = document.getElementById(`lead-${leadId}`);
            if (el) el.classList.add('opacity-50');
        }, 0);
    };

    const handleDragEnd = (e, leadId) => {
        setDraggedLeadId(null);
        const el = document.getElementById(`lead-${leadId}`);
        if (el) el.classList.remove('opacity-50');
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e, columnId) => {
        e.preventDefault();
        if (!draggedLeadId) return;

        const leadToMove = localLeads.find(l => l._id === draggedLeadId);

        if (leadToMove && leadToMove.status !== columnId) {
            // Optimistic UI update
            setLocalLeads(prev => prev.map(lead =>
                lead._id === draggedLeadId ? { ...lead, status: columnId } : lead
            ));

            try {
                await updateLead(draggedLeadId, { status: columnId });
                onChange(); // Refresh from server
            } catch (error) {
                toast.error('Failed to move lead');
                // Revert on failure
                setLocalLeads(leads);
            }
        }
        setDraggedLeadId(null);
    };

    return (
        <div className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x">
            {COLUMNS.map(column => {
                const columnLeads = localLeads.filter(l => l.status === column.id);

                return (
                    <div
                        key={column.id}
                        className={`flex-shrink-0 w-80 rounded-xl border-t-4 ${column.color} bg-gray-50 dark:bg-slate-900/50 flex flex-col snap-start`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, column.id)}
                    >
                        <div className={`p-3 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center ${column.bg}`}>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{column.title}</h3>
                            <span className="px-2 py-1 bg-white dark:bg-slate-800 text-xs font-medium rounded-full text-gray-500 shadow-sm border border-gray-200 dark:border-slate-700">
                                {columnLeads.length}
                            </span>
                        </div>

                        <div className="p-3 flex-1 flex flex-col gap-3 min-h-[200px] overflow-y-auto">
                            <AnimatePresence>
                                {columnLeads.map(lead => (
                                    <motion.div
                                        key={lead._id}
                                        layout // Animates position changes
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        id={`lead-${lead._id}`}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, lead._id)}
                                        onDragEnd={(e) => handleDragEnd(e, lead._id)}
                                        onClick={() => onLeadClick(lead)}
                                        className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 cursor-grab active:cursor-grabbing hover:border-blue-300 dark:hover:border-blue-600 transition-colors group relative"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1">{lead.businessName}</h4>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-gray-100 dark:bg-slate-700 rounded text-xs text-gray-500">
                                                Draggable
                                            </div>
                                        </div>

                                        <div className="space-y-2 mt-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center text-xs text-gray-500">
                                                    <Phone className="w-3 h-3 mr-2 text-gray-400" />
                                                    {lead.contactName}
                                                </div>
                                                <WhatsAppButton phone={lead.phone} size={14} />
                                            </div>
                                            {lead.expectedValue > 0 && (
                                                <div className="flex items-center text-xs text-green-600 dark:text-green-500 font-medium">
                                                    <DollarSign className="w-3 h-3 mr-2" />
                                                    ₹{lead.expectedValue.toLocaleString()}
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 dark:border-slate-700/50">
                                                <Badge variant="gray" className="text-[10px] uppercase tracking-wider">
                                                    {lead.source}
                                                </Badge>
                                                {lead.planInterest && (
                                                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                                                        {lead.planInterest}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {columnLeads.length === 0 && (
                                <div className="h-20 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                                    Drop here
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default KanbanBoard;
