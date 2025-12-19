import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema({
  gymId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Equipment name is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['cardio', 'strength', 'functional', 'accessories', 'other'],
    required: true
  },
  brand: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  purchaseDate: {
    type: Date
  },
  purchasePrice: {
    type: Number,
    min: 0
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'needs_repair'],
    default: 'good'
  },
  lastService: {
    type: Date
  },
  nextService: {
    type: Date
  },
  serviceInterval: {
    type: Number, // in days
    default: 90,
    min: [1, 'Service interval must be at least 1 day']
  },
  status: {
    type: String,
    enum: ['operational', 'maintenance_due', 'out_of_order', 'retired'],
    default: 'operational'
  },
  location: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Equipment', equipmentSchema);

