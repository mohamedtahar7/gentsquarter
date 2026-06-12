"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useCart } from "@/contexts/CartContext";
import {
  HiOutlineShieldCheck,
  HiOutlineTruck,
  HiArrowLeft,
} from "react-icons/hi";
import Link from "next/link";
import { getCommunesByWilaya } from "@/src/actions/geo";
import { placeOrder } from "@/src/actions/checkout";

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

export default function CheckoutFormClient({ wilayas }: { wilayas: Wilaya[] }) {
  const { cart, total: cartSubtotal, clearCart } = useCart();

  // Form Field States
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [selectedWilaya, setSelectedWilaya] = useState<number>(0);
  const [selectedCommune, setSelectedCommune] = useState<number>(0);
  const [deliveryType, setDeliveryType] = useState<"HOME" | "STOP_DESK">(
    "HOME",
  );

  // Functional System States
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [isCommunesLoading, setIsCommunesLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [orderSuccessId, setOrderSuccessId] = useState<number | null>(null);

  // Cascading Dynamic Dropdown Population Trigger
  useEffect(() => {
    if (selectedWilaya === 0) {
      setCommunes([]);
      setSelectedCommune(0);
      return;
    }

    const fetchCommunes = async () => {
      setIsCommunesLoading(true);
      const data = await getCommunesByWilaya(selectedWilaya);
      setCommunes(data);
      setSelectedCommune(data[0]?.id || 0); // Default select the first commune in list
      setIsCommunesLoading(false);
    };

    fetchCommunes();
  }, [selectedWilaya]);

  // Dynamic Shipping Pricing Matrix Component Engine
  const shippingFee = useMemo(() => {
    if (selectedWilaya === 0) return 0;

    // Core localized shipping tiers (Algiers base, surrounding tiers, far zones)
    let baseFee = 600;
    if (selectedWilaya === 16)
      baseFee = 400; // Algiers
    else if ([9, 42, 35].includes(selectedWilaya))
      baseFee = 500; // Blida, Tipaza, Boumerdes
    else if ([11, 30, 47, 33, 11].includes(selectedWilaya)) baseFee = 900; // Far South regions

    // Save 200 DA automatically if customer chooses desk collection
    return deliveryType === "STOP_DESK"
      ? Math.max(250, baseFee - 200)
      : baseFee;
  }, [selectedWilaya, deliveryType]);

  const finalOrderTotal = cartSubtotal + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (cart.length === 0) {
      setFormError("Your shopping cart is empty.");
      return;
    }

    if (selectedWilaya === 0 || selectedCommune === 0) {
      setFormError(
        "Please select your Wilaya and corresponding Commune location details.",
      );
      return;
    }

    setIsSubmitting(true);

    const payload = {
      customerName,
      phone,
      address,
      wilayaId: selectedWilaya,
      communeId: selectedCommune,
      deliveryType,
    };
    const orderItemsPayload = cart.map((item) => ({
      variantId: item.variantId,
      quantity: item.amount,
      price: item.price,
    }));

    const response = await placeOrder(payload, orderItemsPayload, shippingFee);

    setIsSubmitting(false);

    if (response.success && response.orderId) {
      setOrderSuccessId(response.orderId);
      clearCart();
    } else {
      setFormError(
        response.error ||
          "An error occurred. Please check your data entry strings.",
      );
    }
  };

  // Order Success Screen View
  if (orderSuccessId) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-6 bg-white border border-[#111E38]/10 shadow-sm rounded-sm">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
          ✓
        </div>
        <h2 className="font-sans text-lg uppercase tracking-wider text-[#111E38] mb-2 font-medium">
          Order Placed Successfully!
        </h2>
        <p className="font-sans text-xs text-[#111E38]/60 uppercase tracking-widest mb-1">
          Tracking ID Reference: #{orderSuccessId}
        </p>
        <p className="text-sm text-[#111E38]/70 font-light mt-4 mb-8 leading-relaxed">
          Thank you for choosing Gent's Quarter. Our team will contact you at{" "}
          <span className="font-semibold text-[#111E38]">{phone}</span> within
          the next few hours to confirm details before dispatching your package.
        </p>
        <Link
          href="/"
          className="inline-block bg-[#111E38] hover:bg-[#5A6049] text-[#F9F8F4] px-8 py-3 text-xs uppercase tracking-widest font-medium transition-colors"
        >
          Continue Browsing
        </Link>
      </div>
    );
  }

  // Base Cart Empty Block Fallback
  if (cart.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="font-sans text-sm text-[#111E38]/60 uppercase tracking-widest mb-6">
          Your shopping selections are currently empty
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#111E38] text-[#F9F8F4] px-6 py-3 text-xs uppercase tracking-widest transition-colors hover:bg-[#5A6049]"
        >
          <HiArrowLeft /> Back to Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      {/* Left Input Data Capture Form Column */}
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-7 bg-white p-6 md:p-8 border border-[#111E38]/5 shadow-sm space-y-6"
      >
        <h2 className="font-sans text-xs uppercase tracking-[0.15em] text-[#111E38] font-semibold border-b border-[#111E38]/5 pb-4">
          Shipping & Delivery Details
        </h2>

        {formError && (
          <div className="bg-red-50 text-red-700 text-xs p-4 border border-red-200 font-sans tracking-wide">
            ⚠️ {formError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#111E38]/60 font-medium mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="Ahmed Benali"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-[#F9F8F4] border border-[#111E38]/10 text-sm p-3 text-[#111E38] focus:outline-none focus:border-[#111E38]"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#111E38]/60 font-medium mb-1.5">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              placeholder="0550123456"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#F9F8F4] border border-[#111E38]/10 text-sm p-3 text-[#111E38] focus:outline-none focus:border-[#111E38]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#111E38]/60 font-medium mb-1.5">
              Wilaya *
            </label>
            <select
              value={selectedWilaya}
              onChange={(e) => setSelectedWilaya(Number(e.target.value))}
              className="w-full bg-[#F9F8F4] border border-[#111E38]/10 text-sm p-3 text-[#111E38] focus:outline-none focus:border-[#111E38] h-[46px]"
            >
              <option value={0}>Select your Wilaya</option>
              {wilayas.map((w) => (
                <option key={w.id} value={w.id}>
                  {String(w.id).padStart(2, "0")} — {w.nameFr} ({w.nameAr})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#111E38]/60 font-medium mb-1.5">
              Commune *
            </label>
            <select
              value={selectedCommune}
              onChange={(e) => setSelectedCommune(Number(e.target.value))}
              disabled={selectedWilaya === 0 || isCommunesLoading}
              className="w-full bg-[#F9F8F4] border border-[#111E38]/10 text-sm p-3 text-[#111E38] focus:outline-none focus:border-[#111E38] disabled:opacity-40 h-[46px]"
            >
              {isCommunesLoading ? (
                <option>Loading locations...</option>
              ) : communes.length === 0 ? (
                <option value={0}>Choose Wilaya first</option>
              ) : (
                communes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameFr} — {c.nameAr}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-[#111E38]/60 font-medium mb-1.5">
            Exact Delivery Address *
          </label>
          <input
            type="text"
            required
            placeholder="Street Name, House Number, Building Floor..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-[#F9F8F4] border border-[#111E38]/10 text-sm p-3 text-[#111E38] focus:outline-none focus:border-[#111E38]"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-[#111E38]/60 font-medium mb-3">
            Delivery Execution Model *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              className={`border p-4 flex items-center justify-between cursor-pointer transition-all ${deliveryType === "HOME" ? "border-[#111E38] bg-[#111E38]/5" : "border-gray-200"}`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="deliveryType"
                  checked={deliveryType === "HOME"}
                  onChange={() => setDeliveryType("HOME")}
                  className="accent-[#111E38]"
                />
                <span className="font-sans text-xs font-medium text-[#111E38]">
                  Home Delivery
                </span>
              </div>
              <HiOutlineTruck className="text-lg text-[#111E38]/60" />
            </label>
            <label
              className={`border p-4 flex items-center justify-between cursor-pointer transition-all ${deliveryType === "STOP_DESK" ? "border-[#111E38] bg-[#111E38]/5" : "border-gray-200"}`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="deliveryType"
                  checked={deliveryType === "STOP_DESK"}
                  onChange={() => setDeliveryType("STOP_DESK")}
                  className="accent-[#111E38]"
                />
                <span className="font-sans text-xs font-medium text-[#111E38]">
                  Stop-Desk Collection
                </span>
              </div>
              <span className="text-[9px] bg-[#5A6049] text-white px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                -200 DA
              </span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#111E38] hover:bg-[#5A6049] text-[#F9F8F4] py-4 uppercase font-sans text-xs tracking-[0.2em] font-medium transition-colors disabled:bg-gray-300 disabled:text-gray-500"
        >
          {isSubmitting
            ? "Processing Order Framework..."
            : "Confirm Cash On Delivery Order"}
        </button>
      </form>

      {/* Right Order Calculations Matrix Sidebar Column */}
      <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
        <div className="bg-white p-6 border border-[#111E38]/5 shadow-sm">
          <h2 className="font-sans text-xs uppercase tracking-[0.15em] text-[#111E38] font-semibold border-b border-[#111E38]/5 pb-4 mb-4">
            Order Review Matrix
          </h2>

          <div className="max-h-[240px] overflow-y-auto divide-y divide-[#111E38]/5 pr-1">
            {cart.map((item) => (
              <div
                key={item.variantId}
                className="flex gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="w-12 aspect-[3/4] bg-[#111E38]/5 flex-shrink-0">
                  <img
                    src={item.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <h4 className="font-sans text-xs uppercase font-medium text-[#111E38] truncate">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-[#111E38]/50 uppercase tracking-widest mt-0.5">
                      Size: {item.size} / Color: {item.color}
                    </p>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#111E38]/60 font-light">
                      Qty: {item.amount}
                    </span>
                    <span className="font-semibold text-[#111E38]">
                      {(item.price * item.amount).toLocaleString()} DA
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-[#111E38]/5 pt-4 mt-4 space-y-3 font-sans text-xs uppercase tracking-wider">
            <div className="flex justify-between text-[#111E38]/70">
              <span className="font-light">Cart Subtotal</span>
              <span>{cartSubtotal.toLocaleString()} DA</span>
            </div>
            <div className="flex justify-between text-[#111E38]/70 items-center">
              <span className="font-light">Shipping Fee</span>
              <span>
                {selectedWilaya === 0 ? "Select Wilaya" : `${shippingFee} DA`}
              </span>
            </div>
            <div className="flex justify-between text-[#111E38] font-semibold pt-3 border-t border-[#111E38]/5 text-sm">
              <span>Total Price</span>
              <span className="text-base text-[#5A6049]">
                {finalOrderTotal.toLocaleString()} DA
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#111E38]/5 border border-[#111E38]/5 flex gap-3 text-xs text-[#111E38]/70 leading-relaxed font-sans">
          <HiOutlineShieldCheck className="text-xl text-[#5A6049] flex-shrink-0 mt-0.5" />
          <p>
            <strong>Risk-Free Purchase Guarantee:</strong> Payment is collected
            completely at delivery points only. Do not pay anything until your
            parcel arrives.
          </p>
        </div>
      </div>
    </div>
  );
}
