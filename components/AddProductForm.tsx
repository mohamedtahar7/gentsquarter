"use client";

import React, { useState } from "react";
import { createProductWithVariants } from "@/src/actions/productActions";
import { HiOutlineTrash, HiOutlinePlus } from "react-icons/hi";
import { toast } from "sonner";

export default function AddProductForm({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [name, setName] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [category, setCategory] = useState("shirts");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [images, setImages] = useState<string[]>([""]);
  const [variants, setVariants] = useState<
    { size: string; color: string; stock: number }[]
  >([{ size: "M", color: "Black", stock: 10 }]);

  const handleImageUrlChange = (index: number, value: string) => {
    const updated = [...images];
    updated[index] = value;
    setImages(updated);
  };

  const addImageUrlField = () => setImages([...images, ""]);
  const removeImageUrlField = (index: number) => {
    if (images.length > 1) setImages(images.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: string, value: any) => {
    const updated = [...variants] as any;
    updated[index][field] = value;
    setVariants(updated);
  };

  const addVariantField = () =>
    setVariants([...variants, { size: "M", color: "", stock: 5 }]);
  const removeVariantField = (index: number) => {
    if (variants.length > 1)
      setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const res = await createProductWithVariants({
      name,
      basePrice: parseFloat(basePrice),
      category,
      images: images.filter((url) => url.trim() !== ""),
      variants,
    });

    setIsSubmitting(false);

    if (res.success) {
      toast.success("Catalog Updated", {
        description: `${name} has been successfully added to ${category}.`,
        style: {
          background: "#111E38",
          color: "#F9F8F4",
          border: "1px solid rgba(249, 248, 244, 0.1)",
          borderRadius: "0px",
          padding: "16px",
        },
        className: "font-sans uppercase tracking-widest text-[11px] font-bold",
        descriptionClassName:
          "text-[#F9F8F4]/70 tracking-normal normal-case font-normal text-xs mt-1",
      });

      onComplete();
    } else {
      toast.error("Submission Failed", {
        description: res.error || "Failed to commit brand entry to database.",
        style: {
          background: "#F4F3EE",
          color: "#111E38",
          border: "1px solid rgba(17, 30, 56, 0.1)",
          borderRadius: "0px",
          padding: "16px",
        },
        className:
          "font-sans uppercase tracking-widest text-[11px] font-bold text-red-600",
        descriptionClassName:
          "text-[#111E38]/80 tracking-normal normal-case font-normal text-xs mt-1",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-[#111E38]/10 p-8 shadow-sm space-y-8 max-w-4xl"
    >
      {/* PRODUCT DETAILS */}
      <div>
        <h3 className="text-sm font-sans uppercase font-bold text-[#111E38] tracking-widest border-b pb-2 mb-6">
          Product Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#111E38]/60 font-medium mb-1.5">
              Product Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Luxury Linen Resort Shirt"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#F4F3EE]/50 border border-[#111E38]/10 text-xs p-3 text-[#111E38] focus:outline-none focus:border-[#111E38]"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#111E38]/60 font-medium mb-1.5">
              Product Price (DA)
            </label>
            <input
              type="number"
              required
              placeholder="4500"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              className="w-full bg-[#F4F3EE]/50 border border-[#111E38]/10 text-xs p-3 text-[#111E38] focus:outline-none focus:border-[#111E38]"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#111E38]/60 font-medium mb-1.5">
              Category Collection
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#F4F3EE]/50 border border-[#111E38]/10 text-xs p-3 text-[#111E38] focus:outline-none focus:border-[#111E38] appearance-none cursor-pointer rounded-none"
            >
              <option value="shirts">Shirts</option>
              <option value="pants">Pants</option>
              <option value="shoes">Shoes</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>
        </div>
      </div>

      {/* DYNAMIC IMAGE FIELDS SECTION */}
      <div>
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h3 className="text-sm font-sans uppercase font-bold text-[#111E38] tracking-widest">
            Product Images Showcase
          </h3>
          <button
            type="button"
            onClick={addImageUrlField}
            className="flex items-center gap-1 text-[10px] uppercase tracking-wider bg-[#111E38] text-white px-3 py-1.5 font-medium hover:bg-[#5A6049] transition-colors"
          >
            <HiOutlinePlus /> Add Image
          </button>
        </div>

        <div className="space-y-3">
          {images.map((url, index) => (
            <div key={index} className="flex gap-2 items-center">
              <span className="text-xs font-mono text-[#111E38]/40 w-6">
                #{index + 1}
              </span>
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/..."
                value={url}
                onChange={(e) => handleImageUrlChange(index, e.target.value)}
                className="w-full bg-[#F4F3EE]/50 border border-[#111E38]/10 text-xs p-3 text-[#111E38] focus:outline-none focus:border-[#111E38]"
              />
              <button
                type="button"
                disabled={images.length === 1}
                onClick={() => removeImageUrlField(index)}
                className="p-3 text-red-600 hover:bg-red-50 disabled:opacity-30 border border-transparent disabled:hover:bg-transparent"
              >
                <HiOutlineTrash className="text-base" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* DYNAMIC INVENTORY VARIANTS SECTION */}
      <div>
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h3 className="text-sm font-sans uppercase font-bold text-[#111E38] tracking-widest">
            Stock Variant Inventory Configurations
          </h3>
          <button
            type="button"
            onClick={addVariantField}
            className="flex items-center gap-1 text-[10px] uppercase tracking-wider bg-[#111E38] text-white px-3 py-1.5 font-medium hover:bg-[#5A6049] transition-colors"
          >
            <HiOutlinePlus /> Add Variant
          </button>
        </div>

        <div className="space-y-3">
          {variants.map((v, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end bg-[#F4F3EE]/30 p-3 border border-gray-100"
            >
              {/* Size Text Input Field */}
              <div>
                <label className="block text-[9px] uppercase tracking-widest text-[#111E38]/50 font-bold mb-1">
                  Size
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., M, 42, OS"
                  value={v.size}
                  onChange={(e) =>
                    handleVariantChange(index, "size", e.target.value)
                  }
                  className="w-full bg-white border border-[#111E38]/10 text-xs p-2 text-[#111E38] focus:outline-none focus:border-[#111E38]"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-widest text-[#111E38]/50 font-bold mb-1">
                  Color Shade
                </label>
                <input
                  type="text"
                  required
                  placeholder="Beige, Black"
                  value={v.color}
                  onChange={(e) =>
                    handleVariantChange(index, "color", e.target.value)
                  }
                  className="w-full bg-white border border-[#111E38]/10 text-xs p-2 text-[#111E38] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-widest text-[#111E38]/50 font-bold mb-1">
                  Units Allocated
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={v.stock}
                  onChange={(e) =>
                    handleVariantChange(
                      index,
                      "stock",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full bg-white border border-[#111E38]/10 text-xs p-2 text-[#111E38] focus:outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={variants.length === 1}
                  onClick={() => removeVariantField(index)}
                  className="w-full md:w-auto p-2 text-red-600 hover:bg-red-50 disabled:opacity-30 flex items-center justify-center gap-1 text-[10px] uppercase tracking-widest font-mono"
                >
                  <HiOutlineTrash className="text-sm" /> Clear
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#5A6049] hover:bg-[#111E38] text-white py-4 uppercase font-sans text-xs tracking-[0.2em] font-medium transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Adding Product..." : "Add Product"}
        </button>
      </div>
    </form>
  );
}
