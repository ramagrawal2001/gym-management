import { Plus } from 'lucide-react';
import Button from '../components/common/Button';
import KanbanBoard from '../components/crm/KanbanBoard';

const CRM = () => {
    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leads CRM</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage and track potential member enquiries.</p>
                </div>
                <Button>
                    <Plus size={20} className="mr-2" />
                    Add Lead
                </Button>
            </div>

            <div className="flex-1 min-h-0">
                <KanbanBoard />
            </div>
        </div>
    );
};

export default CRM;
