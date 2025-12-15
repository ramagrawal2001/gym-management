import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash, Eye, Building2, Power, PowerOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/common/Table';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import * as gymService from '../services/gymService';
import { useNotification } from '../hooks/useNotification';
import { useDebounce } from '../hooks/useDebounce';
import { formatDate } from '../utils/formatDate';

const GymForm = ({ gym = null, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        subdomain: '',
        ownerEmail: '',
        planId: '',
        features: {
            crm: true,
            scheduling: true,
            payments: true,
            attendance: true,
            staff: true,
            inventory: true
        }
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (gym) {
            setFormData({
                name: gym.name || '',
                subdomain: gym.subdomain || '',
                ownerEmail: gym.ownerId?.email || '',
                planId: gym.planId?._id || gym.planId || '',
                features: gym.features || {
                    crm: true,
                    scheduling: true,
                    payments: true,
                    attendance: true,
                    staff: true,
                    inventory: true
                }
            });
        }
    }, [gym]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('feature.')) {
            const featureName = name.split('.')[1];
            setFormData({
                ...formData,
                features: {
                    ...formData.features,
                    [featureName]: checked
                }
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            // Send ownerEmail to backend - it will find or create the user
            await onSubmit(formData);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save gym');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <Input
                label="Gym Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Fitness Center"
                required
            />

            <Input
                label="Subdomain"
                name="subdomain"
                value={formData.subdomain}
                onChange={handleChange}
                placeholder="fitness-center"
                required
            />

            <Input
                label="Owner Email"
                name="ownerEmail"
                type="email"
                value={formData.ownerEmail}
                onChange={handleChange}
                placeholder="owner@example.com"
                required={!gym}
                disabled={!!gym}
                helperText={gym ? "Owner cannot be changed after creation" : "User will be created if doesn't exist"}
            />

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Features
                </label>
                <div className="space-y-2 bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                    {Object.entries(formData.features).map(([key, value]) => (
                        <label key={key} className="flex items-center">
                            <input
                                type="checkbox"
                                name={`feature.${key}`}
                                checked={value}
                                onChange={handleChange}
                                className="rounded border-gray-300 dark:border-slate-600 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-slate-700"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                                {key.replace(/_/g, ' ')}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                <Button variant="ghost" onClick={onCancel} type="button" disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" isLoading={isLoading} disabled={isLoading}>
                    {gym ? 'Update' : 'Create'} Gym
                </Button>
            </div>
        </form>
    );
};

const Gyms = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { success: showSuccess, error: showError } = useNotification();
    const [gyms, setGyms] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedGym, setSelectedGym] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 500);

    useEffect(() => {
        loadGyms();
    }, [debouncedSearch]);

    const loadGyms = async () => {
        setIsLoading(true);
        try {
            const response = await gymService.getGyms({ 
                page: 1, 
                limit: 100,
                search: debouncedSearch || undefined
            });
            const gymsData = response.data?.data || response.data || [];
            setGyms(Array.isArray(gymsData) ? gymsData : []);
        } catch (error) {
            showError('Failed to load gyms');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateGym = async (gymData) => {
        try {
            await gymService.createGym(gymData);
            showSuccess('Gym created successfully');
            setIsModalOpen(false);
            setSelectedGym(null);
            loadGyms();
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to create gym');
            throw error;
        }
    };

    const handleUpdateGym = async (gymData) => {
        if (!selectedGym) return;
        try {
            // Remove ownerEmail from update data (owner shouldn't change on update)
            const { ownerEmail, ...updateData } = gymData;
            await gymService.updateGym(selectedGym._id, updateData);
            showSuccess('Gym updated successfully');
            setIsModalOpen(false);
            setSelectedGym(null);
            loadGyms();
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to update gym');
            throw error;
        }
    };

    const handleEdit = (gym) => {
        setSelectedGym(gym);
        setIsModalOpen(true);
    };

    const handleDelete = (gym) => {
        setSelectedGym(gym);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedGym) return;
        try {
            await gymService.deleteGym(selectedGym._id);
            showSuccess('Gym deleted successfully');
            setIsDeleteModalOpen(false);
            setSelectedGym(null);
            loadGyms();
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to delete gym');
        }
    };

    const handleSuspend = async (gym) => {
        try {
            await gymService.suspendGym(gym._id, !gym.isActive);
            showSuccess(`Gym ${gym.isActive ? 'suspended' : 'activated'} successfully`);
            loadGyms();
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to update gym status');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gyms Management</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage all gyms in the system.</p>
                </div>
                <Button onClick={() => {
                    setSelectedGym(null);
                    setIsModalOpen(true);
                }}>
                    <Plus size={20} className="mr-2" />
                    Add Gym
                </Button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-slate-700">
                    <div className="w-full sm:w-96">
                        <Input
                            placeholder="Search gyms..."
                            icon={Search}
                            className="dark:bg-slate-900 dark:border-slate-700"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Gym Name</TableHead>
                            <TableHead>Subdomain</TableHead>
                            <TableHead>Owner</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                </TableCell>
                            </TableRow>
                        ) : gyms.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-gray-500 dark:text-gray-400 py-8">
                                    No gyms found
                                </TableCell>
                            </TableRow>
                        ) : (
                            gyms.map((gym) => {
                                const owner = gym.ownerId;
                                const plan = gym.planId;
                                return (
                                    <TableRow key={gym._id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                    <Building2 size={20} className="text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">{gym.name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {Object.values(gym.features || {}).filter(Boolean).length} features enabled
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {gym.subdomain || 'N/A'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-gray-900 dark:text-gray-200">{owner?.email || 'N/A'}</div>
                                            {owner?.firstName && owner?.lastName && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {owner.firstName} {owner.lastName}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>{plan?.name || 'N/A'}</TableCell>
                                        <TableCell>{formatDate(gym.createdAt)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/gyms/${gym._id}`)}
                                                    className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(gym)}
                                                    className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleSuspend(gym)}
                                                    className="p-1 text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                                    title={gym.isActive ? 'Suspend' : 'Activate'}
                                                >
                                                    {gym.isActive ? <PowerOff size={18} /> : <Power size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(gym)}
                                                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash size={18} />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedGym(null);
                }}
                title={selectedGym ? "Edit Gym" : "Add New Gym"}
            >
                <GymForm
                    gym={selectedGym}
                    onSubmit={selectedGym ? handleUpdateGym : handleCreateGym}
                    onCancel={() => {
                        setIsModalOpen(false);
                        setSelectedGym(null);
                    }}
                />
            </Modal>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedGym(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Delete Gym"
                message={`Are you sure you want to delete ${selectedGym?.name || 'this gym'}? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
};

export default Gyms;

