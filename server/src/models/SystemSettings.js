import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema({
    whatsappFeatureEnabled: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Helper to get or create the single settings document
systemSettingsSchema.statics.getSettings = async function() {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({ whatsappFeatureEnabled: false });
    }
    return settings;
};

const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);

export default SystemSettings;
