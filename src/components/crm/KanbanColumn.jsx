import { useDroppable } from '@dnd-kit/core';
import LeadCard from './LeadCard';
import { clsx } from "clsx";

const KanbanColumn = ({ id, title, leads, color }) => {
    const { setNodeRef } = useDroppable({
        id: id,
    });

    const colorStyles = {
        blue: "bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-900/30",
        yellow: "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-900/30",
        green: "bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30",
        red: "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30",
    };

    const headerStyles = {
        blue: "text-blue-700 dark:text-blue-300",
        yellow: "text-yellow-700 dark:text-yellow-300",
        green: "text-green-700 dark:text-green-300",
        red: "text-red-700 dark:text-red-300",
    }

    return (
        <div className={clsx("flex-1 min-w-[280px] rounded-xl border p-4 flex flex-col h-full max-h-[calc(100vh-12rem)]", colorStyles[color])}>
            <h3 className={clsx("font-bold mb-4 flex justify-between items-center", headerStyles[color])}>
                {title}
                <span className="text-xs bg-white/50 dark:bg-black/20 px-2 py-1 rounded-full">{leads.length}</span>
            </h3>
            <div ref={setNodeRef} className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {leads.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} />
                ))}
                {leads.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                        Drop here
                    </div>
                )}
            </div>
        </div>
    );
};

export default KanbanColumn;
