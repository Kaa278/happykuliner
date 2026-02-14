"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardOverview() {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCounts = async () => {
            const { count } = await supabase.from('gallery').select('*', { count: 'exact', head: true });

            setCount(count || 0);
            setLoading(false);
        };
        fetchCounts();
    }, []);

    return (
        <div>
            <header className="mb-8">
                <h1 className="text-3xl font-bold uppercase tracking-wider">Dashboard Overview</h1>
                <p className="text-gray-400 mt-2">Welcome back, Admin.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-neutral-900 border border-white/5">
                    <h3 className="text-gray-400 text-sm font-medium mb-1">Jejak Kami Items</h3>
                    <p className="text-4xl font-bold text-white">
                        {loading ? "..." : count}
                    </p>
                </div>

                <div className="p-6 rounded-2xl bg-neutral-900 border border-white/5">
                    <h3 className="text-gray-400 text-sm font-medium mb-1">System Status</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <p className="text-lg font-bold text-green-500">Online</p>
                    </div>
                </div>
            </div>

            <div className="mt-12 p-8 rounded-3xl bg-neutral-900/50 border border-white/5 text-center">
                <p className="text-gray-500">Select "Jejak Kami" in the sidebar to manage content.</p>
            </div>
        </div>
    );
}
