"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { HiOutlineHeart, HiHeart } from "react-icons/hi";
import Link from "next/link";

interface Product {
  id: string | number;
  name: string;
  price: string | number;
  category: string;
  image: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <Link href={`/product/${product.id}`} className="block group">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.215, 0.61, 0.355, 1] }}
        className="relative flex flex-col bg-[#F9F8F4]"
      >
        {/* Image Container */}
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#111E38]/5 mb-4">
          {/* Wishlist Toggle (Keeps click handlers to isolate it from the card navigation) */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            className="absolute top-4 right-4 z-20 text-[#111E38] text-xl p-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-label="Toggle wishlist"
          >
            {isFavorite ? (
              <HiHeart className="text-[#5A6049]" />
            ) : (
              <HiOutlineHeart />
            )}
          </button>

          {/* Product Image */}
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* View Details Hover Overlay */}
          <div className="absolute inset-0 bg-[#111E38]/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4 z-10">
            <span className="w-full bg-[#111E38] text-[#F9F8F4] py-3 text-[10px] tracking-[0.2em] uppercase font-medium text-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 group-hover:bg-[#5A6049]">
              View Details —
            </span>
          </div>
        </div>

        {/* Product Information */}
        <div className="flex flex-col gap-1 px-1">
          <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-[#111E38]/50">
            {product.category}
          </p>
          <div className="flex justify-between items-baseline">
            <h3 className="font-sans text-xs tracking-wider text-[#111E38] uppercase font-medium group-hover:text-[#5A6049] transition-colors duration-300">
              {product.name}
            </h3>
            <span className="font-sans text-xs font-light text-[#111E38]/80">
              {product.price}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
