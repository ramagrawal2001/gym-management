import mongoose from 'mongoose';

const dietPlanSchema = new mongoose.Schema({
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
    meals: [{
        mealType: {
            type: String,
            required: true,
            enum: ['Pre-Workout', 'Breakfast', 'Morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner', 'Post-Workout', 'Other']
        },
        time: { type: String }, // e.g. "08:00 AM"
        foodItems: { type: String, required: true }, // e.g. "2 boiled eggs, 1 cup oatmeal"
        calories: { type: Number },
        proteins: { type: Number }, // in grams
        carbs: { type: Number }, // in grams
        fats: { type: Number }, // in grams
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
dietPlanSchema.pre('save', async function (next) {
    if (this.isModified('isDefault') && this.isDefault) {
        await this.constructor.updateMany(
            { gymId: this.gymId, _id: { $ne: this._id } },
            { $set: { isDefault: false } }
        );
    }
    next();
});

export default mongoose.model('DietPlan', dietPlanSchema);
