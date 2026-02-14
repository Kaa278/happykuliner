"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";

interface Location {
    id: string;
    city: string;
    address: string;
    // status: string; // Removed status
    maps_link?: string;
    images?: string[];
}

interface LocationModalProps {
    location: Location | null;
    onClose: () => void;
}

export default function LocationModal({ location, onClose }: LocationModalProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!location) return null;

    const images = location.images && location.images.length > 0
        ? location.images
        : [];

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (images.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (images.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-neutral-900 border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col md:flex-col"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors border border-white/10"
                    >
                        ✕
                    </button>

                    {/* Image Slider Section - Adaptive Height */}
                    <div className="relative w-full bg-black flex items-center justify-center bg-neutral-900">
                        {images.length > 0 ? (
                            <div className="relative w-full max-h-[60vh] flex items-center justify-center">
                                <img
                                    src={images[currentImageIndex]}
                                    alt={`${location.city} - ${currentImageIndex + 1}`}
                                    className="w-full h-auto max-h-[60vh] object-contain"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-transparent to-transparent opacity-60 pointer-events-none" />

                                {/* Navigation Arrows */}
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors border border-white/10 z-10"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors border border-white/10 z-10"
                                        >
                                            <ChevronRight size={20} />
                                        </button>

                                        {/* Dots Indicator */}
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                            {images.map((_, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`w-2 h-2 rounded-full transition-all shadow-sm ${idx === currentImageIndex ? "bg-brand-yellow w-4" : "bg-white/50"}`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="w-full h-64 flex items-center justify-center text-gray-600 bg-neutral-900">
                                <span className="text-4xl text-neutral-800 font-bold uppercase">{location.city.substring(0, 3)}</span>
                            </div>
                        )}
                    </div>

                    {/* Content Section - Bottom Half */}
                    <div className="p-8 md:p-10 flex flex-col bg-neutral-900">
                        <div className="flex items-start justify-between mb-4">
                            <h2 className="text-3xl md:text-4xl font-black uppercase text-white tracking-tighter leading-none">
                                {location.city}
                            </h2>
                        </div>

                        <p className="text-gray-400 text-base md:text-lg leading-relaxed mb-8">
                            {location.address}
                        </p>

                        <div className="flex gap-4 mt-auto">
                            <a
                                href={location.maps_link || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex-1 flex items-center justify-center py-4 bg-brand-red text-white font-bold uppercase tracking-wider rounded-xl hover:bg-brand-red/90 transition-colors shadow-lg shadow-brand-red/20 ${!location.maps_link && 'opacity-50 pointer-events-none'}`}
                            >
                                <MapPin size={18} className="mr-2" />
                                Get Directions
                            </a>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
