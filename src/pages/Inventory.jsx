import { Plus, AlertTriangle, PenTool } from 'lucide-react';
import { useState } from 'react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/common/Table';

const inventoryData = [
    { id: 1, name: 'Dumbbells Set (5-50kg)', category: 'Weights', quantity: 2, status: 'Good', lastService: '2023-08-15' },
    { id: 2, name: 'Treadmill X2000', category: 'Cardio', quantity: 5, status: 'Maintenance Due', lastService: '2023-05-10' },
    { id: 3, name: 'Yoga Mats', category: 'Accessories', quantity: 20, status: 'Good', lastService: '-' },
    { id: 4, name: 'Cable Machine', category: 'Strength', quantity: 1, status: 'Repair Needed', lastService: '2023-01-20' },
];

const Inventory = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Inventory & Equipment</h1>
                    <p className="text-gray-500 text-sm mt-1">Track asset status and maintenance</p>
                </div>
                <Button>
                    <Plus size={20} className="mr-2" />
                    Add Equipment
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-red-50 border-red-100">
                    <div className="flex items-center text-red-700 font-medium mb-1">
                        <AlertTriangle size={18} className="mr-2" />
                        Repairs Needed
                    </div>
                    <div className="text-2xl font-bold text-red-800">1 Item</div>
                </Card>
                <Card className="bg-orange-50 border-orange-100">
                    <div className="flex items-center text-orange-700 font-medium mb-1">
                        <PenTool size={18} className="mr-2" />
                        Maintenance Due
                    </div>
                    <div className="text-2xl font-bold text-orange-800">1 Item</div>
                </Card>
                <Card className="bg-green-50 border-green-100">
                    <div className="flex items-center text-green-700 font-medium mb-1">
                        <CheckCircle size={18} className="mr-2" />
                        All Good
                    </div>
                    <div className="text-2xl font-bold text-green-800">22 Items</div>
                </Card>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Equipment Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Service</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {inventoryData.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium text-gray-900">{item.name}</TableCell>
                                <TableCell>{item.category}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        item.status === 'Good' ? 'success' :
                                            item.status === 'Maintenance Due' ? 'warning' : 'danger'
                                    }>
                                        {item.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{item.lastService}</TableCell>
                                <TableCell className="text-right">
                                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Log Service</button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
};

import { CheckCircle } from 'lucide-react'; // Late import fix
export default Inventory;
