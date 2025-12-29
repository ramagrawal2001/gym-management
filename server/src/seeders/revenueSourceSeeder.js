import RevenueSource from '../models/RevenueSource.js';
import Gym from '../models/Gym.js';

/**
 * Seeds default revenue sources for a specific gym
 * Called when: new gym created, existing gym opts in, or migration
 */
export const seedRevenueSourcesForGym = async (gymId, createdBy = null) => {
    try {
        // Check if sources already exist for this gym
        const existingCount = await RevenueSource.countDocuments({
            gymId,
            isDeleted: false
        });

        if (existingCount > 0) {
            console.log(`Revenue sources already exist for gym ${gymId}. Skipping.`);
            return { success: true, message: 'Sources already exist', count: existingCount };
        }

        // Default system sources
        const defaultSources = [
            {
                name: 'Monthly Membership',
                description: 'Monthly membership fees and renewals',
                category: 'recurring',
                autoGenerate: true,
                linkedModule: 'membership',
                gstApplicable: true,
                isSystemSource: true,
                icon: '👥',
                color: '#3b82f6'
            },
            {
                name: 'Personal Training',
                description: 'Personal training sessions and packages',
                category: 'one-time',
                autoGenerate: true,
                linkedModule: 'pt',
                gstApplicable: true,
                isSystemSource: true,
                icon: '🏋️',
                color: '#f59e0b'
            },
            {
                name: 'Cardio Plans',
                description: 'Cardio and add-on plan subscriptions',
                category: 'recurring',
                autoGenerate: true,
                linkedModule: 'cardio',
                gstApplicable: true,
                isSystemSource: true,
                icon: '🏃',
                color: '#ec4899'
            },
            {
                name: 'Group Classes',
                description: 'Group fitness classes (Yoga, Zumba, etc.)',
                category: 'one-time',
                autoGenerate: true,
                linkedModule: 'class',
                gstApplicable: true,
                isSystemSource: true,
                icon: '🧘',
                color: '#8b5cf6'
            },
            {
                name: 'Admission Fee',
                description: 'One-time admission/joining fees',
                category: 'one-time',
                autoGenerate: true,
                linkedModule: 'admission',
                gstApplicable: true,
                isSystemSource: true,
                icon: '🎫',
                color: '#14b8a6'
            },
            {
                name: 'Merchandise',
                description: 'POS sales, supplements, equipment',
                category: 'one-time',
                autoGenerate: false,
                linkedModule: 'pos',
                gstApplicable: true,
                isSystemSource: true,
                icon: '🛒',
                color: '#06b6d4'
            },
            {
                name: 'Manual / Other',
                description: 'Manual revenue entries (events, sponsorships, misc)',
                category: 'one-time',
                autoGenerate: false,
                linkedModule: null,
                gstApplicable: false,
                isSystemSource: true,
                icon: '💰',
                color: '#10b981'
            }
        ];

        // Create sources
        const sources = await RevenueSource.insertMany(
            defaultSources.map(source => ({
                ...source,
                gymId,
                createdBy,
                isActive: true
            }))
        );

        console.log(`✅ Created ${sources.length} default revenue sources for gym ${gymId}`);
        return { success: true, count: sources.length, sources };

    } catch (error) {
        console.error('Error seeding revenue sources:', error);
        throw error;
    }
};

/**
 * Seeds revenue sources for ALL existing gyms
 * Used for migration
 */
export const seedRevenueSourcesForAllGyms = async () => {
    try {
        const gyms = await Gym.find({ isDeleted: false }).select('_id name');

        let successCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const gym of gyms) {
            try {
                const result = await seedRevenueSourcesForGym(gym._id);
                if (result.message === 'Sources already exist') {
                    skippedCount++;
                } else {
                    successCount++;
                }
            } catch (error) {
                console.error(`Failed for gym ${gym._id}:`, error.message);
                errorCount++;
            }
        }

        console.log(`\n📊 Revenue Source Seeding Complete:`);
        console.log(`✅ Created: ${successCount} gyms`);
        console.log(`⏭️  Skipped: ${skippedCount} gyms (already had sources)`);
        console.log(`❌ Errors: ${errorCount} gyms`);

        return { successCount, skippedCount, errorCount };

    } catch (error) {
        console.error('Error in bulk seeding:', error);
        throw error;
    }
};

// CLI execution support
if (process.argv[1] === new URL(import.meta.url).pathname) {
    console.log('🌱 Starting Revenue Source Seeder...\n');

    // Connect to MongoDB first
    import('mongoose').then(async ({ default: mongoose }) => {
        try {
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://globalprotechin_db_user:evJlNrZRFfCrXbjC@cluster0.ufhjyge.mongodb.net/gym');
            console.log('✅ Connected to MongoDB\n');

            await seedRevenueSourcesForAllGyms();

            console.log('\n✅ Seeding complete!');
            await mongoose.disconnect();
            process.exit(0);
        } catch (error) {
            console.error('\n❌ Seeding failed:', error);
            await mongoose.disconnect();
            process.exit(1);
        }
    });
}
