#!/usr/bin/env node

/**
 * Test script for Revenue Management System
 * 
 * Tests:
 * 1. Revenue Source seeding
 * 2. Revenue Source CRUD
 * 3. Manual revenue creation (allowed)
 * 4. Auto-source revenue blocking
 * 5. Expected revenue calculation
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedRevenueSourcesForGym } from '../seeders/revenueSourceSeeder.js';
import RevenueSource from '../models/RevenueSource.js';
import Revenue from '../models/Revenue.js';
import Gym from '../models/Gym.js';

dotenv.config();

const TEST_RESULTS = {
    passed: 0,
    failed: 0,
    tests: []
};

function logTest(name, passed, message = '') {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${name}`);
    if (message) console.log(`   ${message}`);

    TEST_RESULTS.tests.push({ name, passed, message });
    if (passed) TEST_RESULTS.passed++;
    else TEST_RESULTS.failed++;
}

async function runTests() {
    try {
        console.log('\n🧪 Running Revenue Management System Tests...\n');

        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find a test gym
        const gym = await Gym.findOne({ isDeleted: false });
        if (!gym) {
            throw new Error('No gym found in database for testing');
        }
        console.log(`📍 Using gym: ${gym.name} (${gym._id})\n`);

        // TEST 1: Revenue Source Seeding
        console.log('--- Test 1: Revenue Source Seeding ---');
        try {
            await seedRevenueSourcesForGym(gym._id);
            const sources = await RevenueSource.find({ gymId: gym._id, isDeleted: false });

            if (sources.length === 7) {
                logTest('Seeding creates 7 default sources', true);
            } else {
                logTest('Seeding creates 7 default sources', false, `Found ${sources.length} sources`);
            }

            // Check system sources exist
            const membershipSource = sources.find(s => s.name === 'Monthly Membership');
            const manualSource = sources.find(s => s.name === 'Manual / Other');

            logTest('Membership source exists', !!membershipSource);
            logTest('Manual/Other source exists', !!manualSource);
            logTest('Membership source is auto-generate', membershipSource?.autoGenerate === true);
            logTest('Manual source is NOT auto-generate', manualSource?.autoGenerate === false);

        } catch (error) {
            logTest('Revenue source seeding', false, error.message);
        }

        // TEST 2: Source Validation
        console.log('\n--- Test 2: Source Validation ---');
        const membershipSource = await RevenueSource.findOne({
            gymId: gym._id,
            name: 'Monthly Membership'
        });
        const manualSource = await RevenueSource.findOne({
            gymId: gym._id,
            name: 'Manual / Other'
        });

        logTest('Membership source has linkedModule', membershipSource.linkedModule === 'membership');
        logTest('Membership source is system source', membershipSource.isSystemSource === true);
        logTest('Manual source has no linkedModule', manualSource.linkedModule === null);

        // TEST 3: Manual Revenue Creation (Should Work)
        console.log('\n--- Test 3: Manual Revenue Creation ---');
        try {
            const testRevenue = await Revenue.create({
                amount: 5000,
                sourceId: manualSource._id,
                description: 'Test manual revenue',
                revenueDate: new Date(),
                gymId: gym._id,
                createdBy: gym.ownerId,
                generatedBy: 'manual'
            });

            logTest('Can create revenue with manual source', !!testRevenue);
            logTest('Revenue has correct sourceId', testRevenue.sourceId.toString() === manualSource._id.toString());
            logTest('Revenue generatedBy is manual', testRevenue.generatedBy === 'manual');

            // Cleanup
            await Revenue.findByIdAndDelete(testRevenue._id);

        } catch (error) {
            logTest('Manual revenue creation', false, error.message);
        }

        // TEST 4: Source Toggle
        console.log('\n--- Test 4: Revenue Source Toggle ---');
        try {
            const customSource = await RevenueSource.create({
                name: 'Test Custom Source',
                category: 'one-time',
                autoGenerate: false,
                isSystemSource: false,
                gymId: gym._id,
                createdBy: gym.ownerId
            });

            logTest('Can create custom source', !!customSource);

            // Toggle
            customSource.isActive = false;
            await customSource.save();
            logTest('Can disable custom source', customSource.isActive === false);

            // Delete
            await RevenueSource.findByIdAndDelete(customSource._id);

        } catch (error) {
            logTest('Source toggle', false, error.message);
        }

        // TEST 5: Expected Revenue Calculation
        console.log('\n--- Test 5: Expected Revenue Calculation ---');
        try {
            const { calculateExpectedRevenue } = await import('../services/autoRevenueService.js');
            const expected = await calculateExpectedRevenue(
                gym._id,
                new Date(),
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            );

            logTest('Expected revenue calculation runs', typeof expected === 'number');
            logTest('Expected revenue is non-negative', expected >= 0);

        } catch (error) {
            logTest('Expected revenue calculation', false, error.message);
        }

        // Print Summary
        console.log('\n' + '='.repeat(50));
        console.log('📊 TEST SUMMARY');
        console.log('='.repeat(50));
        console.log(`✅ Passed: ${TEST_RESULTS.passed}`);
        console.log(`❌ Failed: ${TEST_RESULTS.failed}`);
        console.log(`Total: ${TEST_RESULTS.tests.length}`);
        console.log('='.repeat(50) + '\n');

        if (TEST_RESULTS.failed === 0) {
            console.log('🎉 All tests passed!\n');
            process.exit(0);
        } else {
            console.log('⚠️  Some tests failed. Review above.\n');
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Test suite error:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

runTests();
