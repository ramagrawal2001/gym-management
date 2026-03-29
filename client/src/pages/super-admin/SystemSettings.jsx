import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useNotification } from '../../hooks/useNotification';
import { getSystemSettings, updateSystemSettings } from '../../services/systemSettingsService';
import { Settings, MessageCircle, Save } from 'lucide-react';

const SystemSettings = () => {
    const { success, error } = useNotification();
    const [settings, setSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await getSystemSettings();
                setSettings(data);
            } catch (err) {
                console.error(err);
                error('Failed to load system settings');
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, [error]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateSystemSettings({
                whatsappFeatureEnabled: settings.whatsappFeatureEnabled
            });
            success('System settings updated successfully');
        } catch (err) {
            console.error(err);
            error('Failed to update system settings');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Settings className="w-6 h-6" />
                        Platform Settings
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage global system configurations and feature flags.</p>
                </div>
                <Button onClick={handleSave} isLoading={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                </Button>
            </div>

            <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Feature Flags</h2>
                
                <div className="space-y-6">
                    {/* WhatsApp Feature Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-700">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                                <MessageCircle size={24} />
                            </div>
                            <div>
                                <h3 className="text-md font-semibold text-gray-900 dark:text-white">Enable WhatsApp Notifications</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Master kill-switch for all WhatsApp integration. Disabling this will hide the feature across all Gyms and stop all outgoing automated WhatsApp messages.
                                </p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={settings?.whatsappFeatureEnabled || false}
                                onChange={(e) => setSettings({ ...settings, whatsappFeatureEnabled: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"></div>
                        </label>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default SystemSettings;
