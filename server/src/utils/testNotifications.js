import mongoose from 'mongoose';
import dotenv from 'dotenv';
import notificationService from '../services/notificationService.js';
import User from '../models/User.js';
import Gym from '../models/Gym.js';

// Load environment variables
dotenv.config();

/**
 * Test script to create sample notifications
 * Run with: node src/utils/testNotifications.js
 */

const testNotifications = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://globalprotechin_db_user:evJlNrZRFfCrXbjC@cluster0.ufhjyge.mongodb.net/gym');
        console.log('✅ Connected to MongoDB');

        // Find a test user (gym owner or admin)
        const testUser = await User.findOne({ role: { $in: ['owner', 'super_admin'] } }).limit(1);

        if (!testUser) {
            console.error('❌ No users found. Please create a user first.');
            process.exit(1);
        }

        console.log(`📧 Testing with user: ${testUser.email}`);

        // Get gym ID
        const gymId = testUser.gymId || (await Gym.findOne())._id;

        if (!gymId) {
            console.error('❌ No gym found. Please create a gym first.');
            process.exit(1);
        }

        console.log('\n🧪 Creating test notifications...\n');

        // Test 1: In-app notification
        console.log('1️⃣  Creating in-app notification...');
        const inAppResult = await notificationService.sendNotification({
            gymId,
            type: 'general',
            recipient: {
                userId: testUser._id,
                email: testUser.email,
                name: testUser.firstName || 'User'
            },
            data: {
                title: '🎉 Test Notification',
                message: 'This is a test notification from your GymOS system!',
                actionUrl: '/dashboard'
            },
            channels: ['in_app'] // Only in-app for now
        });
        console.log('✅ In-app notification created:', inAppResult.success ? 'Success' : 'Failed');

        // Test 2: Email + In-app notification
        if (testUser.email) {
            console.log('\n2️⃣  Creating email + in-app notification...');
            const emailResult = await notificationService.sendNotification({
                gymId,
                type: 'welcome',
                recipient: {
                    userId: testUser._id,
                    email: testUser.email,
                    name: testUser.firstName || 'User'
                },
                data: {
                    memberName: testUser.firstName || 'User',
                    gymName: 'Your Gym',
                    title: '👋 Welcome!',
                    message: 'Welcome to GymOS notification system test!'
                },
                channels: ['email', 'in_app']
            });
            console.log('✅ Email notification sent:', emailResult.channels?.email?.success ? 'Success' : 'Failed (check EMAIL config in .env)');
            console.log('✅ In-app notification created:', emailResult.channels?.in_app?.success ? 'Success' : 'Failed');
        }

        // Test 3: Multiple in-app notifications
        console.log('\n3️⃣  Creating multiple test notifications...');

        const notifications = [
            { title: '💪 Membership Reminder', message: 'Your membership expires in 7 days!' },
            { title: '💳 Payment Received', message: 'Payment of ₹1000 received successfully.' },
            { title: '📅 Class Scheduled', message: 'Yoga class scheduled for tomorrow at 6 AM.' },
        ];

        for (const notif of notifications) {
            await notificationService.sendNotification({
                gymId,
                type: 'general',
                recipient: {
                    userId: testUser._id,
                    email: testUser.email
                },
                data: {
                    title: notif.title,
                    message: notif.message
                },
                channels: ['in_app']
            });
        }
        console.log('✅ Created 3 additional test notifications');

        console.log('\n✨ Test complete! Check your app\'s notification bell icon.\n');
        console.log('🔍 How to verify:');
        console.log('   1. Login to your app');
        console.log('   2. Look for the bell icon (🔔) in the header');
        console.log('   3. Click it to see notifications');
        console.log('   4. Check your email inbox (if EMAIL is configured)');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

testNotifications();
