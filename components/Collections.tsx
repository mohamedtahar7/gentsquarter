"use client";
import { motion } from "framer-motion";
import Link from "next/link";

interface Category {
  title: string;
  slug: string;
  image: string;
  className: string;
}

export default function Collections() {
  const categories: Category[] = [
    {
      title: "Shirts",
      slug: "shirts",
      image:
        "https://cdn.cloudfastin.top/image/2022/07/cc034c2dbe0d672d341a329f0a22c23764c752c7dcef35535fc833824d8d5325-600.jpeg",
      className: "md:col-span-2 md:row-span-2 h-[400px] md:h-[620px]", // Large anchor card
    },
    {
      title: "Pants",
      slug: "pants",
      image: "https://i.postimg.cc/2yscGzkt/sd.png",
      className: "md:col-span-2 md:row-span-1 h-[280px]",
    },
    {
      title: "Shoes",
      slug: "shoes",
      image:
        "https://i.pinimg.com/736x/25/16/3d/25163d81f20d27617e61c68b50a17d28.jpg",
      className: "md:col-span-1 md:row-span-1 h-[280px] md:h-[316px]",
    },
    {
      title: "Accessories",
      slug: "accessories",
      image:
        "https://i.pinimg.com/1200x/6d/48/c2/6d48c209d1b3d56116b46e5e2ff425ad.jpg",
      className: "md:col-span-1 md:row-span-1 h-[280px] md:h-[316px]",
    },
  ];

  // Parent grid animation container (triggers when section enters viewport)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  // Individual card subtle slide up
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.215, 0.61, 0.355, 1] },
    },
  };

  return (
    <section
      id="collections"
      className="w-full bg-[#F9F8F4] py-24 px-6 md:px-12"
    >
      <div className="max-w-[1600px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center mb-16 text-center">
          <p className="font-sans text-[10px] tracking-[0.4em] uppercase mb-4 text-[#111E38]/60">
            Curated Editions
          </p>
          <h2 className="font-sans text-4xl tracking-[0.4em] uppercase mb-4 text-[#111E38]">
            The Essentials
          </h2>
          <div className="w-12 h-[1px] bg-[#5A6049] mt-6 opacity-40" />
        </div>

        {/* Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {categories.map((category, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className={`relative group overflow-hidden bg-[#111E38] ${category.className}`}
            >
              <Link
                href={`/collections/${category.slug}`}
                className="block w-full h-full"
              >
                {/* Background Image with Hover Scale */}
                <motion.img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover opacity-80 transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-60"
                />

                {/* Quiet Luxury Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111E38]/80 via-[#111E38]/20 to-transparent transition-opacity duration-500 group-hover:from-[#111E38]/90" />

                {/* Category Content Overlay */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="overflow-hidden">
                    <h3 className="font-display text-3xl text-[#F9F8F4] mb-2 transform transition-transform duration-500 ease-out translate-y-0">
                      {category.title}
                    </h3>
                  </div>

                  {/* Action Link that fades/slides in on hover */}
                  <span className="font-sans text-[9px] tracking-[0.3em] uppercase text-[#F9F8F4]/70 flex items-center gap-2 opacity-0 -translate-y-2 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:translate-y-0">
                    Discover Now <span className="text-sm">→</span>
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
