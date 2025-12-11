import { useState } from 'react';
import { Plus, Search, Filter, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/common/Table';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import MemberForm from '../components/members/MemberForm';

const membersData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1 234 567 890', plan: 'Yoga - 3 Months', status: 'Active', joinDate: '2023-10-15', expiryDate: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+1 987 654 321', plan: 'Cardio - 1 Month', status: 'Expired', joinDate: '2023-09-10', expiryDate: '2023-10-10' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', phone: '+1 112 223 334', plan: 'Weight Lifting - 1 Year', status: 'Active', joinDate: '2023-05-20', expiryDate: '2024-05-20' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', phone: '+1 556 667 778', plan: 'Zumba - 6 Months', status: 'Pending', joinDate: '2023-10-22', expiryDate: '2024-04-22' },
    // Add more mock data if needed
];

const Members = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Filter members based on search
    const filteredMembers = membersData.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Members</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage all your gym members</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus size={20} className="mr-2" />
                    Add Member
                </Button>
            </div>

            <Card>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search members..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button variant="secondary" className="!px-3">
                            <Filter size={20} className="mr-2" />
                            Filter
                        </Button>
                        <Button variant="secondary" className="!px-3">
                            Export
                        </Button>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Member Info</TableHead>
                            <TableHead>Plan Details</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Dates</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredMembers.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell>
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{member.name}</div>
                                            <div className="text-sm text-gray-500">{member.email}</div>
                                            <div className="text-xs text-gray-400">{member.phone}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium text-gray-800">{member.plan}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={member.status === 'Active' ? 'success' : member.status === 'Pending' ? 'warning' : 'danger'}>
                                        {member.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm text-gray-600">
                                        <span className="block">Joined: {member.joinDate}</span>
                                        <span className="block text-gray-400">Expires: {member.expiryDate}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                                            <Eye size={18} />
                                        </button>
                                        <button className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                                            <Edit size={18} />
                                        </button>
                                        <button className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredMembers.length === 0 && (
                            <TableRow>
                                <TableCell className="text-center py-8" colSpan={5}>
                                    <p className="text-gray-500">No members found.</p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Member">
                <MemberForm onClose={() => setIsAddModalOpen(false)} />
                <div className="mt-6 flex justify-end space-x-3 pt-6 border-t border-gray-100">
                    <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                    <Button onClick={() => setIsAddModalOpen(false)}>Add Member</Button>
                </div>
            </Modal>
        </div>
    );
};

export default Members;
