"use client";

import React, { useEffect, useState } from "react";
import { getWilayas, getCommunesByWilaya } from "@/src/actions/geo";
import { createOrder } from "@/src/actions/orders";
import {
  checkoutSchema,
  type CheckoutInput,
} from "@/src/lib/validations/checkout";
import { z } from "zod";

interface Wilaya {
  id: number;
  nameAr: string;
  nameFr: string;
}

interface Commune {
  id: number;
  wilayaId: number;
  nameAr: string;
  nameFr: string;
}

export default function CheckoutForm() {
  // Database Geography States
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);

  // Aligned Form State Blueprint
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    deliveryType: "HOME", // Default initial selection
    address: "",
    wilayaId: "",
    communeId: "",
  });

  // UI Flow States
  const [errors, setErrors] = useState<
    Partial<Record<keyof CheckoutInput, string>>
  >({});
  const [isLoadingCommunes, setIsLoadingCommunes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hardcoded temporary metrics (Will be replaced dynamically when hooked to your cart later)
  const orderSummary = {
    shippingFee: formData.deliveryType === "HOME" ? 600 : 400, // Typical Algerian COD tier pricing mapping
    totalPrice: 4500 + (formData.deliveryType === "HOME" ? 600 : 400),
  };

  // 1. Initial lookup for Wilayas on component mount
  useEffect(() => {
    async function loadWilayas() {
      const result = await getWilayas();
      if (result.success && result.data) {
        setWilayas(result.data as Wilaya[]);
      }
    }
    loadWilayas();
  }, []);

  // 2. Dynamic multi-tier filter loop for Communes
  useEffect(() => {
    const wilayaIdNum = Number(formData.wilayaId);
    if (!wilayaIdNum || isNaN(wilayaIdNum)) {
      setCommunes([]);
      return;
    }

    async function loadCommunes() {
      setIsLoadingCommunes(true);
      const result = await getCommunesByWilaya(wilayaIdNum);
      if (result.success && result.data) {
        setCommunes(result.data as Commune[]);
      }
      setIsLoadingCommunes(false);
    }

    loadCommunes();
  }, [formData.wilayaId]);

  // Input controller
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Wipe the Commune selection completely if the user modifies the master Wilaya dropdown
      ...(name === "wilayaId" ? { communeId: "" } : {}),
      // Cleanly clear address out of state memory if switching to STOP_DESK
      ...(name === "deliveryType" && value === "STOP_DESK"
        ? { address: "" }
        : {}),
    }));

    // Erase specific field errors dynamically on user keystroke interaction
    if (errors[name as keyof CheckoutInput]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // 3. Execution pipeline for checkout submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Client-side local parsing via Zod alignment
      const validatedData = checkoutSchema.parse(formData);

      // Dispatch the payload securely to Neon Cloud backend
      const result = await createOrder(validatedData, orderSummary);

      if (result.success) {
        alert(`🎉 Order placed successfully! ID: #${result.orderId}`);
        // Reset state values safely
        setFormData({
          customerName: "",
          phone: "",
          deliveryType: "HOME",
          address: "",
          wilayaId: "",
          communeId: "",
        });
      } else {
        alert(`❌ Server-side Refusal: ${result.error}`);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof CheckoutInput, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof CheckoutInput] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Delivery Details</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Customer Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            placeholder="Mohamed Amin"
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-gray-900 outline-none transition-all focus:bg-white focus:ring-2 ${
              errors.customerName
                ? "border-red-500 focus:ring-red-100"
                : "border-gray-300 focus:border-neutral-900 focus:ring-neutral-100"
            }`}
          />
          {errors.customerName && (
            <p className="mt-1 text-xs text-red-600 font-medium">
              {errors.customerName}
            </p>
          )}
        </div>

        {/* Phone Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="0550123456"
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-gray-900 outline-none transition-all focus:bg-white focus:ring-2 ${
              errors.phone
                ? "border-red-500 focus:ring-red-100"
                : "border-gray-300 focus:border-neutral-900 focus:ring-neutral-100"
            }`}
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-600 font-medium">
              {errors.phone}
            </p>
          )}
        </div>

        {/* Delivery Type Option Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivery Method
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label
              className={`flex flex-col p-3 border rounded-xl cursor-pointer transition-all ${
                formData.deliveryType === "HOME"
                  ? "border-neutral-900 bg-neutral-50/50 ring-1 ring-neutral-900"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-900">
                  Home Delivery
                </span>
                <input
                  type="radio"
                  name="deliveryType"
                  value="HOME"
                  checked={formData.deliveryType === "HOME"}
                  onChange={handleChange}
                  className="accent-neutral-900 h-4 w-4"
                />
              </div>
              <span className="text-xs text-gray-500">
                To your doorstep (+600 DZD)
              </span>
            </label>

            <label
              className={`flex flex-col p-3 border rounded-xl cursor-pointer transition-all ${
                formData.deliveryType === "STOP_DESK"
                  ? "border-neutral-900 bg-neutral-50/50 ring-1 ring-neutral-900"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-900">
                  Stop Desk
                </span>
                <input
                  type="radio"
                  name="deliveryType"
                  value="STOP_DESK"
                  checked={formData.deliveryType === "STOP_DESK"}
                  onChange={handleChange}
                  className="accent-neutral-900 h-4 w-4"
                />
              </div>
              <span className="text-xs text-gray-500">
                Pick up from office (+400 DZD)
              </span>
            </label>
          </div>
        </div>

        {/* Wilaya & Commune Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Wilaya Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wilaya
            </label>
            <select
              name="wilayaId"
              value={formData.wilayaId}
              onChange={handleChange}
              className={`w-full px-3 py-2.5 bg-gray-50 border rounded-lg text-gray-900 outline-none transition-all focus:bg-white focus:ring-2 ${
                errors.wilayaId
                  ? "border-red-500 focus:ring-red-100"
                  : "border-gray-300 focus:border-neutral-900 focus:ring-neutral-100"
              }`}
            >
              <option value="">Select Wilaya</option>
              {wilayas.map((w) => (
                <option key={w.id} value={w.id}>
                  {String(w.id).padStart(2, "0")} - {w.nameFr} ({w.nameAr})
                </option>
              ))}
            </select>
            {errors.wilayaId && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {errors.wilayaId}
              </p>
            )}
          </div>

          {/* Commune Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Commune
            </label>
            <select
              name="communeId"
              value={formData.communeId}
              onChange={handleChange}
              disabled={!formData.wilayaId || isLoadingCommunes}
              className={`w-full px-3 py-2.5 border rounded-lg text-gray-900 outline-none transition-all focus:bg-white focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                errors.communeId
                  ? "border-red-500 focus:ring-red-100"
                  : "border-gray-300 focus:border-neutral-900 focus:ring-neutral-100"
              } ${formData.wilayaId ? "bg-gray-50" : "bg-gray-100"}`}
            >
              <option value="">
                {isLoadingCommunes
                  ? "Loading..."
                  : !formData.wilayaId
                    ? "Choose Wilaya first"
                    : "Select Commune"}
              </option>
              {communes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameFr} ({c.nameAr})
                </option>
              ))}
            </select>
            {errors.communeId && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {errors.communeId}
              </p>
            )}
          </div>
        </div>

        {/* Conditional Address Input (Visually hidden if choosing STOP_DESK) */}
        {formData.deliveryType === "HOME" && (
          <div className="transition-all animate-in fade-in duration-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Cité 100 logts, Bloc B N°04"
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-gray-900 outline-none transition-all focus:bg-white focus:ring-2 ${
                errors.address
                  ? "border-red-500 focus:ring-red-100"
                  : "border-gray-300 focus:border-neutral-900 focus:ring-neutral-100"
              }`}
            />
            {errors.address && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {errors.address}
              </p>
            )}
          </div>
        )}

        {/* Checkout Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring-4 focus:ring-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? "Processing Order..."
            : `Confirm Order (${orderSummary.totalPrice} DZD)`}
        </button>
      </form>
    </div>
  );
}
