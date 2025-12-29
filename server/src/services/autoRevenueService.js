import Revenue from '../models/Revenue.js';
import RevenueSource from '../models/RevenueSource.js';
import Payment from '../models/Payment.js';
import Invoice from '../models/Invoice.js';
import Member from '../models/Member.js';
import Plan from '../models/Plan.js';

/**
 * Auto Revenue Service - Core automation engine for revenue generation
 * 
 * This service handles:
 * 1. Auto-creation of revenue from payments
 * 2. Revenue reversal on refunds
 * 3. Expected revenue calculation
 */

/**
 * Detect revenue source from payment/invoice data
 * Logic: Analyze invoice line items or payment metadata to determine source
 */
const detectRevenueSource = async (invoice, gymId) => {
    try {
        // Default to Manual/Other if detection fails
        let sourceName = 'Manual / Other';

        // Detection logic based on invoice items or metadata
        if (invoice && invoice.items && invoice.items.length > 0) {
            const firstItem = invoice.items[0];

            // Check item description for keywords
            const desc = (firstItem.description || '').toLowerCase();

            if (desc.includes('membership') || desc.includes('subscription')) {
                sourceName = 'Monthly Membership';
            } else if (desc.includes('personal training') || desc.includes('pt') || desc.includes('trainer')) {
                sourceName = 'Personal Training';
            } else if (desc.includes('cardio') || desc.includes('treadmill') || desc.includes('cycle')) {
                sourceName = 'Cardio Plans';
            } else if (desc.includes('class') || desc.includes('yoga') || desc.includes('zumba')) {
                sourceName = 'Group Classes';
            } else if (desc.includes('admission') || desc.includes('joining') || desc.includes('registration')) {
                sourceName = 'Admission Fee';
            } else if (desc.includes('merchandise') || desc.includes('product') || desc.includes('supplement')) {
                sourceName = 'Merchandise';
            }
        }

        // Find the revenue source
        const revenueSource = await RevenueSource.findOne({
            gymId,
            name: sourceName,
            isActive: true,
            isDeleted: false
        });

        if (!revenueSource) {
            // Fallback to Manual/Other
            return await RevenueSource.findOne({
                gymId,
                name: 'Manual / Other',
                isDeleted: false
            });
        }

        return revenueSource;

    } catch (error) {
        console.error('Error detecting revenue source:', error);
        throw error;
    }
};

/**
 * Create revenue from payment (auto-generation)
 * Called when payment status changes to 'completed'
 */
export const createRevenueFromPayment = async (payment, invoice = null, options = {}) => {
    try {
        // Prevent duplicate revenue creation
        const existingRevenue = await Revenue.findOne({
            referenceType: 'payment',
            referenceId: payment._id,
            isDeleted: false
        });

        if (existingRevenue) {
            console.log(`Revenue already exists for payment ${payment._id}`);
            return existingRevenue;
        }

        // Fetch invoice if not provided
        if (!invoice && payment.invoiceId) {
            invoice = await Invoice.findById(payment.invoiceId);
        }

        // Detect revenue source
        const revenueSource = await detectRevenueSource(invoice, payment.gymId);

        if (!revenueSource) {
            throw new Error(`No revenue source found for gym ${payment.gymId}`);
        }

        // Get member info
        let memberId = payment.memberId;
        if (invoice && invoice.memberId) {
            memberId = invoice.memberId;
        }

        // Create description
        let description = 'Payment received';
        if (invoice) {
            description = invoice.items?.map(i => i.description).join(', ') || 'Payment received';
        }

        // Create revenue entry
        const revenue = await Revenue.create({
            amount: payment.amount,
            sourceId: revenueSource._id,
            description: description.substring(0, 255), // Limit length
            revenueDate: payment.paymentDate || payment.createdAt,
            notes: `Auto-generated from payment #${payment._id}`,
            gymId: payment.gymId,
            paymentId: payment._id,
            memberId: memberId,
            createdBy: payment.createdBy || payment.receivedBy,
            generatedBy: 'system',
            referenceType: 'payment',
            referenceId: payment._id
        });

        console.log(`✅ Auto-created revenue ${revenue._id} from payment ${payment._id}`);
        return revenue;

    } catch (error) {
        console.error('Error creating revenue from payment:', error);
        throw error;
    }
};

