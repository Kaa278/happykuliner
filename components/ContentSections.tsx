"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import LocationModal from "./LocationModal";
import { supabase } from "@/lib/supabase";

export default function ContentSections() {
    const [activeSlide, setActiveSlide] = useState(0);
    const [selectedLocation, setSelectedLocation] = useState<any>(null);
    const [locations, setLocations] = useState<any[]>([]);
    const [qrisImage, setQrisImage] = useState<string | null>(null);
    const [showQrisModal, setShowQrisModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            // Fetch Locations
            const { data: locData } = await supabase
                .from("gallery")
                .select("*")
                .order("created_at", { ascending: false });

            if (locData) setLocations(locData);

            // Fetch QRIS Image
            const { data: qrisData } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'qris_image_url')
                .single();

            if (qrisData) {
                // Remove double quotes if stored as JSON string
                const url = typeof qrisData.value === 'string' ? qrisData.value.replace(/"/g, '') : qrisData.value;
                setQrisImage(url);
            }

            setLoading(false);
        };

        fetchData();
    }, []);

    const fadeInUp: any = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" },
        },
    };

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollLeft = container.scrollLeft;
            const cardWidth =
                container.firstElementChild?.firstElementChild?.clientWidth || 300;
            const gap = 24;
            const index = Math.round(scrollLeft / (cardWidth + gap));
            setActiveSlide(index);
        }
    };

    const scrollToSlide = (index: number) => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const cardWidth =
                container.firstElementChild?.firstElementChild?.clientWidth || 300;
            const gap = 24;

            container.scrollTo({
                left: index * (cardWidth + gap),
                behavior: "smooth",
            });
        }
    };

    // Mouse Drag Handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartX(e.pageX - (scrollContainerRef.current?.offsetLeft || 0));
        setScrollLeft(scrollContainerRef.current?.scrollLeft || 0);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - (scrollContainerRef.current?.offsetLeft || 0);
        const walk = (x - startX) * 2; // Scroll-fast
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollLeft - walk;
        }
    };

    return (

        <div className="relative z-20 -mt-[40vh]">
            {/* Gradient Fade Transition */}
            <div className="h-[40vh] bg-gradient-to-b from-transparent to-white pointer-events-none" />

            <div className="bg-white text-black relative z-20">
                <div className="py-20 px-6 max-w-7xl mx-auto space-y-32">

                    {/* ======================= */}
                    {/* Jejak Kami */}
                    {/* ======================= */}
                    <section id="jejak-kami" className="relative">
                        <motion.h2
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={fadeInUp}
                            className="text-4xl md:text-5xl font-bold mb-12 text-center uppercase tracking-wider"
                        >
                            Jejak Kami<span className="text-brand-red">.</span>
                        </motion.h2>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            variants={fadeInUp}
                            ref={scrollContainerRef}
                            onScroll={handleScroll}
                            onMouseDown={handleMouseDown}
                            onMouseLeave={handleMouseLeave}
                            onMouseUp={handleMouseUp}
                            onMouseMove={handleMouseMove}
                            className={`overflow-x-auto pb-8 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-hide snap-x snap-mandatory flex gap-6 ${isDragging ? 'cursor-grabbing snap-none' : 'cursor-grab'}`}
                        >
                            {loading ? (
                                <div className="text-center text-gray-500 py-12 w-full">
                                    Loading Jejak Kami...
                                </div>
                            ) : (
                                <>
                                    {locations.map((loc, index) => (
                                        <motion.div
                                            key={loc.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            whileHover={{ y: -10 }}
                                            onClick={() => !isDragging && setSelectedLocation(loc)}
                                            className="min-w-[320px] md:min-w-[380px] bg-white rounded-[2.5rem] p-4 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-black/5 cursor-pointer group relative hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] transition-all duration-500 snap-center first:ml-0 last:mr-6"
                                        >
                                            {/* Image Container */}
                                            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-gray-100">
                                                {(loc.images?.[0] || loc.image_url || loc.image || loc.url) && (
                                                    <img
                                                        src={loc.images?.[0] || loc.image_url || loc.image || loc.url}
                                                        alt={loc.city}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                                        draggable="false"
                                                    />
                                                )}

                                                {/* Overlay Gradient (Subtle) */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            </div>

                                            {/* Content Below Image */}
                                            <div className="pt-6 pb-4 px-2">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="text-2xl font-black uppercase text-deep-black tracking-tight group-hover:text-brand-red transition-colors">
                                                        {loc.city}
                                                    </h3>
                                                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-brand-yellow group-hover:text-deep-black transition-colors duration-300">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="-rotate-45 group-hover:rotate-0 transition-transform duration-300"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-2 text-gray-500">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-1 shrink-0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                                                    <p className="text-sm font-medium line-clamp-2 leading-relaxed">
                                                        {loc.address}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {/* Spacer to fix cut-off shadow at the end */}
                                    <div className="min-w-[1px] h-full" />
                                </>
                            )}
                        </motion.div>

                        <div className="flex flex-col items-center gap-6 mt-8">
                            {/* Pagination Dots */}
                            {locations.length > 0 && (
                                <div className="flex justify-center gap-3">
                                    {locations.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => scrollToSlide(index)}
                                            className={`h-2 rounded-full transition-all duration-300 ${activeSlide === index
                                                ? "w-8 bg-brand-yellow"
                                                : "w-2 bg-black/20 hover:bg-black/40"
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}


                        </div>
                    </section>

                    {/* QRIS */}
                    <motion.section
                        id="qris"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="min-h-[50vh] flex items-center justify-center border-t border-black/10"
                    >
                        <div className="text-center">
                            <h2 className="text-4xl md:text-5xl font-bold mb-8 uppercase tracking-wider">
                                QRIS<span className="text-brand-red">.</span>
                            </h2>

                            {qrisImage ? (
                                <div className="bg-white p-8 rounded-[2rem] shadow-2xl border border-gray-100 max-w-sm mx-auto transform hover:-translate-y-2 transition-transform duration-300">
                                    <div className="bg-gray-50 p-4 rounded-3xl mb-6">
                                        <img
                                            src={qrisImage}
                                            alt="Scan QRIS"
                                            className="w-full h-auto rounded-2xl mix-blend-multiply"
                                        />
                                    </div>

                                    <h3 className="text-xl font-bold mb-2">Scan & Bayar</h3>
                                    <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                                        Gunakan aplikasi e-wallet atau banking favoritmu untuk membayar.
                                    </p>

                                    <button
                                        onClick={() => setShowQrisModal(true)}
                                        className="w-full py-3 px-6 bg-deep-black text-white rounded-xl font-bold uppercase tracking-wide hover:bg-brand-red transition-colors flex items-center justify-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /></svg>
                                        Buka QRIS Full
                                    </button>
                                </div>
                            ) : (
                                <p className="text-gray-600">
                                    Scan untuk Pembayaran Mudah.
                                </p>
                            )}
                        </div>
                    </motion.section>

                    {/* Tentang */}
                    {/* Tentang */}
                    <motion.section
                        id="tentang"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="min-h-[60vh] flex flex-col items-center justify-center border-t border-black/5 py-32 bg-gradient-to-b from-white to-gray-50/50"
                    >
                        <div className="text-center max-w-4xl mx-auto px-6">

                            {/* Main Title: TENTANG KAMI */}
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-deep-black mb-12">
                                Tentang Kami<span className="text-brand-red">.</span>
                            </h2>

                            {/* Editorial Card */}
                            <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-black/5 relative overflow-hidden">
                                {/* Subtle Background Element */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                                {/* Body Text - User Provided */}
                                <div className="relative z-10 max-w-3xl mx-auto space-y-8 text-lg md:text-xl text-gray-600 leading-relaxed font-light">
                                    <p className="font-medium text-deep-black text-2xl">
                                        "Jujur, kita percaya kalau makanan enak itu nggak perlu ribet."
                                    </p>
                                    <p>
                                        Happy Kuliner lahir dari sesederhana pengen bagi-bagi kebahagiaan lewat makanan yang "ngena" di lidah. Kita bukan sekadar jualan, tapi pengen jadi bagian dari momen seru kamu pas lagi muter-muter di pasar malam atau hunting kuliner di event.
                                    </p>
                                    <p>
                                        Dari satu kota ke kota lain, misi kita cuma satu: bikin kamu senyum pas suapan pertama, dan kangen pas suapan terakhir. <span className="font-serif italic text-deep-black">Sampai ketemu di depan booth ya!</span>
                                    </p>
                                </div>

                                {/* Highlights */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 border-t border-gray-100 pt-12">
                                    <div className="text-center space-y-2">
                                        <h4 className="font-bold text-deep-black uppercase tracking-wider text-sm">Resep Autentik</h4>
                                        <p className="text-sm text-gray-500">Cita rasa yang jujur dan konsisten di setiap gigitan.</p>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h4 className="font-bold text-deep-black uppercase tracking-wider text-sm">Bahan Pilihan</h4>
                                        <p className="text-sm text-gray-500">Dipilih langsung setiap hari demi kualitas terbaik.</p>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h4 className="font-bold text-deep-black uppercase tracking-wider text-sm">Suasana Hangat</h4>
                                        <p className="text-sm text-gray-500">Lebih dari sekadar makan, ini tentang kenyamanan.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Location Section (Subtle) */}
                            <div className="mt-16 opacity-80 hover:opacity-100 transition-opacity duration-300">
                                <div className="inline-flex flex-col items-center">
                                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Lokasi Kami</span>
                                    <p className="text-gray-600 text-base md:text-lg mb-4 max-w-lg mx-auto leading-relaxed">
                                        Jengglong RT 06 RW 12, Waru, Kebakkramat,<br className="hidden md:block" /> Karanganyar, Jawa Tengah, Indonesia
                                    </p>
                                    <a
                                        href="https://maps.google.com/?q=Jengglong+RT+06+RW+12,+Waru,+Kebakkramat,+Karanganyar,+Jawa+Tengah,+Indonesia"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-gray-200 text-sm font-bold shadow-sm hover:shadow-md hover:border-brand-yellow/50 transition-all group"
                                    >
                                        <span className="group-hover:text-brand-red transition-colors">Lihat di Google Maps</span>
                                        <svg className="w-4 h-4 text-gray-400 group-hover:text-brand-yellow transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.section>
                </div>


            </div>

            {
                selectedLocation && (
                    <LocationModal
                        location={selectedLocation}
                        onClose={() => setSelectedLocation(null)}
                    />
                )
            }

            {/* QRIS Modal */}
            {showQrisModal && qrisImage && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={() => setShowQrisModal(false)}
                >
                    <div
                        className="relative bg-white p-4 rounded-3xl max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowQrisModal(false)}
                            className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors z-10"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>
                        </button>

                        <div className="text-center mb-4 mt-2">
                            <h3 className="text-xl font-bold uppercase tracking-wider">Scan Payment</h3>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-2">
                            <img
                                src={qrisImage}
                                alt="QRIS Full"
                                className="w-full h-auto rounded-xl"
                            />
                        </div>

                        <div className="text-center mt-6 mb-2">
                            <p className="text-sm text-gray-500">Happy Kuliner Official QRIS</p>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
