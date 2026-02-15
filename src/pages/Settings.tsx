import { useEffect, useState } from 'react';
import {
    Save, Globe, Mail, Phone, CreditCard, Shield, Loader2
} from 'lucide-react';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import toast from 'react-hot-toast';

const Settings = () => {
    const axiosPrivate = useAxiosPrivate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        siteName: '',
        supportEmail: '',
        supportPhone: '',
        currency: 'INR',
        taxRate: 18
    });

    // 1. Fetch Current Settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axiosPrivate.get('/settings');
                setFormData(response.data.data);
            } catch (error) {
                toast.error("Failed to load settings");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    // 2. Handle Change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 3. Submit Updates
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Ensure tax is a number
            const payload = { ...formData, taxRate: Number(formData.taxRate) };
            await axiosPrivate.patch('/settings', payload);
            toast.success("System settings updated successfully! ⚙️");
        } catch (error) {
            toast.error("Failed to update settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-dd-orange animate-pulse">Loading Configuration...</div>;

    return (
        <div className="max-w-4xl space-y-6 pb-10">
            <div>
                <h2 className="text-3xl font-bold text-white">System Settings</h2>
                <p className="text-dd-text-muted mt-1">Manage global configurations for DD Tours.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* 1. GENERAL SETTINGS */}
                <div className="bg-dd-card border border-gray-800 rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2 flex items-center gap-2">
                        <Globe size={18} className="text-blue-400" /> General Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-dd-text-muted mb-1">Site Name</label>
                            <input
                                name="siteName"
                                value={formData.siteName}
                                onChange={handleChange}
                                className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 text-white focus:border-dd-orange outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-dd-text-muted mb-1">Currency</label>
                            <input
                                name="currency"
                                value={formData.currency}
                                onChange={handleChange}
                                className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 text-white focus:border-dd-orange outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. CONTACT INFO (Used in Invoices) */}
                <div className="bg-dd-card border border-gray-800 rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2 flex items-center gap-2">
                        <Mail size={18} className="text-green-400" /> Support Contact
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-dd-text-muted mb-1">Support Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-gray-500" size={16}/>
                                <input
                                    name="supportEmail"
                                    value={formData.supportEmail}
                                    onChange={handleChange}
                                    className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 pl-10 text-white focus:border-dd-orange outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-dd-text-muted mb-1">Support Phone</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 text-gray-500" size={16}/>
                                <input
                                    name="supportPhone"
                                    value={formData.supportPhone}
                                    onChange={handleChange}
                                    className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 pl-10 text-white focus:border-dd-orange outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. FINANCE SETTINGS */}
                <div className="bg-dd-card border border-gray-800 rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2 flex items-center gap-2">
                        <CreditCard size={18} className="text-purple-400" /> Finance & Tax
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-dd-text-muted mb-1">Tax Rate (GST %)</label>
                            <input
                                type="number"
                                name="taxRate"
                                value={formData.taxRate}
                                onChange={handleChange}
                                className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 text-white focus:border-dd-orange outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* 4. SECURITY (Placeholder for now) */}
                <div className="bg-dd-card border border-gray-800 rounded-xl p-6 space-y-4 opacity-50">
                    <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2 flex items-center gap-2">
                        <Shield size={18} className="text-red-400" /> Security (Coming Soon)
                    </h3>
                    <p className="text-sm text-gray-500">Admin password reset and 2FA settings will be available in v2.0.</p>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-gradient-to-r from-dd-orange to-dd-red text-white px-8 py-3 rounded-xl font-bold text-lg flex items-center gap-2 hover:shadow-lg hover:shadow-dd-orange/20 transition-all disabled:opacity-50"
                    >
                        {saving ? <><Loader2 className="animate-spin" /> Saving...</> : <><Save size={20} /> Save Changes</>}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default Settings;