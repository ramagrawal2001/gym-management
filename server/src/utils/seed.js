import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://globalprotechin_db_user:evJlNrZRFfCrXbjC@cluster0.ufhjyge.mongodb.net/gym');
    console.log('MongoDB Connected');

    // Default emails to create super admins for
    const adminEmails = [
      'ramagrawal0610@gmail.com',
      'deepakgupta83404@gmail.com'
    ];
    const password = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123';

    for (const email of adminEmails) {
      // Check if user with this email exists
      let superAdmin = await User.findOne({ email });
      
      if (superAdmin) {
        // Update existing user to ensure it's a super admin
        superAdmin.role = 'super_admin';
        superAdmin.isActive = true;
        superAdmin.password = password; // Will be hashed by pre-save hook
        await superAdmin.save();
        console.log('Super Admin updated:', superAdmin.email);
      } else {
        // Create new super admin
        superAdmin = await User.create({
          email,
          password,
          role: 'super_admin',
          firstName: 'Super',
          lastName: 'Admin',
          isActive: true
        });
        console.log('Super Admin created successfully:', superAdmin.email);
      }
    }

    console.log('Super Admin seeding completed');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding super admin:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedSuperAdmin();

