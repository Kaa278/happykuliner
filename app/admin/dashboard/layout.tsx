"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/admin");
            } else {
                setLoading(false);
            }
        };
        checkUser();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/admin");
    };

    if (loading) return (
        <div className="min-h-screen bg-deep-black flex items-center justify-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-yellow"></div>
        </div>
    );

    const navItems = [
        { name: "Overview", href: "/admin/dashboard" },
        { name: "Jejak Kami", href: "/admin/dashboard/jejak-kami" },
        { name: "QRIS Management", href: "/admin/dashboard/qris" },
    ];

    return (
        <div className="min-h-screen bg-deep-black text-white flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-deep-black sticky top-0 z-50">
                <h2 className="text-lg font-bold uppercase tracking-wider">HK Admin<span className="text-brand-red">.</span></h2>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-white">
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 w-64 bg-deep-black/95 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col z-40 transition-transform duration-300 md:translate-x-0 md:static md:h-screen
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                <div className="mb-12 hidden md:block">
                    <h2 className="text-xl font-bold uppercase tracking-wider">HK Admin<span className="text-brand-red">.</span></h2>
                </div>

                <nav className="flex-1 space-y-2 mt-12 md:mt-0">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`block px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive
                                    ? "bg-brand-yellow text-black shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <button
                    onClick={handleLogout}
                    className="mt-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 font-medium border border-red-500/20 hover:border-red-500 mb-8 md:mb-0"
                >
                    Start Logout
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-x-hidden w-full">
                <div className="opacity-100 transition-opacity duration-300">
                    {children}
                </div>
            </main>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}
