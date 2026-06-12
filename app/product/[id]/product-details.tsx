"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/contexts/CartContext";
import { HiOutlineShoppingBag, HiCheck } from "react-icons/hi";

interface Variant {
  id: number;
  productId: number;
  size: string;
  color: string;
  sku: string | null;
  stock: number;
}

interface ProductWithVariants {
  id: number;
  name: string;
  description: string | null;
  basePrice: string;
  category: string; // Enforced category attribute tracking
  images: string[];
  variants: Variant[];
}

export default function ProductDetailClient({
  product,
}: {
  product: ProductWithVariants;
}) {
  const { addToCart, setIsOpen: openCartDrawer } = useCart();

  // Image and layout states
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Isolate distinct color and size tags found in database variants
  const uniqueColors = useMemo(
    () => Array.from(new Set((product.variants || []).map((v) => v.color))),
    [product.variants],
  );
  const uniqueSizes = useMemo(
    () => Array.from(new Set((product.variants || []).map((v) => v.size))),
    [product.variants],
  );

  // Set default initial configurations on mount
  const [selectedColor, setSelectedColor] = useState(uniqueColors[0] || "");
  const [selectedSize, setSelectedSize] = useState(uniqueSizes[0] || "");

  // Helper flag to detect accessories category
  const isAccessory = product.category?.toLowerCase() === "accessories";

  // Cross-reference active user choices to find current single variant
  const currentVariant = useMemo(() => {
    return (product.variants || []).find((v) => {
      // If it's an accessory, match purely by color (ignoring UI size switches)
      if (isAccessory) {
        return v.color === selectedColor;
      }
      return v.color === selectedColor && v.size === selectedSize;
    });
  }, [selectedColor, selectedSize, product.variants, isAccessory]);

  const numericPrice = parseFloat(product.basePrice || "0");

  const handleAddToCart = () => {
    if (!currentVariant || currentVariant.stock <= 0) return;

    addToCart({
      variantId: currentVariant.id,
      productId: product.id,
      name: product.name,
      price: numericPrice,
      image:
        (product.images && product.images[0]) || "https://placeholder.com/400",
      size: currentVariant.size,
      color: currentVariant.color,
    });

    openCartDrawer(true);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
      {/* LEFT COLUMN: VISUAL MEDIA Display Suite */}
      <div className="flex flex-col gap-4">
        <div className="w-full aspect-[3/4] bg-[#111E38]/5 overflow-hidden relative">
          {currentVariant && currentVariant.stock === 0 && (
            <span className="absolute top-4 left-4 z-10 bg-red-600 text-white text-[10px] uppercase font-semibold tracking-widest px-3 py-1.5 rounded-none">
              Out of Stock
            </span>
          )}
          <img
            src={
              (product.images && product.images[activeImageIndex]) ||
              "https://placeholder.com/600x800"
            }
            alt={product.name}
            className="w-full h-full object-cover object-center transition-all duration-500"
          />
        </div>

        {/* Gallery Selection Grid */}
        {product.images && product.images.length > 1 && (
          <div className="grid grid-cols-4 gap-3">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`aspect-[3/4] overflow-hidden bg-[#111E38]/5 border transition-all ${
                  activeImageIndex === idx
                    ? "border-[#111E38] ring-1 ring-[#111E38]"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: BRAND INFORMATION CORE */}
      <div className="flex flex-col justify-start pt-2">
        <h1 className="font-sans text-2xl md:text-3xl uppercase font-medium tracking-wider text-[#111E38] mb-2">
          {product.name}
        </h1>

        <p className="font-sans text-xl font-semibold text-[#111E38] mb-6">
          {numericPrice.toLocaleString()} DA
        </p>

        <hr className="border-[#111E38]/10 mb-6" />

        {product.description && (
          <div className="text-sm text-[#111E38]/70 font-light leading-relaxed mb-8 whitespace-pre-line">
            {product.description}
          </div>
        )}

        {/* Color Toggles Options Grid */}
        <div className="mb-6">
          <label className="block font-sans text-[11px] uppercase tracking-[0.2em] text-[#111E38]/60 mb-3 font-medium">
            Color:{" "}
            <span className="text-[#111E38] font-bold">{selectedColor}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {uniqueColors.map((color) => {
              const isSelected = selectedColor === color;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    setSelectedColor(color);
                    setActiveImageIndex(0);
                  }}
                  className={`px-4 py-2.5 font-sans text-xs uppercase tracking-wider transition-all border ${
                    isSelected
                      ? "border-[#111E38] bg-[#111E38] text-[#F9F8F4]"
                      : "border-gray-200 bg-white text-[#111E38] hover:border-[#111E38]"
                  }`}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>

        {/* SIZE SELECTION CONTROL — Conditionally Hidden for Accessories */}
        {!isAccessory && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <label className="block font-sans text-[11px] uppercase tracking-[0.2em] text-[#111E38]/60 font-medium">
                Size:{" "}
                <span className="text-[#111E38] font-bold">{selectedSize}</span>
              </label>
              <button
                type="button"
                onClick={() => alert("Standard sizing guidelines apply.")}
                className="text-[10px] uppercase tracking-widest text-[#5A6049] underline font-medium hover:text-[#111E38]"
              >
                Size Guide
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {uniqueSizes.map((size) => {
                const isSelected = selectedSize === size;

                const specificVariant = (product.variants || []).find(
                  (v) => v.color === selectedColor && v.size === size,
                );

                const isOutOfStock =
                  !specificVariant || specificVariant.stock === 0;
                const isLowStock =
                  specificVariant &&
                  specificVariant.stock > 0 &&
                  specificVariant.stock < 5;

                return (
                  <button
                    key={size}
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[56px] h-12 px-3 flex flex-col items-center justify-center font-sans text-xs uppercase tracking-wider transition-all border relative disabled:opacity-30 disabled:cursor-not-allowed ${
                      isSelected
                        ? "border-[#111E38] bg-[#111E38] text-[#F9F8F4] font-bold"
                        : "border-gray-200 bg-white text-[#111E38] hover:border-[#111E38]"
                    }`}
                  >
                    <span>{size}</span>
                    {isLowStock && (
                      <span
                        className={`text-[8px] font-mono tracking-tighter mt-0.5 font-bold ${isSelected ? "text-[#5A6049]" : "text-amber-700"}`}
                      >
                        {specificVariant.stock} left
                      </span>
                    )}

                    {isOutOfStock && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="w-full h-[1px] bg-gray-300 transform rotate-45 absolute" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Master CTA Button */}
        <div className={isAccessory ? "mt-4" : ""}>
          <motion.button
            whileTap={{ scale: 0.99 }}
            onClick={handleAddToCart}
            disabled={!currentVariant || currentVariant.stock <= 0}
            className="w-full bg-[#111E38] hover:bg-[#5A6049] text-[#F9F8F4] py-4 uppercase font-sans text-xs tracking-[0.2em] font-medium transition-colors flex items-center justify-center gap-3 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed rounded-none"
          >
            <HiOutlineShoppingBag className="text-base" />
            {!currentVariant
              ? "Select Options"
              : currentVariant.stock <= 0
                ? "Out of Stock"
                : "Add to Bag"}
          </motion.button>
        </div>

        {/* Localized Badges */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[#111E38]/5 pt-6 text-[11px] font-sans uppercase tracking-widest text-[#111E38]/60">
          <div className="flex items-center gap-2">
            <HiCheck className="text-[#5A6049] text-base" />
            <span>Cash on Delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <HiCheck className="text-[#5A6049] text-base" />
            <span>Fast Home Shipping</span>
          </div>
        </div>
      </div>
    </div>
  );
}
