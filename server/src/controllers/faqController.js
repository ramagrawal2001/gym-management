import FAQ from '../models/FAQ.js';

// Get all FAQs (public + gym-specific)
export const getFAQs = async (req, res) => {
    try {
        const { category, search } = req.query;
        const gymId = req.user?.gymId; // Optional auth

        const filter = { isActive: true };

        // Get global FAQs and gym-specific FAQs
        filter.$or = [
            { isGlobal: true },
            { gymId: gymId }
        ];

        if (category) {
            filter.category = category;
        }

        if (search) {
            filter.$or = [
                { question: { $regex: search, $options: 'i' } },
                { answer: { $regex: search, $options: 'i' } }
            ];
        }

        const faqs = await FAQ.find(filter).sort({ order: 1, createdAt: -1 });

        res.status(200).json({
            success: true,
            count: faqs.length,
            data: faqs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching FAQs',
            error: error.message
        });
    }
};

// Get single FAQ by ID
export const getFAQById = async (req, res) => {
    try {
        const { id } = req.params;

        const faq = await FAQ.findById(id);

        if (!faq) {
            return res.status(404).json({
                success: false,
                message: 'FAQ not found'
            });
        }

        // Increment view count
        faq.views += 1;
        await faq.save();

        res.status(200).json({
            success: true,
            data: faq
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching FAQ',
            error: error.message
        });
    }
};

// Create FAQ (owner/super_admin only)
export const createFAQ = async (req, res) => {
    try {
        const { question, answer, category, isGlobal, order } = req.body;
        const gymId = req.user.role === 'super_admin' ? (isGlobal ? null : req.body.gymId) : req.user.gymId;

        if (!question || !answer) {
            return res.status(400).json({
                success: false,
                message: 'Question and answer are required'
            });
        }

        // Only super_admin can create global FAQs
        if (isGlobal && req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Only super admins can create global FAQs'
            });
        }

        const faq = await FAQ.create({
            gymId: isGlobal ? null : gymId,
            question,
            answer,
            category: category || 'general',
            isGlobal: isGlobal || false,
            order: order || 0
        });

        res.status(201).json({
            success: true,
            message: 'FAQ created successfully',
            data: faq
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating FAQ',
            error: error.message
        });
    }
};

// Update FAQ
export const updateFAQ = async (req, res) => {
    try {
        const { id } = req.params;
        const { question, answer, category, isGlobal, order, isActive } = req.body;
        const gymId = req.user.gymId;

        const faq = await FAQ.findById(id);

        if (!faq) {
            return res.status(404).json({
                success: false,
                message: 'FAQ not found'
            });
        }

        // Check permissions
        if (faq.isGlobal && req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Only super admins can update global FAQs'
            });
        }

        if (!faq.isGlobal && req.user.role !== 'super_admin' && faq.gymId?.toString() !== gymId?.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Update fields
        if (question) faq.question = question;
        if (answer) faq.answer = answer;
        if (category) faq.category = category;
        if (typeof order !== 'undefined') faq.order = order;
        if (typeof isActive !== 'undefined') faq.isActive = isActive;

        // Only super_admin can change isGlobal
        if (typeof isGlobal !== 'undefined' && req.user.role === 'super_admin') {
            faq.isGlobal = isGlobal;
            if (isGlobal) {
                faq.gymId = null;
            }
        }

        await faq.save();

        res.status(200).json({
            success: true,
            message: 'FAQ updated successfully',
            data: faq
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating FAQ',
            error: error.message
        });
    }
};

// Delete FAQ
export const deleteFAQ = async (req, res) => {
    try {
        const { id } = req.params;
        const gymId = req.user.gymId;

        const faq = await FAQ.findById(id);

        if (!faq) {
            return res.status(404).json({
                success: false,
                message: 'FAQ not found'
            });
        }

        // Check permissions
        if (faq.isGlobal && req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Only super admins can delete global FAQs'
            });
        }

        if (!faq.isGlobal && req.user.role !== 'super_admin' && faq.gymId?.toString() !== gymId?.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        await FAQ.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'FAQ deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting FAQ',
            error: error.message
        });
    }
};

// Mark FAQ as helpful/not helpful
export const rateFAQ = async (req, res) => {
    try {
        const { id } = req.params;
        const { helpful } = req.body; // true or false

        const faq = await FAQ.findById(id);

        if (!faq) {
            return res.status(404).json({
                success: false,
                message: 'FAQ not found'
            });
        }

        if (helpful === true) {
            faq.helpful += 1;
        } else if (helpful === false) {
            faq.notHelpful += 1;
        }

        await faq.save();

        res.status(200).json({
            success: true,
            message: 'Thank you for your feedback',
            data: {
                helpful: faq.helpful,
                notHelpful: faq.notHelpful
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error rating FAQ',
            error: error.message
        });
    }
};

// Get FAQ categories
export const getFAQCategories = async (req, res) => {
    try {
        const categories = [
            { value: 'membership', label: 'Membership' },
            { value: 'payments', label: 'Payments' },
            { value: 'classes', label: 'Classes' },
            { value: 'technical', label: 'Technical' },
            { value: 'general', label: 'General' }
        ];

        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
};
