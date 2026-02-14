"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Upload, Save, Loader2 } from "lucide-react";

export default function QrisPage() {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchQrisSettings();
    }, []);

    const fetchQrisSettings = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'qris_image_url')
            .single();

        if (data) {
            // Remove double quotes if stored as JSON string
            const url = typeof data.value === 'string' ? data.value.replace(/"/g, '') : data.value;
            setImageUrl(url);
        }
        setLoading(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            // Preview
            setImageUrl(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setMessage(null);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `qris-${Date.now()}.${fileExt}`;
            const filePath = `settings/${fileName}`;

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('gallery')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('gallery')
                .getPublicUrl(filePath);

            // 3. Update site_settings
            const { error: dbError } = await supabase
                .from('site_settings')
                .upsert({
                    key: 'qris_image_url',
                    value: JSON.stringify(publicUrl),
                    updated_at: new Date().toISOString()
                });

            if (dbError) throw dbError;

            setMessage({ type: 'success', text: 'QRIS image updated successfully!' });
            setFile(null); // Reset file input
            fetchQrisSettings(); // Refresh
        } catch (error: any) {
            console.error('Error uploading:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to update QRIS.' });
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="p-8 text-white">Loading settings...</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 uppercase tracking-wider">
                Manage QRIS<span className="text-brand-red">.</span>
            </h1>

            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-8">
                <div className="mb-8 flex justify-center">
                    {imageUrl ? (
                        <div className="relative group">
                            <img
                                src={imageUrl}
                                alt="Current QRIS"
                                className="w-[300px] h-auto rounded-xl border-2 border-dashed border-white/20 p-2"
                            />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                <p className="text-sm font-medium">Current Display</p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-[300px] h-[300px] bg-white/5 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center text-gray-500">
                            No QRIS Image Set
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Upload New QRIS Image
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="flex items-center gap-4 p-4 border border-white/10 rounded-xl bg-black/20 hover:bg-black/40 transition-colors">
                                <div className="p-3 bg-brand-yellow/10 rounded-lg text-brand-yellow">
                                    <Upload size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-white">
                                        {file ? file.name : "Click to select image"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Supports JPG, PNG, WEBP
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${!file || uploading
                                ? "bg-white/5 text-gray-500 cursor-not-allowed"
                                : "bg-brand-yellow text-black hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                            }`}
                    >
                        {uploading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Updating...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
