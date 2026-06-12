"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative w-full h-screen overflow-hidden bg-[#111E38]">
      {/* Background Image & Vignette Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://i.postimg.cc/YqWCcq6X/wmremove-transformed-(1).png"
          alt="Gent's Quarter Luxury Menswear"
          className="w-full h-full object-cover object-center opacity-80"
        />
        {/* Radial/vignette style overlay to keep focus on the center text */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#111E38]/50 via-[#111E38]/20 to-[#111E38]/80" />
        <div className="absolute inset-0 bg-[#111E38]/20 backdrop-blur-[1px]" />
      </div>

      {/* Centered Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center text-[#F9F8F4]">
        <div className="max-w-3xl flex flex-col items-center">
          {/* Refined Pre-title */}
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="font-sans text-[10px] md:text-xs tracking-[0.4em] uppercase mb-6 text-[#F9F8F4]/80"
          >
            A Study in Timelessness
          </motion.p>

          {/* New Display Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[1.1] mb-8 text-[#F9F8F4]"
          >
            Sartorial Precision
          </motion.h1>

          {/* New Subtle Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="font-sans text-xs md:text-sm tracking-[0.25em] uppercase mb-12 text-[#F9F8F4]/70 max-w-xl leading-relaxed"
          >
            A minimalist approach to the masculine wardrobe. Meticulously
            tailored garments designed to transcend the seasons.
          </motion.p>

          {/* Centered Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto justify-center"
          >
            <Link
              href="/#collections"
              className="px-12 py-4 bg-[#F9F8F4] text-[#111E38] font-sans text-[10px] tracking-[0.3em] uppercase hover:bg-[#5A6049] hover:text-[#F9F8F4] transition-colors duration-500 text-center min-w-[180px]"
            >
              Explore Our Collection
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
