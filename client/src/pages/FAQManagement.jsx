import { useState, useEffect } from 'react';
import { getFAQs, createFAQ, updateFAQ, deleteFAQ, getFAQCategories } from '../services/faqService';
import { toast } from 'react-hot-toast';
import { PlusCircle, Edit2, Trash2, FileQuestion } from 'lucide-react';

export default function FAQManagement() {
    const [faqs, setFAQs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingFAQ, setEditingFAQ] = useState(null);
    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        category: 'general',
        isGlobal: false,
        order: 0
    });

    useEffect(() => {
        fetchFAQs();
        fetchCategories();
    }, []);

    const fetchFAQs = async () => {
        try {
            setLoading(true);
            const response = await getFAQs();
            setFAQs(response.data.data || []);
        } catch (error) {
            console.error('Error fetching FAQs:', error);
            toast.error('Failed to load FAQs');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await getFAQCategories();
            setCategories(response.data.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingFAQ) {
                await updateFAQ(editingFAQ._id, formData);
                toast.success('FAQ updated successfully');
            } else {
                await createFAQ(formData);
                toast.success('FAQ created successfully');
            }
            setShowModal(false);
            setEditingFAQ(null);
            setFormData({ question: '', answer: '', category: 'general', isGlobal: false, order: 0 });
            fetchFAQs();
        } catch (error) {
            console.error('Error saving FAQ:', error);
            toast.error('Failed to save FAQ');
        }
    };

    const handleEdit = (faq) => {
        setEditingFAQ(faq);
        setFormData({
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            isGlobal: faq.isGlobal,
            order: faq.order
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this FAQ?')) return;

        try {
            await deleteFAQ(id);
            toast.success('FAQ deleted successfully');
            fetchFAQs();
        } catch (error) {
            console.error('Error deleting FAQ:', error);
            toast.error('Failed to delete FAQ');
        }
    };

    const groupedFAQs = faqs.reduce((acc, faq) => {
        if (!acc[faq.category]) acc[faq.category] = [];
        acc[faq.category].push(faq);
        return acc;
    }, {});

    return (
        <div className="p-6">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileQuestion className="w-7 h-7" />
                        FAQ Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage frequently asked questions</p>
                </div>
                <button
                    onClick={() => {
                        setEditingFAQ(null);
                        setFormData({ question: '', answer: '', category: 'general', isGlobal: false, order: 0 });
                        setShowModal(true);
                    }}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Add FAQ
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading...</div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedFAQs).map(([category, categoryFAQs]) => (
                        <div key={category} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4 capitalize flex items-center gap-2">
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                    {category}
                                </span>
                                <span className="text-gray-400 text-sm">({categoryFAQs.length})</span>
                            </h2>

                            <div className="space-y-4">
                                {categoryFAQs.map((faq) => (
                                    <div key={faq._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">{faq.question}</h3>
                                                    {faq.isGlobal && (
                                                        <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                                                            Global
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-gray-700 dark:text-gray-300 text-sm">{faq.answer}</p>
                                                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                                                    <span>Views: {faq.views || 0}</span>
                                                    <span>👍 {faq.helpful || 0}</span>
                                                    <span>👎 {faq.notHelpful || 0}</span>
                                                    <span>Order: {faq.order}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(faq)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(faq._id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                            {editingFAQ ? 'Edit FAQ' : 'Create New FAQ'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Question *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.question}
                                        onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="What is your question?"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Answer *</label>
                                    <textarea
                                        required
                                        rows={5}
                                        value={formData.answer}
                                        onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Provide a detailed answer..."
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            {categories.map((cat) => (
                                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Order</label>
                                        <input
                                            type="number"
                                            value={formData.order}
                                            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div className="flex items-end">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.isGlobal}
                                                onChange={(e) => setFormData({ ...formData, isGlobal: e.target.checked })}
                                                className="w-4 h-4 text-blue-600 rounded"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Global FAQ</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingFAQ(null);
                                    }}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    {editingFAQ ? 'Update FAQ' : 'Create FAQ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
