"use client";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 50);
    });

    return (
        <motion.nav
            className={clsx(
                "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300",
                "bg-gradient-to-b from-black/70 to-transparent"
            )}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: "circOut" }}
        >
            {/* Brand */}
            <Link href="/admin" className="text-2xl font-bold tracking-tighter text-white uppercase">
                Happy Kuliner<span className="text-brand-red">.</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
                {[
                    { name: "Beranda", href: "top" },
                    { name: "Jejak Kami", href: "#jejak-kami" },
                    { name: "QRIS", href: "#qris" },
                    { name: "Tentang", href: "#tentang" },
                ].map((item) => (
                    <button
                        key={item.name}
                        onClick={() => {
                            const element = item.href === "top" ? document.body : document.querySelector(item.href);
                            if (element) {
                                element.scrollIntoView({ behavior: "smooth" });
                            }
                        }}
                        className="text-sm font-medium text-white/80 hover:text-brand-yellow transition-colors cursor-pointer"
                    >
                        {item.name}
                    </button>
                ))}
                <button className="px-6 py-3 bg-brand-yellow text-black font-bold rounded-full hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] transform hover:scale-105 active:scale-95 cursor-pointer">
                    Gabung Mitra
                </button>
            </div>

            {/* Mobile Menu Toggle (Simplified) */}
            <div className="md:hidden">
                <button className="text-white">
                    <div className="w-6 h-0.5 bg-white mb-1.5"></div>
                    <div className="w-6 h-0.5 bg-white"></div>
                </button>
            </div>
        </motion.nav>
    );
}
