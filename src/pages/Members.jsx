import { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, Edit, Trash, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/common/Table';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import MemberForm from '../components/members/MemberForm';

const Members = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

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
                        />
                    </div>
                    <Button variant="secondary" className="sm:w-auto">
                        <Filter size={16} className="mr-2" />
                        Filter
                    </Button>
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
                        {[1, 2, 3, 4, 5].map((item) => (
                            <TableRow key={item}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item}`} alt="Avatar" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">Jane Cooper</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">ID: #M{202300 + item}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-gray-900 dark:text-gray-200">jane@example.com</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">+1 (555) 123-4567</div>
                                </TableCell>
                                <TableCell>Active Yearly</TableCell>
                                <TableCell>Jan 12, 2024</TableCell>
                                <TableCell><Badge variant="success">Active</Badge></TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link to={`/members/${item}`} className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                            <Eye size={18} />
                                        </Link>
                                        <button className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                                            <Edit size={18} />
                                        </button>
                                        <button className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                            <Trash size={18} />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Member"
            >
                <MemberForm onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default Members;
