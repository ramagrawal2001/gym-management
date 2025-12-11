import { useState } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import KanbanColumn from './KanbanColumn';
import LeadCard from './LeadCard';

const KanbanBoard = () => {
    // Mock Data
    const [leads, setLeads] = useState([
        { id: '1', name: 'Alice Smith', phone: '555-0101', email: 'alice@test.com', status: 'new', date: 'Oct 24', source: 'Instagram' },
        { id: '2', name: 'Bob Jones', phone: '555-0102', email: 'bob@test.com', status: 'contacted', date: 'Oct 23', source: 'Walk-in' },
        { id: '3', name: 'Charlie Day', phone: '555-0103', email: 'charlie@test.com', status: 'trial', date: 'Oct 22', source: 'Referral' },
        { id: '4', name: 'Dennis Reynolds', phone: '555-0104', email: 'dennis@test.com', status: 'new', date: 'Oct 24', source: 'Website' },
        { id: '5', name: 'Dee Reynolds', phone: '555-0105', email: 'dee@test.com', status: 'negotiation', date: 'Oct 21', source: 'Instagram' },
    ]);

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

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            // Find the lead
            const leadId = active.id;
            const newStatus = over.id;

            setLeads((items) => {
                return items.map(item => {
                    if (item.id === leadId) {
                        return { ...item, status: newStatus };
                    }
                    return item;
                });
            });
        }
        setActiveId(null);
    };

    const activeLead = activeId ? leads.find(l => l.id === activeId) : null;

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
                        color={col.color === 'purple' ? 'blue' : col.color} // Fallback for purple
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
