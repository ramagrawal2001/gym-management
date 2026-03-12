import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Phone, Mail, Calendar } from 'lucide-react';
import Card from '../common/Card';

import { formatDate } from '../../utils/formatDate';

const LeadCard = ({ lead }) => {
    const leadId = lead._id || lead.id;
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: leadId,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
    };

    const leadName = lead.name || `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Unknown';
    const leadPhone = lead.phone || lead.contactPhone || 'N/A';
    const leadEmail = lead.email || lead.contactEmail || 'N/A';

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="cursor-grab touch-none mb-3">
            <Card className="p-3 bg-white hover:shadow-md dark:bg-slate-700 dark:border-slate-600 transition-all">
                <h4 className="font-semibold text-gray-900 dark:text-white">{leadName}</h4>
                <div className="mt-2 space-y-1">
                    {leadPhone !== 'N/A' && (
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <Phone size={12} className="mr-2" />
                            {leadPhone}
                        </div>
                    )}
                    {leadEmail !== 'N/A' && (
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <Mail size={12} className="mr-2" />
                            {leadEmail}
                        </div>
                    )}
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Calendar size={12} className="mr-2" />
                        {lead.createdAt ? formatDate(lead.createdAt, 'MMM dd') : lead.date || 'N/A'}
                    </div>
                </div>
                {lead.source && (
                    <div className="mt-2">
                        <span className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400 rounded-full">
                            {lead.source}
                        </span>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default LeadCard;
