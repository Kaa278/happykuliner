"use client";

import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const FRAME_COUNT = 240;
const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

export default function SequenceScroll() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Scroll progress for the container
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    // Map scroll progress (0 to 1) to frame index (0 to FRAME_COUNT - 1)
    const frameIndex = useTransform(scrollYProgress, [0, 1], [0, FRAME_COUNT - 1]);

    // Preload images
    useEffect(() => {
        const loadImages = async () => {
            const loadedImages: HTMLImageElement[] = [];
            const promises = [];

            for (let i = 1; i <= FRAME_COUNT; i++) {
                const promise = new Promise((resolve, reject) => {
                    const img = new Image();
                    // Pad index with zeros (e.g., 001, 010, 100)
                    const paddedIndex = i.toString().padStart(3, "0");
                    img.src = `/sequence/ezgif-frame-${paddedIndex}.jpg`;
                    img.onload = () => {
                        loadedImages[i - 1] = img; // Store in correct index
                        resolve(true);
                    };
                    img.onerror = (e) => {
                        console.error(`Failed to load frame ${i}`, e);
                        resolve(false); // Continue even if one frame fails
                    };
                });
                promises.push(promise);
            }

            await Promise.all(promises);
            setImages(loadedImages);
            setIsLoaded(true);
        };

        loadImages();
    }, []);

    // Draw frame function
    const renderFrame = (index: number) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        const img = images[index];

        if (!canvas || !ctx || !img) return;

        // Responsive scaling (cover)
        const cw = canvas.width;
        const ch = canvas.height;
        const iw = img.width;
        const ih = img.height;

        const scale = Math.max(cw / iw, ch / ih);
        const x = (cw - iw * scale) / 2;
        const y = (ch - ih * scale) / 2;

        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(img, x, y, iw * scale, ih * scale);
    };

    // Resize handler
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // Redraw current frame after resize
            const currentIndex = Math.min(
                FRAME_COUNT - 1,
                Math.floor(scrollYProgress.get() * (FRAME_COUNT - 1))
            );
            if (isLoaded && images.length > 0) {
                renderFrame(currentIndex);
            }
        };

        window.addEventListener("resize", handleResize);
        handleResize(); // Initial size

        return () => window.removeEventListener("resize", handleResize);
    }, [isLoaded, images]);

    // Sync canvas with scroll
    useMotionValueEvent(frameIndex, "change", (latest) => {
        if (!isLoaded || images.length === 0) return;

        const index = Math.round(latest);
        requestAnimationFrame(() => renderFrame(index));
    });

    // Text Opacity Transforms
    const opacity1 = useTransform(scrollYProgress, [0.0, 0.1, 0.2], [1, 1, 0]);
    const opacity2 = useTransform(scrollYProgress, [0.25, 0.3, 0.45], [0, 1, 0]);
    const opacity3 = useTransform(scrollYProgress, [0.55, 0.6, 0.75], [0, 1, 0]);
    const opacity4 = useTransform(scrollYProgress, [0.85, 0.9, 1.0], [0, 1, 1]);

    // Text Motion Transforms
    const y1 = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
    const x2 = useTransform(scrollYProgress, [0.25, 0.45], [-50, 0]);
    const x3 = useTransform(scrollYProgress, [0.55, 0.75], [50, 0]);
    const scale4 = useTransform(scrollYProgress, [0.85, 1], [0.8, 1]);

    return (
        <div ref={containerRef} className="relative h-[400vh] bg-black">
            <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 block h-full w-full object-cover z-0"
                />

                {/* Loading State */}
                {!isLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-deep-black text-white z-50">
                        <div className="text-2xl font-light tracking-widest animate-pulse">
                            LOADING SEQUENCE...
                        </div>
                    </div>
                )}

                {/* Text Overlays */}
                <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
                    {/* 0% Scroll: Centered */}
                    <motion.div style={{ opacity: opacity1, y: y1 }} className="absolute text-center px-6 w-full max-w-4xl">
                        <h1 className="text-5xl sm:text-7xl md:text-9xl font-black text-white tracking-widest uppercase shadow-black drop-shadow-2xl leading-tight">
                            Fresh From<br />The Ocean
                        </h1>
                    </motion.div>

                    {/* 30% Scroll: Left Aligned - Mobile Optimized */}
                    <motion.div style={{ opacity: opacity2, x: x2 }} className="absolute left-6 md:left-32 bottom-32 max-w-lg px-4">
                        <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white leading-tight drop-shadow-xl">
                            Bold Flavor.<br />
                            <span className="text-brand-red">Real Seafood.</span>
                        </h2>
                    </motion.div>

                    {/* 60% Scroll: Right Aligned - Mobile Optimized */}
                    <motion.div style={{ opacity: opacity3, x: x3 }} className="absolute right-6 md:right-32 top-32 text-right px-4">
                        <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white leading-tight drop-shadow-xl">
                            Premium<br />
                            Quality Squid
                        </h2>
                    </motion.div>

                    {/* 90% Scroll: CTA Centered */}
                    <motion.div style={{ opacity: opacity4, scale: scale4 }} className="absolute flex flex-col items-center gap-6 md:gap-8 pointer-events-auto px-4 text-center">
                        <h2 className="text-5xl sm:text-7xl md:text-8xl font-black text-white uppercase text-center bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 drop-shadow-2xl">
                            Siap Bermitra?
                        </h2>
                        <button className="px-10 py-4 md:px-14 md:py-5 bg-brand-yellow text-black text-xl md:text-2xl font-bold rounded-full hover:bg-white hover:text-black transition-all duration-300 shadow-[0_0_30px_rgba(255,215,0,0.5)] hover:shadow-[0_0_50px_rgba(255,255,255,0.8)] transform hover:scale-105 active:scale-95 cursor-pointer">
                            Jadi Mitra Sekarang
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
