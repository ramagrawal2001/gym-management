import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import LeadForm from '../components/leads/LeadForm';
import KanbanBoard from '../components/crm/KanbanBoard';
import { fetchLeads, updateLeadInList } from '../store/slices/leadSlice';
import * as leadService from '../services/leadService';
import { useNotification } from '../hooks/useNotification';

const CRM = () => {
    const dispatch = useDispatch();
    const { leads } = useSelector((state) => state.leads);
    const { success: showSuccess, error: showError } = useNotification();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);

    useEffect(() => {
        loadLeads();
    }, []);

    const loadLeads = async () => {
        try {
            await dispatch(fetchLeads({ page: 1, limit: 100 })).unwrap();
        } catch (error) {
            showError('Failed to load leads');
        }
    };

    const handleCreateLead = async (leadData) => {
        try {
            const response = await leadService.createLead(leadData);
            showSuccess('Lead created successfully');
            setIsModalOpen(false);
            setSelectedLead(null);
            loadLeads();
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to create lead');
        }
    };

    const handleUpdateLeadStatus = async (leadId, status, memberId = null) => {
        try {
            const response = await leadService.updateLeadStatus(leadId, status, memberId);
            dispatch(updateLeadInList(response.data));
            showSuccess('Lead status updated');
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to update lead status');
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leads CRM</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage and track potential member enquiries.</p>
                </div>
                <Button onClick={() => {
                    setSelectedLead(null);
                    setIsModalOpen(true);
                }}>
                    <Plus size={20} className="mr-2" />
                    Add Lead
                </Button>
            </div>

            <div className="flex-1 min-h-0">
                <KanbanBoard 
                    leads={leads}
                    onStatusChange={handleUpdateLeadStatus}
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedLead(null);
                }}
                title={selectedLead ? "Edit Lead" : "Add New Lead"}
            >
                <LeadForm
                    lead={selectedLead}
                    onSubmit={handleCreateLead}
                    onCancel={() => {
                        setIsModalOpen(false);
                        setSelectedLead(null);
                    }}
                />
            </Modal>
        </div>
    );
};

export default CRM;
