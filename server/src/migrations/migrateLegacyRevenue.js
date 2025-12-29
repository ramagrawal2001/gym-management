import mongoose from 'mongoose';
import Revenue from '../models/Revenue.js';
import RevenueSource from '../models/RevenueSource.js';
import { seedRevenueSourcesForAllGyms } from '../seeders/revenueSourceSeeder.js';

/**
 * Migration: Legacy Revenue (enum source) → New Revenue (sourceId reference)
 * 
 * Steps:
 * 1. Seed RevenueSource for all gyms
 * 2. Map legacy 'source' enum to new 'sourceId'
 * 3. Set generatedBy = 'manual' for all existing revenues
 * 4. Backfill referenceType and referenceId from paymentId
 */

const SOURCE_MAPPING = {
    'membership': 'Monthly Membership',
    'pos_sale': 'Merchandise',
    'personal_training': 'Personal Training',
    'merchandise': 'Merchandise',
    'classes': 'Group Classes',
    'other': 'Manual / Other'
};

async function migrateRevenues() {
    try {
        console.log('🚀 Starting Revenue Migration...\n');

        // Step 1: Seed revenue sources for all gyms
        console.log('📝 Step 1: Seeding revenue sources for all gyms...');
        await seedRevenueSourcesForAllGyms();

        // Step 2: Get all revenues that need migration (those without sourceId)
        console.log('\n📝 Step 2: Fetching revenues to migrate...');
        const revenuesToMigrate = await Revenue.find({
            sourceId: { $exists: false },
            isDeleted: false
        }).select('_id source gymId paymentId');

        console.log(`Found ${revenuesToMigrate.length} revenues to migrate\n`);

        if (revenuesToMigrate.length === 0) {
            console.log('✅ No revenues to migrate. All done!');
            return;
        }

        // Step 3: Process each revenue
        let successCount = 0;
        let errorCount = 0;

        for (const revenue of revenuesToMigrate) {
            try {
                // Find matching revenue source
                const sourceName = SOURCE_MAPPING[revenue.source] || 'Manual / Other';

                const revenueSource = await RevenueSource.findOne({
                    gymId: revenue.gymId,
                    name: sourceName,
                    isDeleted: false
                });

                if (!revenueSource) {
                    console.warn(`⚠️  No source found for gym ${revenue.gymId}, source: ${sourceName}`);
                    errorCount++;
                    continue;
                }

                // Update revenue with new fields
                const updateData = {
                    sourceId: revenueSource._id,
                    generatedBy: 'manual', // All existing revenues are manual
                };

                // Backfill referenceType and referenceId if paymentId exists
                if (revenue.paymentId) {
                    updateData.referenceType = 'payment';
                    updateData.referenceId = revenue.paymentId;
                }

                await Revenue.updateOne(
                    { _id: revenue._id },
                    { $set: updateData }
                );

                successCount++;

                if (successCount % 100 === 0) {
                    console.log(`   Migrated ${successCount}/${revenuesToMigrate.length}...`);
                }

            } catch (error) {
                console.error(`❌ Error migrating revenue ${revenue._id}:`, error.message);
                errorCount++;
            }
        }

        console.log('\n📊 Migration Complete:');
        console.log(`✅ Successfully migrated: ${successCount} revenues`);
        console.log(`❌ Errors: ${errorCount} revenues`);

        // Step 4: Verify migration
        console.log('\n📝 Verifying migration...');
        const unmigrated = await Revenue.countDocuments({
            sourceId: { $exists: false },
            isDeleted: false
        });

        if (unmigrated > 0) {
            console.warn(`⚠️  Warning: ${unmigrated} revenues still unmigrated`);
        } else {
            console.log('✅ All revenues successfully migrated!');
        }

        return { successCount, errorCount, unmigrated };

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

/**
 * Rollback migration (emergency use only)
 */
async function rollbackMigration() {
    try {
        console.log('⏮️  Rolling back revenue migration...\n');

        // Remove sourceId, generatedBy, referenceType, referenceId from all revenues
        const result = await Revenue.updateMany(
            {},
            {
                $unset: {
                    sourceId: '',
                    generatedBy: '',
                    referenceType: '',
                    referenceId: ''
                }
            }
        );

        console.log(`✅ Rolled back ${result.modifiedCount} revenues`);

        // Optionally delete all revenue sources
        console.log('\n⚠️  Revenue sources NOT deleted. Delete manually if needed.');

        return result;

    } catch (error) {
        console.error('❌ Rollback failed:', error);
        throw error;
    }
}

// CLI execution
if (process.argv[1] === new URL(import.meta.url).pathname) {
    const command = process.argv[2];

    if (command === 'rollback') {
        console.log('⚠️  ROLLBACK MODE\n');
        rollbackMigration()
            .then(() => process.exit(0))
            .catch(() => process.exit(1));
    } else {
        migrateRevenues()
            .then(() => process.exit(0))
            .catch(() => process.exit(1));
    }
}

export { migrateRevenues, rollbackMigration };
