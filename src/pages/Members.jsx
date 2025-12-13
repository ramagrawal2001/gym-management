import { useState, useEffect } from 'react';
import { Search, Plus, Filter, Edit, Trash, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/common/Table';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import MemberForm from '../components/members/MemberForm';
import { fetchMembers } from '../store/slices/memberSlice';
import * as memberService from '../services/memberService';
import { useDebounce } from '../hooks/useDebounce';
import { useNotification } from '../hooks/useNotification';
import { formatDate } from '../utils/formatDate';
import { MEMBER_STATUSES } from '../utils/constants';

const Members = () => {
    const dispatch = useDispatch();
    const { members, pagination, isLoading } = useSelector((state) => state.members);
    const { success: showSuccess, error: showError } = useNotification();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 500);

    useEffect(() => {
        loadMembers();
    }, [debouncedSearch, statusFilter]);

    const loadMembers = async () => {
        try {
            await dispatch(fetchMembers({
                page: 1,
                limit: 50,
                search: debouncedSearch || undefined,
                status: statusFilter || undefined
            })).unwrap();
        } catch (error) {
            showError('Failed to load members');
        }
    };

    const handleCreateMember = async (memberData) => {
        try {
            if (memberData._id) {
                // Update existing member
                await memberService.updateMember(memberData._id, memberData);
                showSuccess('Member updated successfully');
            } else {
                // Create new member
                await memberService.createMember(memberData);
                showSuccess('Member created successfully');
            }
            setIsModalOpen(false);
            setSelectedMember(null);
            loadMembers();
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to save member');
        }
    };

    const handleDeleteMember = async () => {
        if (!selectedMember) return;
        try {
            await memberService.deleteMember(selectedMember._id);
            showSuccess('Member deleted successfully');
            setIsDeleteModalOpen(false);
            setSelectedMember(null);
            loadMembers();
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to delete member');
        }
    };

    const handleEdit = async (member) => {
        try {
            // Fetch full member details
            const response = await memberService.getMember(member._id);
            setSelectedMember(response.data?.data || response.data);
            setIsModalOpen(true);
        } catch (error) {
            showError('Failed to load member details');
        }
    };

    const handleDelete = (member) => {
        setSelectedMember(member);
        setIsDeleteModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Members</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your gym members and their subscriptions.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} className="mr-2" />
                    Add Member
                </Button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="w-full sm:w-96">
                        <Input
                            placeholder="Search members..."
                            icon={Search}
                            className="dark:bg-slate-900 dark:border-slate-700"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-lg border border-gray-300 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white py-2 px-3 text-sm"
                    >
                        <option value="">All Status</option>
                        {Object.values(MEMBER_STATUSES).map(status => (
                            <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Member</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Join Date</TableHead>
                            <TableHead>Status</TableHead>
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
                        ) : members.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-gray-500 dark:text-gray-400 py-8">
                                    No members found
                                </TableCell>
                            </TableRow>
                        ) : (
                            members.map((member) => {
                                const user = member.userId;
                                const plan = member.planId;
                                return (
                                    <TableRow key={member._id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
                                                    {user?.avatar ? (
                                                        <img src={user.avatar} alt={user.firstName || 'Member'} />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-600 dark:text-gray-300">
                                                            {(user?.firstName?.[0] || user?.email?.[0] || 'M').toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {user?.firstName && user?.lastName
                                                            ? `${user.firstName} ${user.lastName}`
                                                            : user?.email || 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        ID: {member.memberId || `#${member._id.slice(-6)}`}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-gray-900 dark:text-gray-200">{user?.email || 'N/A'}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{user?.phone || '-'}</div>
                                        </TableCell>
                                        <TableCell>{plan?.name || 'N/A'}</TableCell>
                                        <TableCell>{formatDate(member.subscriptionStart)}</TableCell>
                                        <TableCell>
                                            <Badge variant={member.status === 'active' ? 'success' : member.status === 'expired' ? 'warning' : 'gray'}>
                                                {member.status || 'Active'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link to={`/members/${member._id}`} className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                                    <Eye size={18} />
                                                </Link>
                                                <button 
                                                    onClick={() => handleEdit(member)}
                                                    className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(member)}
                                                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
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
                    setSelectedMember(null);
                }}
                title={selectedMember ? "Edit Member" : "Add New Member"}
            >
                <MemberForm 
                    member={selectedMember}
                    onSubmit={handleCreateMember}
                    onCancel={() => {
                        setIsModalOpen(false);
                        setSelectedMember(null);
                    }} 
                />
            </Modal>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedMember(null);
                }}
                onConfirm={handleDeleteMember}
                title="Delete Member"
                message={`Are you sure you want to delete ${selectedMember?.userId?.firstName || 'this member'}? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
};

export default Members;
