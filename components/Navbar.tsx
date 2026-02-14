"use client";

import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { Menu, X } from "lucide-react";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [logoClickCount, setLogoClickCount] = useState(0);
    const { scrollY } = useScroll();
    const router = useRouter();

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 50);
    });

    // Secret Login Logic
    const handleLogoClick = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent default navigation
        setLogoClickCount((prev) => {
            const newCount = prev + 1;
            if (newCount === 5) {
                router.push("/admin");
                return 0;
            }
            return newCount;
        });
    };

    // Reset click count after 3 seconds of inactivity
    useEffect(() => {
        if (logoClickCount > 0) {
            const timer = setTimeout(() => setLogoClickCount(0), 3000);
            return () => clearTimeout(timer);
        }
    }, [logoClickCount]);

    const navLinks = [
        { name: "Beranda", href: "top" },
        { name: "Jejak Kami", href: "#jejak-kami" },
        { name: "QRIS", href: "#qris" },
        { name: "Tentang", href: "#tentang" },
    ];

    const handleScroll = (href: string) => {
        setIsMobileMenuOpen(false);
        if (href === "top") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            const element = document.querySelector(href);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        }
    };

    return (
        <>
            <motion.nav
                className={clsx(
                    "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300",
                    isScrolled ? "bg-black/80 backdrop-blur-md shadow-lg" : "bg-gradient-to-b from-black/70 to-transparent"
                )}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: "circOut" }}
            >
                {/* Brand / Secret Login Trigger */}
                <div onClick={handleLogoClick} className="cursor-pointer select-none group">
                    <div className="flex items-center gap-2">
                        <img src="/happy-kuliner-logo.svg" alt="Happy Kuliner" className="h-10 w-auto group-hover:scale-105 transition-transform" />
                    </div>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => handleScroll(item.href)}
                            className="text-sm font-medium text-white/80 hover:text-brand-yellow transition-colors cursor-pointer"
                        >
                            {item.name}
                        </button>
                    ))}
                    <button className="px-6 py-3 bg-brand-yellow text-black font-bold rounded-full hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] transform hover:scale-105 active:scale-95 cursor-pointer">
                        Gabung Mitra
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-white p-2"
                    >
                        {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-black/95 flex flex-col items-center justify-center gap-8 md:hidden"
                    >
                        {navLinks.map((item, index) => (
                            <motion.button
                                key={item.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => handleScroll(item.href)}
                                className="text-2xl font-bold text-white hover:text-brand-yellow transition-colors"
                            >
                                {item.name}
                            </motion.button>
                        ))}
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="px-8 py-4 bg-brand-yellow text-black font-bold text-xl rounded-full hover:bg-white transition-all shadow-[0_0_20px_rgba(255,215,0,0.4)] mt-4"
                        >
                            Gabung Mitra
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
