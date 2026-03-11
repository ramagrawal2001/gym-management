import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { createLead, updateLead } from '../../../services/superAdminLeadService';

const STATUSES = ['New', 'Contacted', 'Demo Scheduled', 'Negotiation', 'Converted', 'Lost'];
const SOURCES = ['Website Inbound', 'Referral', 'Cold Call', 'Social Media', 'Other'];

const LeadFormModal = ({ isOpen, onClose, lead, onSuccess }) => {
    const [formData, setFormData] = useState({
        businessName: '',
        contactName: '',
        email: '',
        phone: '',
        status: 'New',
        source: 'Website Inbound',
        expectedValue: '',
        planInterest: '',
        initialNote: '' // Only for create
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (lead) {
            setFormData({
                businessName: lead.businessName || '',
                contactName: lead.contactName || '',
                email: lead.email || '',
                phone: lead.phone || '',
                status: lead.status || 'New',
                source: lead.source || 'Website Inbound',
                expectedValue: lead.expectedValue || '',
                planInterest: lead.planInterest || '',
                initialNote: ''
            });
        } else {
            setFormData({
                businessName: '',
                contactName: '',
                email: '',
                phone: '',
                status: 'New',
                source: 'Website Inbound',
                expectedValue: '',
                planInterest: '',
                initialNote: ''
            });
        }
    }, [lead, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (lead) {
                await updateLead(lead._id, formData);
                toast.success('Lead updated successfully');
            } else {
                await createLead(formData);
                toast.success('Lead created successfully');
            }
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-black/40 backdrop-blur-sm" onClick={onClose} />

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div className="relative z-10 inline-block w-full max-w-2xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white dark:bg-slate-800 rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
                    <div className="flex justify-between items-center mb-5">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                            {lead ? 'Edit Lead' : 'Add New Lead'}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Business/Gym Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.businessName}
                                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Contact Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.contactName}
                                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Phone *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                >
                                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Source
                                </label>
                                <select
                                    value={formData.source}
                                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                >
                                    {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Expected Value (₹)
                                </label>
                                <input
                                    type="number"
                                    value={formData.expectedValue}
                                    onChange={(e) => setFormData({ ...formData, expectedValue: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Plan Interest
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Pro Plan, Basic Plan"
                                    value={formData.planInterest}
                                    onChange={(e) => setFormData({ ...formData, planInterest: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            {!lead && (
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Initial Note/Context
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={formData.initialNote}
                                        onChange={(e) => setFormData({ ...formData, initialNote: e.target.value })}
                                        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LeadFormModal;
