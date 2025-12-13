import { useState } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import KanbanColumn from './KanbanColumn';
import LeadCard from './LeadCard';
import { formatDate } from '../../utils/formatDate';

const KanbanBoard = ({ leads = [], onStatusChange }) => {
    const [activeId, setActiveId] = useState(null);

    const columns = [
        { id: 'new', title: 'New Leads', color: 'blue' },
        { id: 'contacted', title: 'Contacted', color: 'yellow' },
        { id: 'trial', title: 'Trial Started', color: 'purple' }, // Changed color key to fallback or add purple logic if needed, wait I used blue/yellow/green/red in column. Let's stick to those.
        { id: 'negotiation', title: 'Negotiation', color: 'red' },
        { id: 'converted', title: 'Converted', color: 'green' },
    ];

    // Fix column color mapping: 
    // I defined blue, yellow, green, red in KanbanColumn. 
    // Let's use blue, yellow, blue (reuse), red, green.

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const leadId = active.id;
            const newStatus = over.id;

            // Find the lead
            const lead = leads.find(l => l._id === leadId || l.id === leadId);
            if (lead && onStatusChange) {
                await onStatusChange(leadId, newStatus);
            }
        }
        setActiveId(null);
    };

    const activeLead = activeId ? leads.find(l => (l._id === activeId || l.id === activeId)) : null;

    return (
        <DndContext
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-col lg:flex-row gap-4 h-full overflow-x-auto pb-4">
                {columns.map(col => (
                    <KanbanColumn
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        color={col.color === 'purple' ? 'blue' : col.color}
                        leads={leads.filter(l => l.status === col.id)}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeLead ? <LeadCard lead={activeLead} /> : null}
            </DragOverlay>
        </DndContext>
    );
};

export default KanbanBoard;