/**
 * Reverse revenue (for refunds)
 * Called when payment is refunded or cancelled
 */
export const reverseRevenue = async (referenceType, referenceId, reason = 'Refund processed') => {
    try {
        // Find the original revenue
        const originalRevenue = await Revenue.findOne({
            referenceType,
            referenceId,
            isDeleted: false,
            isReversed: false
        });

        if (!originalRevenue) {
            console.log(`No revenue found to reverse for ${referenceType} ${referenceId}`);
            return null;
        }

        // Mark original as reversed
        originalRevenue.isReversed = true;
        originalRevenue.reversedAt = new Date();
        originalRevenue.reversalReason = reason;
        await originalRevenue.save();

        // Create reversal entry (negative amount)
        const reversalRevenue = await Revenue.create({
            amount: -originalRevenue.amount, // Negative amount
            sourceId: originalRevenue.sourceId,
            description: `REVERSAL: ${originalRevenue.description}`,
            revenueDate: new Date(),
            notes: `Reversal of revenue ${originalRevenue._id}. Reason: ${reason}`,
            gymId: originalRevenue.gymId,
            paymentId: originalRevenue.paymentId,
            memberId: originalRevenue.memberId,
            createdBy: originalRevenue.createdBy,
            generatedBy: 'system',
            referenceType: originalRevenue.referenceType,
            referenceId: originalRevenue.referenceId
        });

        // Link them together
        originalRevenue.reversalRevenueId = reversalRevenue._id;
        await originalRevenue.save();

        console.log(`✅ Reversed revenue ${originalRevenue._id}, created reversal ${reversalRevenue._id}`);
        return { originalRevenue, reversalRevenue };

    } catch (error) {
        console.error('Error reversing revenue:', error);
        throw error;
    }
};

/**
 * Calculate expected revenue for a period
 * Based on active memberships, PT packages, scheduled classes
 */
export const calculateExpectedRevenue = async (gymId, startDate, endDate) => {
    try {
        let expectedRevenue = 0;

        // 1. Active memberships (recurring)
        const activeMembers = await Member.find({
            gymId,
            status: 'active',
            membershipEndDate: { $gte: new Date(startDate) },
            isDeleted: false
        }).populate('planId');

        for (const member of activeMembers) {
            if (member.planId && member.planId.price) {
                // Monthly recurring revenue
                expectedRevenue += member.planId.price;
            }
        }

        // 2. TODO: Add PT packages expected revenue
        // 3. TODO: Add scheduled classes expected revenue
        // 4. TODO: Add cardio plans expected revenue

        return expectedRevenue;

    } catch (error) {
        console.error('Error calculating expected revenue:', error);
        throw error;
    }
};

/**
 * Calculate collection efficiency
 * (Collected / Expected) × 100
 */
export const calculateCollectionEfficiency = async (gymId, startDate, endDate) => {
    try {
        const expected = await calculateExpectedRevenue(gymId, startDate, endDate);

        // Collected revenue (paid, not reversed)
        const collectedResult = await Revenue.aggregate([
            {
                $match: {
                    gymId,
                    revenueDate: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    },
                    isDeleted: false,
                    isReversed: false
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        const collected = collectedResult.length > 0 ? collectedResult[0].total : 0;

        const efficiency = expected > 0 ? (collected / expected) * 100 : 0;

        return {
            expected,
            collected,
            efficiency: Math.round(efficiency * 100) / 100, // 2 decimal places
            pending: expected - collected
        };

    } catch (error) {
        console.error('Error calculating collection efficiency:', error);
        throw error;
    }
};

export default {
    createRevenueFromPayment,
    reverseRevenue,
    calculateExpectedRevenue,
    calculateCollectionEfficiency
};
