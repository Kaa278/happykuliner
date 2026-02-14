"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Trash2, Upload, Plus, MapPin, Link as LinkIcon, Edit, X, Save, Loader2 } from "lucide-react";

type JejakKamiItem = {
    id: string;
    images: string[];
    city: string;
    address: string;
    maps_link: string;
};

export default function JejakKamiManagement() {
    const [items, setItems] = useState<JejakKamiItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [form, setForm] = useState<Partial<JejakKamiItem>>({ images: [] });
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    // Fetch Items
    const fetchItems = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
        if (data) setItems(data as any);
        setLoading(false);
    };

    useEffect(() => {
        fetchItems();
    }, []);

    // Handle Image Selection
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setImageFiles(prev => [...prev, ...newFiles]);

            // Generate previews for new files
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newPreviews]);
        }
    };

    // Remove Image from selection
    const removeImage = (index: number, isExisting: boolean) => {
        if (isExisting) {
            const newImages = form.images ? [...form.images] : [];
            newImages.splice(index, 1);
            setForm({ ...form, images: newImages });
        } else {
            setImageFiles(prev => prev.filter((_, i) => i !== index));
            setPreviewUrls(prev => {
                URL.revokeObjectURL(prev[index]);
                return prev.filter((_, i) => i !== index);
            });
        }
    };

    // Handle Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.city || !form.address) return alert("City and Address are required.");
        if ((!form.images || form.images.length === 0) && imageFiles.length === 0) return alert("At least one image is required.");

        setUploading(true);
        let finalImageUrls = form.images ? [...form.images] : [];

        // Upload New Images
        for (const file of imageFiles) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage.from('gallery').upload(filePath, file);
            if (uploadError) {
                alert('Upload Error for ' + file.name + ': ' + uploadError.message);
                continue;
            }

            const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(filePath);
            finalImageUrls.push(publicUrl);
        }

        const payload = {
            city: form.city,
            address: form.address,
            maps_link: form.maps_link,
            images: finalImageUrls,
        };

        let error;
        if (form.id) {
            const { error: updateError } = await supabase.from('gallery').update(payload).eq('id', form.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase.from('gallery').insert([payload]);
            error = insertError;
        }

        if (error) {
            alert("Database Error: " + error.message);
        } else {
            closeModal();
            fetchItems();
        }
        setUploading(false);
    };

    // Handle Delete Item
    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const { error } = await supabase.from('gallery').delete().eq('id', id);
        if (error) alert(error.message);
        else fetchItems();
    };

    // Open Modal for New Item
    const openNewModal = () => {
        setForm({ images: [] });
        setImageFiles([]);
        setPreviewUrls([]);
        setIsModalOpen(true);
    };

    // Open Modal for Edit
    const openEditModal = (item: JejakKamiItem) => {
        setForm(item);
        setImageFiles([]);
        setPreviewUrls([]);
        setIsModalOpen(true);
    };

    // Close Modal
    const closeModal = () => {
        setIsModalOpen(false);
        setForm({ images: [] });
        setImageFiles([]);
        setPreviewUrls([]);
    };

    return (
        <div>
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold uppercase tracking-wider">Jejak Kami Management</h1>
                    <p className="text-gray-400 mt-2">Manage locations and photos.</p>
                </div>
                <button
                    onClick={openNewModal}
                    className="flex items-center gap-2 px-6 py-3 bg-brand-yellow text-black font-bold rounded-xl hover:bg-white transition-all transform hover:scale-105 shadow-lg shadow-brand-yellow/20"
                >
                    <Plus size={20} />
                    Add New Item
                </button>
            </header>

            {/* List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                    <div key={item.id} className="group relative rounded-3xl overflow-hidden aspect-[4/5] bg-neutral-900 border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                        {/* Image */}
                        <div className="h-1/2 w-full overflow-hidden relative">
                            {item.images && item.images.length > 0 ? (
                                <img
                                    src={item.images[0]}
                                    alt={item.city}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-gray-600">No Image</div>
                            )}

                            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1 border border-white/10">
                                <span>{item.images ? item.images.length : 0} Photos</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex flex-col h-1/2">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-white uppercase tracking-tight">{item.city}</h3>
                            </div>
                            <p className="text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed">{item.address}</p>

                            {item.maps_link && (
                                <a href={item.maps_link} target="_blank" className="text-xs text-brand-yellow hover:text-white transition-colors flex items-center gap-1 mb-auto">
                                    <MapPin size={12} /> Open in Maps
                                </a>
                            )}

                            <div className="flex gap-3 pt-4 border-t border-white/5 mt-4">
                                <button
                                    onClick={() => openEditModal(item)}
                                    className="flex-1 py-2.5 rounded-xl bg-white/5 text-white hover:bg-white/10 text-sm font-medium transition-colors border border-white/5 flex items-center justify-center gap-2"
                                >
                                    <Edit size={16} /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="px-4 py-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors border border-red-500/10 flex items-center justify-center"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {items.length === 0 && !loading && (
                <div className="py-20 text-center text-gray-500 border-2 border-dashed border-white/10 rounded-3xl bg-neutral-900/50">
                    <p className="text-lg mb-2">No locations found.</p>
                    <button onClick={openNewModal} className="text-brand-yellow hover:underline">Create your first location</button>
                </div>
            )}

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-neutral-900 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>

                        {/* Modal Header */}
                        <div className="sticky top-0 z-10 bg-neutral-900/95 backdrop-blur-md border-b border-white/10 p-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white uppercase flex items-center gap-2">
                                {form.id ? <Edit size={20} className="text-brand-yellow" /> : <Plus size={20} className="text-brand-yellow" />}
                                {form.id ? "Edit Location" : "Add Location"}
                            </h2>
                            <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Image Upload */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-400 mb-3">Location Photos</label>

                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-4">
                                        {/* Existing Images */}
                                        {form.images?.map((url, idx) => (
                                            <div key={`existing-${idx}`} className="relative group aspect-square">
                                                <img src={url} className="w-full h-full object-cover rounded-xl border border-white/10" alt="Existing" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(idx, true)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}

                                        {/* New Previews */}
                                        {previewUrls.map((url, idx) => (
                                            <div key={`preview-${idx}`} className="relative group aspect-square">
                                                <img src={url} className="w-full h-full object-cover rounded-xl border border-brand-yellow/50" alt="New Preview" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(idx, false)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg transition-all hover:scale-110"
                                                >
                                                    <X size={12} />
                                                </button>
                                                <div className="absolute inset-0 bg-black/20 rounded-xl pointer-events-none flex items-center justify-center">
                                                    <span className="bg-black/50 text-[10px] px-2 py-0.5 rounded text-white font-bold">NEW</span>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Upload Button */}
                                        <label className="cursor-pointer aspect-square bg-neutral-800 hover:bg-neutral-700 border-2 border-dashed border-white/10 hover:border-brand-yellow/50 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-white transition-all group">
                                            <div className="p-3 rounded-full bg-white/5 group-hover:bg-brand-yellow/20 text-gray-400 group-hover:text-brand-yellow transition-colors">
                                                <Upload size={20} />
                                            </div>
                                            <span className="text-xs font-bold uppercase">Add Photo</span>
                                            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
                                        </label>
                                    </div>
                                </div>

                                {/* Fields */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-400 mb-2">City Name</label>
                                    <input
                                        type="text"
                                        value={form.city || ""}
                                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                                        className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-yellow/50 transition-colors placeholder:text-neutral-600"
                                        placeholder="e.g. Jakarta Selatan"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Google Maps Link</label>
                                    <div className="relative">
                                        <LinkIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input
                                            type="url"
                                            value={form.maps_link || ""}
                                            onChange={(e) => setForm({ ...form, maps_link: e.target.value })}
                                            className="w-full bg-neutral-800 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-brand-yellow/50 transition-colors placeholder:text-neutral-600"
                                            placeholder="https://maps.google.com/..."
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Full Address</label>
                                    <textarea
                                        value={form.address || ""}
                                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                                        className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-yellow/50 transition-colors h-32 resize-none placeholder:text-neutral-600"
                                        placeholder="Complete address details..."
                                        required
                                    />
                                </div>

                                {/* Modal Actions */}
                                <div className="md:col-span-2 flex justify-end gap-3 pt-6 border-t border-white/10 mt-2">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-6 py-3 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="px-8 py-3 bg-brand-yellow text-black font-bold rounded-xl hover:bg-white transition-all transform hover:scale-[1.02] disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {uploading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                        {uploading ? "Saving..." : (form.id ? "Update Location" : "Save Location")}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
