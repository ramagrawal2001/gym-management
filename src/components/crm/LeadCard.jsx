import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Phone, Mail, Calendar } from 'lucide-react';
import Card from '../common/Card';

const LeadCard = ({ lead }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: lead.id,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="cursor-grab touch-none mb-3">
            <Card className="p-3 bg-white hover:shadow-md dark:bg-slate-700 dark:border-slate-600 transition-all">
                <h4 className="font-semibold text-gray-900 dark:text-white">{lead.name}</h4>
                <div className="mt-2 space-y-1">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Phone size={12} className="mr-2" />
                        {lead.phone}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Mail size={12} className="mr-2" />
                        {lead.email}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Calendar size={12} className="mr-2" />
                        {lead.date}
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
