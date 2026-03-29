import React, { useState, useEffect } from 'react';
import { Save, MessageCircle, Mail, Smartphone, BellRing } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useNotification } from '../../hooks/useNotification';
import * as notificationService from '../../services/notificationService';
import { getSystemSettings } from '../../services/systemSettingsService';

const NotificationSettings = () => {
    const { success, error } = useNotification();
    const [settings, setSettings] = useState(null);
    const [templates, setTemplates] = useState([]);
    const [systemSettings, setSystemSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const availableEvents = [
        { id: 'welcome', label: 'Welcome Message' },
        { id: 'subscription_purchased', label: 'Subscription Purchased' },
        { id: 'membership_expiry_warning', label: 'Membership Expiry Warning' },
        { id: 'membership_expired', label: 'Membership Expired' },
        { id: 'payment_reminder', label: 'Payment Reminder' },
        { id: 'payment_received', label: 'Payment Received' },
        { id: 'birthday', label: 'Birthday Greeting' },
        { id: 'class_reminder', label: 'Class Reminder' },
        { id: 'otp', label: 'OTP' },
        { id: 'announcement', label: 'Announcement' },
        { id: 'general', label: 'General' }
    ];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [settingsData, templatesData, sysSettings] = await Promise.all([
                notificationService.getSettings(),
                notificationService.getTemplates(),
                getSystemSettings()
            ]);
            setSettings(settingsData);
            setTemplates(templatesData || []);
            setSystemSettings(sysSettings);
        } catch (err) {
            console.error('Failed to load notification configurations:', err);
            error('Failed to load notification settings.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleEventChannel = (eventId, channel) => {
        if (!settings) return;

        setSettings(prev => {
            const types = { ...prev.notificationTypes };
            if (!types[eventId]) {
                types[eventId] = { email: false, sms: false, inApp: false, whatsapp: false };
            }
            types[eventId][channel] = !types[eventId][channel];
            return { ...prev, notificationTypes: types };
        });
    };

    const handleTemplateChange = (eventId, channel, value) => {
        setTemplates(prev => {
            const newTemplates = [...prev];
            const tIndex = newTemplates.findIndex(t => t.type === eventId);
            
            if (tIndex >= 0) {
                // Template exists, update it
                const updatedTemplate = { ...newTemplates[tIndex] };
                if (!updatedTemplate[channel]) updatedTemplate[channel] = {};
                
                if (channel === 'whatsapp') {
                    updatedTemplate.whatsapp.body = value;
                } else if (channel === 'email') {
                    updatedTemplate.email.body = value;
                } else if (channel === 'sms') {
                    updatedTemplate.sms.body = value;
                }
                
                newTemplates[tIndex] = updatedTemplate;
            } else {
                // Template does not exist, create a stub
                const newTpl = { type: eventId, name: eventId, isActive: true };
                newTpl[channel] = { body: value };
                if (channel === 'email') newTpl.email.subject = 'Notification';
                newTemplates.push(newTpl);
            }
            return newTemplates;
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Save settings
            await notificationService.updateSettings({
                channels: settings.channels,
                notificationTypes: settings.notificationTypes
            });

            // Save templates
            for (const template of templates) {
                // Mark active channels array
                const activeChannels = [];
                if (template.email?.body) activeChannels.push('email');
                if (template.sms?.body) activeChannels.push('sms');
                if (template.inApp?.body) activeChannels.push('inApp');
                if (template.whatsapp?.body) activeChannels.push('whatsapp');
                
                template.channels = activeChannels;

                try {
                    await notificationService.saveTemplate(template);
                } catch (e) {
                    console.error("Failed to save template", template.type, e);
                }
            }

            success('Notification settings saved successfully!');
        } catch (err) {
            console.error(err);
            error('Failed to save settings.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!settings) {
        return <div>Failed to load settings.</div>;
    }

    const whatsappAllowedEvents = settings.channels?.whatsapp?.allowedEvents || [];
    const smsAllowedEvents = settings.channels?.sms?.allowedEvents || [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notification Settings</h1>
                <p className="text-gray-500 dark:text-gray-400">Configure automated messages, alerts, and templates.</p>
            </div>

            <div className="flex justify-end mb-4">
                <Button onClick={handleSave} isLoading={isSaving} disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {availableEvents.map(event => {
                    const isWhatsAppAllowed = whatsappAllowedEvents.includes(event.id);
                    const isSmsAllowed = smsAllowedEvents.includes(event.id);
                    const eventConfig = settings.notificationTypes?.[event.id] || {};
                    const isWhatsAppEnabled = !!eventConfig.whatsapp;
                    const isSmsEnabled = !!eventConfig.sms;
                    const eventTemplate = templates.find(t => t.type === event.id) || {};
                    
                    return (
                        <Card key={event.id} className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{event.label}</h3>
                            
                            {/* Warning if WhatsApp is not allowed by Super Admin */}
                            {systemSettings?.whatsappFeatureEnabled && !isWhatsAppAllowed && (
                                <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 p-3 rounded text-sm text-[13px]">
                                    WhatsApp notifications for this event are currently disabled by the Super Admin.
                                </div>
                            )}

                            <div className="space-y-4">
                                {/* WhatsApp Toggle & Template */}
                                {systemSettings?.whatsappFeatureEnabled && (
                                    <div className={`border rounded-lg p-4 ${isWhatsAppAllowed ? 'border-gray-200 dark:border-slate-700' : 'border-gray-100 bg-gray-50 dark:border-slate-800 dark:bg-slate-800/50 opacity-70'}`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <MessageCircle className="w-5 h-5 text-green-500" />
                                                <span className="font-medium text-gray-900 dark:text-white">WhatsApp</span>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only peer" 
                                                    checked={isWhatsAppEnabled}
                                                    disabled={!isWhatsAppAllowed}
                                                    onChange={() => handleToggleEventChannel(event.id, 'whatsapp')}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"></div>
                                            </label>
                                        </div>
                                        
                                        {isWhatsAppEnabled && (
                                            <div className="mt-3">
                                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Message Template</label>
                                                <textarea 
                                                    className="w-full text-sm rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-2 min-h-[80px]"
                                                    placeholder="Hello {{memberName}}..."
                                                    value={eventTemplate.whatsapp?.body || ''}
                                                    onChange={(e) => handleTemplateChange(event.id, 'whatsapp', e.target.value)}
                                                    disabled={!isWhatsAppAllowed}
                                                />
                                                <p className="text-[11px] text-gray-400 mt-1">Available variables: {'{{memberName}}'}, {'{{gymName}}'}...</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* SMS Toggle & Template */}
                                <div className={`border rounded-lg p-4 ${isSmsAllowed ? 'border-gray-200 dark:border-slate-700' : 'border-gray-100 bg-gray-50 dark:border-slate-800 dark:bg-slate-800/50 opacity-70'}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="w-5 h-5 text-blue-500" />
                                            <span className="font-medium text-gray-900 dark:text-white">SMS Alerts</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer" 
                                                checked={isSmsEnabled}
                                                disabled={!isSmsAllowed}
                                                onChange={() => handleToggleEventChannel(event.id, 'sms')}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
                                        </label>
                                    </div>
                                    
                                    {!isSmsAllowed && (
                                        <div className="mb-3 text-red-500 text-xs font-semibold">
                                            SMS capability disabled by Super Admin for this event.
                                        </div>
                                    )}
                                    
                                    {isSmsEnabled && (
                                        <div className="mt-3">
                                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">SMS Message Template</label>
                                            <textarea 
                                                className="w-full text-sm rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-2 min-h-[80px]"
                                                placeholder="Hello {{memberName}}..."
                                                value={eventTemplate.sms?.body || ''}
                                                onChange={(e) => handleTemplateChange(event.id, 'sms', e.target.value)}
                                                disabled={!isSmsAllowed}
                                            />
                                            <p className="text-[11px] text-gray-400 mt-1">Available variables: {'{{memberName}}'}, {'{{gymName}}'}, {'{{amountDue}}'}...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default NotificationSettings;
