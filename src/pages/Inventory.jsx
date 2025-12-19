import { useState, useEffect } from 'react';
import { Wrench, AlertTriangle, CheckCircle, Search, Plus, Edit, Trash, Eye, X } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/common/Table';
import EquipmentForm from '../components/inventory/EquipmentForm';
import * as inventoryService from '../services/inventoryService';
import * as gymService from '../services/gymService';
import { useDebounce } from '../hooks/useDebounce';
import { useNotification } from '../hooks/useNotification';
import { useRole } from '../hooks/useRole';
import { formatDate } from '../utils/formatDate';
import { formatCurrency } from '../utils/formatCurrency';
import { EQUIPMENT_CATEGORIES, EQUIPMENT_CONDITIONS, EQUIPMENT_STATUSES } from '../utils/constants';

const Inventory = () => {
    const { isSuperAdmin, isOwner, isStaff } = useRole();
    const { success: showSuccess, error: showError } = useNotification();
    
    const [equipment, setEquipment] = useState([]);
    const [stats, setStats] = useState({
        operational: 0,
        maintenanceDue: 0,
        outOfOrder: 0
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [gymFilter, setGymFilter] = useState('');
    const [gyms, setGyms] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        total: 0,
        pages: 0
    });
    
    const debouncedSearch = useDebounce(searchQuery, 500);

    useEffect(() => {
        if (isSuperAdmin()) {
            loadGyms();
        }
    }, [isSuperAdmin]);

    useEffect(() => {
        loadEquipment();
    }, [debouncedSearch, categoryFilter, statusFilter, gymFilter]);

    const loadGyms = async () => {
        try {
            const response = await gymService.getGyms({ page: 1, limit: 1000 });
            const gymsData = response.data?.data || response.data || [];
            setGyms(Array.isArray(gymsData) ? gymsData : []);
        } catch (error) {
            console.error('Failed to load gyms:', error);
        }
    };

    const loadEquipment = async () => {
        setIsLoading(true);
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search: debouncedSearch || undefined,
                category: categoryFilter || undefined,
                status: statusFilter || undefined,
                gymId: gymFilter || undefined
            };
            
            // Remove undefined values to avoid sending them in query
            Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
            
            const response = await inventoryService.getEquipment(params);
            const equipmentData = response.data?.data || response.data || [];
            const meta = response.data?.meta || {};
            
            setEquipment(Array.isArray(equipmentData) ? equipmentData : []);
            setStats(meta.stats || {
                operational: 0,
                maintenanceDue: 0,
                outOfOrder: 0
            });
            setPagination(prev => ({
                ...prev,
                total: meta.pagination?.total || 0,
                pages: meta.pagination?.pages || 0
            }));
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to load equipment';
            showError(errorMessage);
            console.error('Error loading equipment:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateEquipment = async (equipmentData) => {
        try {
            if (selectedEquipment?._id) {
                await inventoryService.updateEquipment(selectedEquipment._id, equipmentData);
                showSuccess('Equipment updated successfully');
            } else {
                await inventoryService.createEquipment(equipmentData);
                showSuccess('Equipment created successfully');
            }
            setIsModalOpen(false);
            setSelectedEquipment(null);
            loadEquipment();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to save equipment';
            showError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const handleEdit = async (equipmentItem) => {
        try {
            const response = await inventoryService.getEquipmentItem(equipmentItem._id);
            const equipmentData = response.data?.data || response.data || equipmentItem;
            setSelectedEquipment(equipmentData);
            setIsModalOpen(true);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to load equipment details';
            showError(errorMessage);
            console.error('Error loading equipment:', error);
        }
    };

    const handleDelete = (equipmentItem) => {
        setSelectedEquipment(equipmentItem);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedEquipment) return;
        try {
            await inventoryService.deleteEquipment(selectedEquipment._id);
            showSuccess('Equipment deleted successfully');
            setIsDeleteModalOpen(false);
            setSelectedEquipment(null);
            loadEquipment();
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to delete equipment');
        }
    };

    const handleRecordService = async (equipmentItem) => {
        setSelectedEquipment(equipmentItem);
        setIsServiceModalOpen(true);
    };

    const handleServiceConfirm = async () => {
        if (!selectedEquipment) return;
        try {
            await inventoryService.recordService(selectedEquipment._id);
            showSuccess('Service recorded successfully');
            setIsServiceModalOpen(false);
            setSelectedEquipment(null);
            loadEquipment();
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to record service');
        }
    };

    const handleViewDetails = async (equipmentItem) => {
        try {
            const response = await inventoryService.getEquipmentItem(equipmentItem._id);
            setSelectedEquipment(response.data?.data || response.data || equipmentItem);
            setIsDetailsModalOpen(true);
        } catch (error) {
            showError('Failed to load equipment details');
        }
    };

    const handleStatClick = (status) => {
        setStatusFilter(status === statusFilter ? '' : status);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setCategoryFilter('');
        setStatusFilter('');
        setGymFilter('');
    };

    const getConditionColor = (condition) => {
        switch (condition) {
            case EQUIPMENT_CONDITIONS.EXCELLENT:
                return 'text-green-600 dark:text-green-400';
            case EQUIPMENT_CONDITIONS.GOOD:
                return 'text-blue-600 dark:text-blue-400';
            case EQUIPMENT_CONDITIONS.FAIR:
                return 'text-yellow-600 dark:text-yellow-400';
            case EQUIPMENT_CONDITIONS.POOR:
                return 'text-orange-600 dark:text-orange-400';
            case EQUIPMENT_CONDITIONS.NEEDS_REPAIR:
                return 'text-red-600 dark:text-red-400';
            default:
                return 'text-gray-600 dark:text-gray-400';
        }
    };

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case EQUIPMENT_STATUSES.OPERATIONAL:
                return 'success';
            case EQUIPMENT_STATUSES.MAINTENANCE_DUE:
                return 'warning';
            case EQUIPMENT_STATUSES.OUT_OF_ORDER:
                return 'danger';
            case EQUIPMENT_STATUSES.RETIRED:
                return 'gray';
            default:
                return 'gray';
        }
    };

    const getCategoryLabel = (category) => {
        const categoryMap = {
            [EQUIPMENT_CATEGORIES.CARDIO]: 'Cardio',
            [EQUIPMENT_CATEGORIES.STRENGTH]: 'Strength',
            [EQUIPMENT_CATEGORIES.FUNCTIONAL]: 'Functional',
            [EQUIPMENT_CATEGORIES.ACCESSORIES]: 'Accessories',
            [EQUIPMENT_CATEGORIES.OTHER]: 'Other'
        };
        return categoryMap[category] || category;
    };

    const repairsNeeded = stats.outOfOrder || 0;
    const maintenanceDue = stats.maintenanceDue || 0;
    const allGood = stats.operational || 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory & Equipment</h1>
                    <p className="text-gray-500 dark:text-gray-400">Track equipment status and maintenance.</p>
                </div>
                {!isStaff() && (
                    <Button onClick={() => {
                        setSelectedEquipment(null);
                        setIsModalOpen(true);
                    }}>
                        <Plus size={20} className="mr-2" />
                        Add Item
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card 
                    className={`p-4 flex items-center gap-4 bg-orange-50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/30 cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors ${statusFilter === EQUIPMENT_STATUSES.OUT_OF_ORDER ? 'ring-2 ring-orange-500' : ''}`}
                    onClick={() => handleStatClick(EQUIPMENT_STATUSES.OUT_OF_ORDER)}
                >
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
                        <Wrench size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-orange-800 dark:text-orange-300">Repairs Needed</p>
                        <h3 className="text-2xl font-bold text-orange-900 dark:text-orange-200">{repairsNeeded} Items</h3>
                    </div>
                </Card>
                <Card 
                    className={`p-4 flex items-center gap-4 bg-yellow-50 border-yellow-100 dark:bg-yellow-900/10 dark:border-yellow-900/30 cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/20 transition-colors ${statusFilter === EQUIPMENT_STATUSES.MAINTENANCE_DUE ? 'ring-2 ring-yellow-500' : ''}`}
                    onClick={() => handleStatClick(EQUIPMENT_STATUSES.MAINTENANCE_DUE)}
                >
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Maintenance Due</p>
                        <h3 className="text-2xl font-bold text-yellow-900 dark:text-yellow-200">{maintenanceDue} Items</h3>
                    </div>
                </Card>
                <Card 
                    className={`p-4 flex items-center gap-4 bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-900/30 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors ${statusFilter === EQUIPMENT_STATUSES.OPERATIONAL ? 'ring-2 ring-green-500' : ''}`}
                    onClick={() => handleStatClick(EQUIPMENT_STATUSES.OPERATIONAL)}
                >
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-300">All Good</p>
                        <h3 className="text-2xl font-bold text-green-900 dark:text-green-200">{allGood} Items</h3>
                    </div>
                </Card>
            </div>

            <Card className="overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="w-full sm:w-96">
                        <Input
                            placeholder="Search equipment..."
                            icon={Search}
                            className="dark:bg-slate-900 dark:border-slate-700"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {isSuperAdmin() && (
                            <select
                                value={gymFilter}
                                onChange={(e) => setGymFilter(e.target.value)}
                                className="rounded-lg border border-gray-300 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white py-2 px-3 text-sm"
                            >
                                <option value="">All Gyms</option>
                                {gyms.map(gym => (
                                    <option key={gym._id} value={gym._id}>
                                        {gym.name}
                                    </option>
                                ))}
                            </select>
                        )}
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="rounded-lg border border-gray-300 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white py-2 px-3 text-sm"
                        >
                            <option value="">All Categories</option>
                            {Object.values(EQUIPMENT_CATEGORIES).map(category => (
                                <option key={category} value={category}>
                                    {getCategoryLabel(category)}
                                </option>
                            ))}
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-lg border border-gray-300 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white py-2 px-3 text-sm"
                        >
                            <option value="">All Status</option>
                            {Object.values(EQUIPMENT_STATUSES).map(status => (
                                <option key={status} value={status}>
                                    {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                </option>
                            ))}
                        </select>
                        {(searchQuery || categoryFilter || statusFilter || gymFilter) && (
                            <Button variant="ghost" size="sm" onClick={clearFilters}>
                                <X size={16} className="mr-1" />
                                Clear
                            </Button>
                        )}
                    </div>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Brand/Model</TableHead>
                            <TableHead>Purchase Date</TableHead>
                            <TableHead>Condition</TableHead>
                            <TableHead>Last Service</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                </TableCell>
                            </TableRow>
                        ) : equipment.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center text-gray-500 dark:text-gray-400 py-8">
                                    No equipment found
                                </TableCell>
                            </TableRow>
                        ) : (
                            equipment.map((item) => (
                                <TableRow key={item._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer" onClick={() => handleViewDetails(item)}>
                                    <TableCell className="font-medium text-gray-900 dark:text-white">
                                        {item.name}
                                    </TableCell>
                                    <TableCell>{getCategoryLabel(item.category)}</TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            {item.brand && <div>{item.brand}</div>}
                                            {item.model && <div className="text-gray-500 dark:text-gray-400">{item.model}</div>}
                                            {!item.brand && !item.model && <span className="text-gray-400">-</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>{item.purchaseDate ? formatDate(item.purchaseDate) : '-'}</TableCell>
                                    <TableCell>
                                        <span className={getConditionColor(item.condition)}>
                                            {item.condition ? item.condition.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : '-'}
                                        </span>
                                    </TableCell>
                                    <TableCell>{item.lastService ? formatDate(item.lastService) : '-'}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(item.status)}>
                                            {item.status ? item.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : '-'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => handleViewDetails(item)}
                                                className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            {!isStaff() && (
                                                <>
                                                    <button 
                                                        onClick={() => handleRecordService(item)}
                                                        className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                                        title="Record Service"
                                                    >
                                                        <Wrench size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEdit(item)}
                                                        className="p-1 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    {(isSuperAdmin() || isOwner()) && (
                                                        <button 
                                                            onClick={() => handleDelete(item)}
                                                            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash size={18} />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedEquipment(null);
                }}
                title={selectedEquipment ? "Edit Equipment" : "Add New Equipment"}
                size="3xl"
            >
                <EquipmentForm 
                    equipment={selectedEquipment}
                    onSubmit={handleCreateEquipment}
                    onCancel={() => {
                        setIsModalOpen(false);
                        setSelectedEquipment(null);
                    }} 
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedEquipment(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Delete Equipment"
                message={`Are you sure you want to delete "${selectedEquipment?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />

            {/* Service Recording Modal */}
            <ConfirmModal
                isOpen={isServiceModalOpen}
                onClose={() => {
                    setIsServiceModalOpen(false);
                    setSelectedEquipment(null);
                }}
                onConfirm={handleServiceConfirm}
                title="Record Service"
                message={`Record service for "${selectedEquipment?.name}"? This will update the last service date and set status to operational.`}
                confirmText="Record Service"
                variant="success"
            />

            {/* Details Modal */}
            <Modal
                isOpen={isDetailsModalOpen}
                onClose={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedEquipment(null);
                }}
                title="Equipment Details"
                size="lg"
            >
                {selectedEquipment && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                                <p className="text-gray-900 dark:text-white">{selectedEquipment.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</label>
                                <p className="text-gray-900 dark:text-white">{getCategoryLabel(selectedEquipment.category)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Brand</label>
                                <p className="text-gray-900 dark:text-white">{selectedEquipment.brand || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Model</label>
                                <p className="text-gray-900 dark:text-white">{selectedEquipment.model || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</label>
                                <p className="text-gray-900 dark:text-white">{selectedEquipment.location || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Condition</label>
                                <p className={getConditionColor(selectedEquipment.condition)}>
                                    {selectedEquipment.condition ? selectedEquipment.condition.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : '-'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                                <Badge variant={getStatusBadgeVariant(selectedEquipment.status)}>
                                    {selectedEquipment.status ? selectedEquipment.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : '-'}
                                </Badge>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Purchase Date</label>
                                <p className="text-gray-900 dark:text-white">{selectedEquipment.purchaseDate ? formatDate(selectedEquipment.purchaseDate) : '-'}</p>
                            </div>
                            {selectedEquipment.purchasePrice && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Purchase Price</label>
                                    <p className="text-gray-900 dark:text-white">{formatCurrency(selectedEquipment.purchasePrice)}</p>
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Service</label>
                                <p className="text-gray-900 dark:text-white">{selectedEquipment.lastService ? formatDate(selectedEquipment.lastService) : '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Next Service</label>
                                <p className="text-gray-900 dark:text-white">{selectedEquipment.nextService ? formatDate(selectedEquipment.nextService) : '-'}</p>
                            </div>
                            {selectedEquipment.serviceInterval && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Service Interval</label>
                                    <p className="text-gray-900 dark:text-white">{selectedEquipment.serviceInterval} days</p>
                                </div>
                            )}
                        </div>
                        {selectedEquipment.notes && (
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</label>
                                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{selectedEquipment.notes}</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Inventory;
