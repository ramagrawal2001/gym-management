import mongoose from 'mongoose';

const workoutPlanSchema = new mongoose.Schema({
    gymId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: [true, 'Plan name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    exercises: [{
        name: { type: String, required: true },
        sets: { type: Number, required: true, min: 1 },
        reps: { type: String, required: true }, // allow things like "10-12" or "until failure"
        weight: { type: String }, // optional, string to allow e.g. "Bodyweight" or "10 kg"
        dayOfWeek: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            required: true
        },
        notes: { type: String }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Ensure only one default plan exists per gym
workoutPlanSchema.pre('save', async function (next) {
    if (this.isModified('isDefault') && this.isDefault) {
        await this.constructor.updateMany(
            { gymId: this.gymId, _id: { $ne: this._id } },
            { $set: { isDefault: false } }
        );
    }
    next();
});

export default mongoose.model('WorkoutPlan', workoutPlanSchema);
