import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/authRoutes.js';
import gymRoutes from './routes/gymRoutes.js';
import planRoutes from './routes/planRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import classRoutes from './routes/classRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import equipmentRoutes from './routes/equipmentRoutes.js';
import subscriptionPlanRoutes from './routes/subscriptionPlanRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import attendanceConfigRoutes from './routes/attendanceConfigRoutes.js';
import { handleRazorpayWebhook } from './controllers/subscriptionController.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'GymOS API is running' });
});

// Razorpay Webhook (must be before other routes - needs raw body)
app.post('/api/v1/webhooks/razorpay', express.raw({ type: 'application/json' }), handleRazorpayWebhook);

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/gyms', gymRoutes);
app.use('/api/v1/plans', planRoutes);
app.use('/api/v1/members', memberRoutes);
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/classes', classRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use('/api/v1/equipment', equipmentRoutes);
app.use('/api/v1/subscription-plans', subscriptionPlanRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/attendance-config', attendanceConfigRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://globalprotechin_db_user:evJlNrZRFfCrXbjC@cluster0.ufhjyge.mongodb.net/gym')
  .then(() => {
    console.log('MongoDB Connected');

    // Start server
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

export default app;

