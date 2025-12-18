import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash, Mail, Phone, Award } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import StaffForm from '../components/staff/StaffForm';
import * as staffService from '../services/staffService';
import { useNotification } from '../hooks/useNotification';
import { useRole } from '../hooks/useRole';
import { useDebounce } from '../hooks/useDebounce';

const Trainers = () => {
    const { isSuperAdmin, isOwner } = useRole();
    const { success: showSuccess, error: showError } = useNotification();
    const [staff, setStaff] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isActiveFilter, setIsActiveFilter] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 500);

    useEffect(() => {
        loadStaff();
    }, [debouncedSearch, isActiveFilter]);

    const loadStaff = async () => {
        setIsLoading(true);
        try {
            const params = {
                page: 1,
                limit: 100,
                search: debouncedSearch || undefined,
                isActive: isActiveFilter !== '' ? isActiveFilter : undefined
            };
            const response = await staffService.getStaff(params);
            const staffData = response.data?.data || response.data || [];
            setStaff(Array.isArray(staffData) ? staffData : []);
        } catch (error) {
            showError('Failed to load staff');
            console.error('Failed to load staff:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateStaff = async (staffData) => {
        try {
            const payload = { ...staffData };
            
            if (staffData._id) {
                // Update existing staff
                await staffService.updateStaff(staffData._id, payload);
                showSuccess('Staff updated successfully');
            } else {
                // Create new staff
                await staffService.createStaff(payload);
                showSuccess('Staff created successfully');
            }
            setIsModalOpen(false);
            setSelectedStaff(null);
            loadStaff();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to save staff';
            showError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const handleDeleteStaff = async () => {
        if (!selectedStaff) return;
        try {
            await staffService.deleteStaff(selectedStaff._id);
            showSuccess('Staff deleted successfully');
            setIsDeleteModalOpen(false);
            setSelectedStaff(null);
            loadStaff();
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to delete staff');
        }
    };

    const handleEdit = async (staffMember) => {
        try {
            // Fetch full staff details
            const response = await staffService.getStaffMember(staffMember._id);
            setSelectedStaff(response.data?.data || response.data);
            setIsModalOpen(true);
        } catch (error) {
            showError('Failed to load staff details');
        }
    };

    const handleDelete = (staffMember) => {
        setSelectedStaff(staffMember);
        setIsDeleteModalOpen(true);
    };

    const canManage = isSuperAdmin() || isOwner();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trainers & Staff</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your fitness professionals.</p>
                </div>
                {canManage && (
                    <Button onClick={() => {
                        setSelectedStaff(null);
                        setIsModalOpen(true);
                    }}>
                        <Plus size={20} className="mr-2" />
                        Add Staff
                    </Button>
                )}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-between mb-4">
                    <div className="w-full sm:w-96">
                        <Input
                            placeholder="Search staff..."
                            icon={Search}
                            className="dark:bg-slate-900 dark:border-slate-700"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        value={isActiveFilter}
                        onChange={(e) => setIsActiveFilter(e.target.value)}
                        className="rounded-lg border border-gray-300 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white py-2 px-3 text-sm"
                    >
                        <option value="">All Status</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : staff.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                        No staff members found
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {staff.map((staffMember) => {
                            const user = staffMember.userId || {};
                            const name = user.firstName && user.lastName 
                                ? `${user.firstName} ${user.lastName}` 
                                : user.email || 'N/A';
                            const initials = (user.firstName?.[0] || user.email?.[0] || 'S').toUpperCase();
                            
                            return (
                                <Card key={staffMember._id} className="p-6 text-center hover:shadow-md transition-shadow">
                                    <div className="w-24 h-24 mx-auto rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden mb-4 border-4 border-white dark:border-slate-800 shadow-sm flex items-center justify-center">
                                        {staffMember.profileImage?.url ? (
                                            <img 
                                                src={staffMember.profileImage.url} 
                                                alt={name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : user.avatar ? (
                                            <img 
                                                src={user.avatar} 
                                                alt={name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-600 dark:text-gray-300 text-2xl font-bold">
                                                {initials}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{name}</h3>
                                    {staffMember.specialty && (
                                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-3">
                                            {staffMember.specialty}
                                        </p>
                                    )}

                                    <div className="flex justify-center gap-2 mb-4">
                                        {staffMember.certifications && staffMember.certifications.length > 0 && (
                                            <Badge variant="gray">
                                                <Award size={12} className="mr-1" />
                                                {staffMember.certifications.length} Cert
                                            </Badge>
                                        )}
                                        <Badge variant={staffMember.isActive ? 'success' : 'gray'}>
                                            {staffMember.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>

                                    {staffMember.hourlyRate && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            ${staffMember.hourlyRate}/hr
                                        </p>
                                    )}

                                    <div className="flex justify-center gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                                        {user.email && (
                                            <a 
                                                href={`mailto:${user.email}`}
                                                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-gray-50 dark:bg-slate-800 rounded-full"
                                                title="Email"
                                            >
                                                <Mail size={18} />
                                            </a>
                                        )}
                                        {user.phone && (
                                            <a 
                                                href={`tel:${user.phone}`}
                                                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-gray-50 dark:bg-slate-800 rounded-full"
                                                title="Phone"
                                            >
                                                <Phone size={18} />
                                            </a>
                                        )}
                                        {canManage && (
                                            <>
                                                <button 
                                                    onClick={() => handleEdit(staffMember)}
                                                    className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors bg-gray-50 dark:bg-slate-800 rounded-full"
                                                    title="Edit"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(staffMember)}
                                                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors bg-gray-50 dark:bg-slate-800 rounded-full"
                                                    title="Delete"
                                                >
                                                    <Trash size={18} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedStaff(null);
                }}
                title={selectedStaff ? "Edit Staff" : "Add New Staff"}
                size="3xl"
            >
                <StaffForm 
                    staff={selectedStaff}
                    onSubmit={handleCreateStaff}
                    onCancel={() => {
                        setIsModalOpen(false);
                        setSelectedStaff(null);
                    }} 
                />
            </Modal>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedStaff(null);
                }}
                onConfirm={handleDeleteStaff}
                title="Delete Staff"
                message={`Are you sure you want to delete ${selectedStaff?.userId?.firstName || 'this staff member'}? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
};

export default Trainers;
