"use client";

import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";

export interface GridProduct {
  id: number; // Updated from string to number to line up with serial IDs
  name: string;
  price: string;
  category: string;
  image: string;
}

export default function ProductGrid({ products }: { products: GridProduct[] }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  if (products.length === 0) {
    return (
      <div className="w-full text-center py-20 border border-dashed border-[#111E38]/10 bg-white/50">
        <p className="font-sans text-xs uppercase tracking-widest text-[#111E38]/40">
          No products currently listed in this collection.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12"
    >
      {products.map((product) => (
        // Convert id to string inside key assignment to keep React happy
        <ProductCard key={product.id.toString()} product={product} />
      ))}
    </motion.div>
  );
}
