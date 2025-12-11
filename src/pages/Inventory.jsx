import { Wrench, AlertTriangle, CheckCircle, Search, Plus } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/common/Table';

const Inventory = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory & Equipment</h1>
                    <p className="text-gray-500 dark:text-gray-400">Track equipment status and maintenance.</p>
                </div>
                <Button>
                    <Plus size={20} className="mr-2" />
                    Add Item
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-4 flex items-center gap-4 bg-orange-50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/30">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
                        <Wrench size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-orange-800 dark:text-orange-300">Repairs Needed</p>
                        <h3 className="text-2xl font-bold text-orange-900 dark:text-orange-200">5 Items</h3>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 bg-yellow-50 border-yellow-100 dark:bg-yellow-900/10 dark:border-yellow-900/30">
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Maintenance Due</p>
                        <h3 className="text-2xl font-bold text-yellow-900 dark:text-yellow-200">12 Item</h3>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-900/30">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-300">All Good</p>
                        <h3 className="text-2xl font-bold text-green-900 dark:text-green-200">145 Items</h3>
                    </div>
                </Card>
            </div>

            <Card className="overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-slate-700">
                    <div className="w-full sm:w-96">
                        <Input
                            placeholder="Search equipment..."
                            icon={Search}
                            className="dark:bg-slate-900 dark:border-slate-700"
                        />
                    </div>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Purchase Date</TableHead>
                            <TableHead>Condition</TableHead>
                            <TableHead>Last Service</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-medium text-gray-900 dark:text-white">Technogym Treadmill</TableCell>
                            <TableCell>Cardio</TableCell>
                            <TableCell>Jan 15, 2022</TableCell>
                            <TableCell>Good</TableCell>
                            <TableCell>Sep 10, 2024</TableCell>
                            <TableCell><Badge variant="success">Operational</Badge></TableCell>
                            <TableCell className="text-right"><Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400">Details</Button></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium text-gray-900 dark:text-white">Dumbbell Set (5-50kg)</TableCell>
                            <TableCell>Strength</TableCell>
                            <TableCell>Jun 20, 2021</TableCell>
                            <TableCell>Good</TableCell>
                            <TableCell>-</TableCell>
                            <TableCell><Badge variant="success">Operational</Badge></TableCell>
                            <TableCell className="text-right"><Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400">Details</Button></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium text-gray-900 dark:text-white">Cable Crossover Machine</TableCell>
                            <TableCell>Strength</TableCell>
                            <TableCell>Mar 10, 2023</TableCell>
                            <TableCell className="text-orange-600 dark:text-orange-400">Cable Frayed</TableCell>
                            <TableCell>Aug 01, 2024</TableCell>
                            <TableCell><Badge variant="warning">Maintenance Due</Badge></TableCell>
                            <TableCell className="text-right"><Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400">Details</Button></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
};

export default Inventory;
