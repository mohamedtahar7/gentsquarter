"use client";

import React, { useState, useEffect } from "react";
import { updateOrderStatus, OrderStatus } from "@/src/actions/admin";
import {
  deleteProductAction,
  updateProductAction,
} from "@/src/actions/productActions";
import {
  HiOutlineClipboardList,
  HiOutlinePlusCircle,
  HiOutlineCube,
  HiOutlineCheckCircle,
  HiOutlineTruck,
  HiOutlineInbox,
  HiOutlineLogout,
  HiOutlineExclamationCircle,
  HiOutlineTrash,
  HiOutlinePencilAlt,
  HiOutlineCheck,
  HiOutlineX,
} from "react-icons/hi";
import { logoutAdmin } from "./auth";
import AddProductForm from "@/components/AddProductForm";
import { toast } from "sonner";

type TabID =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "ALL_ORDERS"
  | "PRODUCTS"
  | "ADD_PRODUCT";

interface VariantInput {
  id?: number;
  size: string;
  stock: number;
  color?: string;
}

export default function AdminDashboardClientHub({
  orders: initialOrders,
  products: initialProducts,
}: {
  orders: any[];
  products: any[];
}) {
  const [activeTab, setActiveTab] = useState<TabID>("PENDING");
  const [orders, setOrders] = useState(initialOrders);
  const [products, setProducts] = useState(initialProducts);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Inline editing row states - explicitly tracking robust variant structures
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    basePrice: string;
    category: string;
    variants: VariantInput[];
  }>({
    name: "",
    basePrice: "",
    category: "",
    variants: [],
  });

  // Sync state if server data re-validates
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  // Compute local filtered orders
  const pendingOrders = orders.filter(
    (o) => o.status === "PENDING_CONFIRMATION",
  );
  const confirmedOrders = orders.filter((o) => o.status === "CONFIRMED");
  const shippedOrders = orders.filter((o) => o.status === "SHIPPED");

  const executeStatusMutation = async (
    orderId: number,
    nextStatus: OrderStatus,
  ) => {
    setUpdatingId(orderId);
    const res = await updateOrderStatus(orderId, nextStatus);
    if (res.success) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)),
      );
      toast.success(`Order #${orderId} Updated`);
    } else {
      toast.error("Mutation failed.");
    }
    setUpdatingId(null);
  };

  // Delete product action trigger
  const handleDeleteProduct = async (
    productId: number,
    productName: string,
  ) => {
    if (
      !confirm(`Are you sure you want to permanently delete "${productName}"?`)
    )
      return;

    const res = await deleteProductAction(productId);
    if (res.success) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.success("Product Deleted", {
        description: `${productName} was removed from database catalog.`,
      });
    } else {
      toast.error("Deletion Failed", { description: res.error });
    }
  };

  // 🛠️ FIXED: Deep copy incoming parameters with explicit type enforcement and safe fallbacks
  const startEditingProduct = (p: any) => {
    setEditingProductId(p.id);
    setEditForm({
      name: p.name || "",
      basePrice: p.basePrice ? parseFloat(p.basePrice).toString() : "0",
      category: p.category || "shirts",
      variants: Array.isArray(p.variants)
        ? p.variants.map((v: any) => ({
            id: v.id,
            size: v.size || "",
            stock:
              v.stock !== undefined && v.stock !== null ? Number(v.stock) : 0,
            color: v.color || "Default",
          }))
        : [],
    });
  };

  // State Management Helpers for editing current variant configurations
  const handleVariantChange = (
    index: number,
    field: keyof VariantInput,
    value: any,
  ) => {
    setEditForm((prev) => {
      const updated = [...prev.variants];
      updated[index] = {
        ...updated[index],
        [field]: field === "stock" ? parseInt(value) || 0 : value,
      };
      return { ...prev, variants: updated };
    });
  };

  const handleAddVariantRow = () => {
    setEditForm((prev) => ({
      ...prev,
      variants: [...prev.variants, { size: "", stock: 0, color: "Default" }],
    }));
  };

  const handleRemoveVariantRow = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  // Persist row mutations & variant arrays directly back to Neon database via server action
  const handleSaveProductEdit = async (productId: number) => {
    const parsedPrice = parseFloat(editForm.basePrice);
    if (!editForm.name.trim() || isNaN(parsedPrice)) {
      toast.error("Validation Error", {
        description: "Please look over input fields parameters.",
      });
      return;
    }

    // Filter out empty custom sizes before dispatching
    const filteredVariants = editForm.variants.filter(
      (v) => v.size.trim() !== "",
    );

    const res = await updateProductAction(productId, {
      name: editForm.name,
      basePrice: parsedPrice,
      category: editForm.category,
      variants: filteredVariants,
    });

    if (res.success) {
      const calculatedTotalStock = filteredVariants.reduce(
        (sum, v) => sum + v.stock,
        0,
      );

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? {
                ...p,
                name: editForm.name,
                basePrice: parsedPrice.toString(),
                category: editForm.category,
                variants: filteredVariants,
                variantCount: filteredVariants.length,
                totalStock: calculatedTotalStock,
              }
            : p,
        ),
      );
      setEditingProductId(null);
      toast.success("Product Details & Variants Updated");
    } else {
      toast.error("Update Failed", { description: res.error });
    }
  };

  const triggerSystemLogout = async () => {
    await logoutAdmin();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#F4F3EE] flex">
      {/* SIDEBAR NAVIGATION ENGINE */}
      <aside className="w-72 bg-[#111E38] text-[#F9F8F4] flex flex-col justify-between p-6 fixed h-full left-0 top-0 z-10">
        <div className="space-y-8">
          <div className="border-b border-white/10 pb-4">
            <img
              src="https://i.postimg.cc/RZhBwYjF/navbar-logo.png"
              alt="GQ Logo"
              className="h-5 invert brightness-200"
            />
            <span className="text-[9px] text-[#5A6049] tracking-widest font-mono uppercase block mt-2">
              V1.0.26 Operational Platform
            </span>
          </div>

          <nav className="space-y-1 font-sans text-xs uppercase tracking-wider font-medium">
            <button
              onClick={() => setActiveTab("PENDING")}
              className={`w-full flex items-center justify-between p-3 rounded-sm transition-colors ${activeTab === "PENDING" ? "bg-[#5A6049] text-white" : "hover:bg-white/5"}`}
            >
              <span className="flex items-center gap-3">
                <HiOutlineInbox className="text-base" /> Pending Verification
              </span>
              <span className="bg-[#F9F8F4]/10 px-2 py-0.5 text-[10px] font-bold text-white">
                {pendingOrders.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("CONFIRMED")}
              className={`w-full flex items-center justify-between p-3 rounded-sm transition-colors ${activeTab === "CONFIRMED" ? "bg-[#5A6049] text-white" : "hover:bg-white/5"}`}
            >
              <span className="flex items-center gap-3">
                <HiOutlineCheckCircle className="text-base" /> Confirmed Queues
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                {confirmedOrders.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("SHIPPED")}
              className={`w-full flex items-center justify-between p-3 rounded-sm transition-colors ${activeTab === "SHIPPED" ? "bg-[#5A6049] text-white" : "hover:bg-white/5"}`}
            >
              <span className="flex items-center gap-3">
                <HiOutlineTruck className="text-base" /> Shipped To Courier
              </span>
              <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 text-[10px] font-bold">
                {shippedOrders.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("ALL_ORDERS")}
              className={`w-full flex items-center gap-3 p-3 rounded-sm transition-colors ${activeTab === "ALL_ORDERS" ? "bg-[#5A6049] text-white" : "hover:bg-white/5"}`}
            >
              <HiOutlineClipboardList className="text-base" /> Master Orders Log
              ({orders.length})
            </button>

            <div className="h-[1px] bg-white/10 my-4" />

            <button
              onClick={() => setActiveTab("PRODUCTS")}
              className={`w-full flex items-center gap-3 p-3 rounded-sm transition-colors ${activeTab === "PRODUCTS" ? "bg-[#5A6049] text-white" : "hover:bg-white/5"}`}
            >
              <HiOutlineCube className="text-base" /> View All Products
            </button>
            <button
              onClick={() => setActiveTab("ADD_PRODUCT")}
              className={`w-full flex items-center gap-3 p-3 rounded-sm transition-colors ${activeTab === "ADD_PRODUCT" ? "bg-[#5A6049] text-white" : "hover:bg-white/5"}`}
            >
              <HiOutlinePlusCircle className="text-base" /> Add New Product
            </button>
          </nav>
        </div>

        <button
          onClick={triggerSystemLogout}
          className="flex items-center gap-3 p-3 text-xs uppercase tracking-wider text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors font-medium border-t border-white/5 pt-4"
        >
          <HiOutlineLogout className="text-base" /> Terminate Session
        </button>
      </aside>

      {/* DASHBOARD CANVAS MAIN AREA */}
      <main className="flex-1 pl-80 pr-12 py-12 overflow-y-auto">
        {/* Render Order System Views */}
        {["PENDING", "CONFIRMED", "SHIPPED", "ALL_ORDERS"].includes(
          activeTab,
        ) && (
          <div className="space-y-6">
            <h2 className="text-sm font-sans uppercase font-bold text-[#111E38] tracking-widest mb-6 border-b border-[#111E38]/10 pb-3">
              {activeTab === "PENDING" && "Inbound Calls Queue"}
              {activeTab === "CONFIRMED" && "Packaging Lines Execution Panel"}
              {activeTab === "SHIPPED" && "Courier Dispatched Consignments"}
              {activeTab === "ALL_ORDERS" && "Global Master Orders Archive"}
            </h2>

            {(activeTab === "PENDING"
              ? pendingOrders
              : activeTab === "CONFIRMED"
                ? confirmedOrders
                : activeTab === "SHIPPED"
                  ? shippedOrders
                  : orders
            ).map((order: any) => (
              <div
                key={order.id}
                className="bg-white border border-[#111E38]/10 p-6 flex justify-between items-start gap-8 shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold bg-[#111E38]/5 text-[#111E38] px-2 py-0.5">
                      #{order.id}
                    </span>
                    <h4 className="font-sans font-semibold text-[#111E38]">
                      {order.customerName}
                    </h4>
                    <span className="text-[10px] font-mono font-medium border px-2 py-0.5 uppercase bg-slate-50">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs font-sans text-[#111E38] font-medium">
                    📞 {order.phone}
                  </p>
                  <p className="text-xs font-sans text-[#111E38]/60 font-light">
                    📍 {order.wilayaName} — {order.communeName} ({order.address}
                    )
                  </p>

                  <div className="pt-3 space-y-1.5">
                    {order.items.map((it: any, i: number) => (
                      <p
                        key={i}
                        className="text-xs text-[#111E38]/80 font-sans"
                      >
                        • {it.productName} (
                        <span className="font-bold uppercase text-[10px]">
                          {it.size}
                        </span>{" "}
                        / {it.color}) — {it.quantity}x
                      </p>
                    ))}
                  </div>
                </div>

                <div className="text-right flex flex-col justify-between h-full items-end gap-6 min-w-[200px]">
                  <div>
                    <p className="text-[10px] uppercase font-sans tracking-widest text-[#111E38]/40">
                      Total Billing value
                    </p>
                    <p className="text-base font-sans font-bold text-[#5A6049]">
                      {parseFloat(order.totalPrice).toLocaleString()} DA
                    </p>
                  </div>

                  {order.status === "PENDING_CONFIRMATION" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          executeStatusMutation(order.id, "CANCELLED")
                        }
                        className="bg-red-50 hover:bg-red-600 text-red-700 hover:text-white px-3 py-1.5 text-xs uppercase font-sans tracking-wider transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() =>
                          executeStatusMutation(order.id, "CONFIRMED")
                        }
                        className="bg-emerald-600 hover:bg-[#5A6049] text-white px-3 py-1.5 text-xs uppercase font-sans tracking-wider transition-colors"
                      >
                        Confirm
                      </button>
                    </div>
                  )}

                  {order.status === "CONFIRMED" && (
                    <button
                      onClick={() => executeStatusMutation(order.id, "SHIPPED")}
                      className="bg-[#111E38] hover:bg-[#5A6049] text-white px-4 py-2 text-xs uppercase font-sans tracking-widest transition-colors"
                    >
                      Mark as Shipped
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Inventory View and Inline Manager Dashboard */}
        {activeTab === "PRODUCTS" && (
          <div className="space-y-6">
            <h2 className="text-sm font-sans uppercase font-bold text-[#111E38] tracking-widest mb-6 border-b border-[#111E38]/10 pb-3">
              Active Brand Catalog Inventory
            </h2>
            <div className="bg-white border border-[#111E38]/10 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="bg-[#111E38] text-white uppercase tracking-widest text-[10px]">
                    <th className="p-4 font-medium max-w-[80px]">Image</th>
                    <th className="p-4 font-medium max-w-[60px]">ID</th>
                    <th className="p-4 font-medium">Product Apparel Name</th>
                    <th className="p-4 font-medium">Collection Category</th>
                    <th className="p-4 font-medium">Base Price</th>
                    <th className="p-4 font-medium min-w-[185px]">
                      Variants Configured (Size / Qty)
                    </th>
                    <th className="p-4 font-medium">Total Available Stock</th>
                    <th className="p-4 font-medium">Status Flag</th>
                    <th className="p-4 font-medium text-center">
                      Actions Management
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[#111E38]">
                  {products.map((p) => {
                    const isEditing = editingProductId === p.id;
                    const dbFirstImage =
                      Array.isArray(p.images) && p.images.length > 0
                        ? p.images[0]
                        : null;

                    // 🛠️ FIXED: Compute live stock total strictly for the actively selected row
                    const liveEditingTotalStock = isEditing
                      ? editForm.variants.reduce(
                          (sum, v) => sum + (v.stock || 0),
                          0,
                        )
                      : 0;

                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-50/80 transition-colors vertical-top-align"
                      >
                        {/* Native DB Image Rendering Cell */}
                        <td className="p-4 align-top">
                          {dbFirstImage ? (
                            <img
                              src={dbFirstImage}
                              alt={`${p.name} primary preview`}
                              className="w-12 h-16 object-cover border border-[#111E38]/10 bg-white"
                            />
                          ) : (
                            <div className="w-12 h-16 bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-[9px] text-gray-400 font-mono text-center px-1 leading-tight">
                              No Image in DB
                            </div>
                          )}
                        </td>

                        <td className="p-4 font-mono font-bold align-top">
                          #{p.id}
                        </td>

                        {/* Name Field Input Mutation Row */}
                        <td className="p-4 font-medium align-top">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  name: e.target.value,
                                })
                              }
                              className="bg-[#F4F3EE] border border-[#111E38]/20 text-xs p-2 text-[#111E38] focus:outline-none w-full font-sans"
                            />
                          ) : (
                            p.name
                          )}
                        </td>

                        {/* Category Config */}
                        <td className="p-4 uppercase tracking-wider font-mono text-[10px] align-top">
                          {isEditing ? (
                            <select
                              value={editForm.category}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  category: e.target.value,
                                })
                              }
                              className="bg-[#F4F3EE] border border-[#111E38]/20 text-xs p-1.5 text-[#111E38] focus:outline-none w-full rounded-none"
                            >
                              <option value="shirts">Shirts</option>
                              <option value="pants">Pants</option>
                              <option value="shoes">Shoes</option>
                              <option value="accessories">Accessories</option>
                            </select>
                          ) : (
                            p.category || "shirts"
                          )}
                        </td>

                        {/* Pricing Update Node */}
                        <td className="p-4 font-sans font-medium align-top">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={editForm.basePrice}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    basePrice: e.target.value,
                                  })
                                }
                                className="bg-[#F4F3EE] border border-[#111E38]/20 text-xs p-2 text-[#111E38] focus:outline-none w-24 font-mono"
                              />
                              <span className="text-[10px] text-gray-400">
                                DA
                              </span>
                            </div>
                          ) : (
                            `${parseFloat(p.basePrice).toLocaleString()} DA`
                          )}
                        </td>

                        {/* SIZES AND QUANTITIES INTERACTIVE ENGINE CELL */}
                        <td className="p-4 font-mono align-top">
                          {isEditing ? (
                            <div className="space-y-1.5 max-w-[180px]">
                              {editForm.variants.map((v, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-1"
                                >
                                  {/* Size Selector Label Input */}
                                  <input
                                    type="text"
                                    placeholder="Size"
                                    value={v.size}
                                    onChange={(e) =>
                                      handleVariantChange(
                                        index,
                                        "size",
                                        e.target.value,
                                      )
                                    }
                                    className="w-12 bg-[#F4F3EE] border border-[#111E38]/20 p-1 text-[11px] uppercase font-mono text-center focus:outline-none"
                                  />
                                  {/* Quantity / Inventory Stock Input */}
                                  <input
                                    type="number"
                                    placeholder="Qty"
                                    value={v.stock === 0 ? "" : v.stock}
                                    onChange={(e) =>
                                      handleVariantChange(
                                        index,
                                        "stock",
                                        e.target.value,
                                      )
                                    }
                                    className="w-16 bg-[#F4F3EE] border border-[#111E38]/20 p-1 text-[11px] font-mono text-center focus:outline-none"
                                  />
                                  {/* Row Entry Eraser */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveVariantRow(index)
                                    }
                                    className="text-red-400 hover:text-red-600 p-1 transition-colors"
                                    title="Remove Variant"
                                  >
                                    <HiOutlineX className="text-xs" />
                                  </button>
                                </div>
                              ))}

                              <button
                                type="button"
                                onClick={handleAddVariantRow}
                                className="text-[10px] text-[#5A6049] hover:text-[#111E38] underline font-sans font-bold flex items-center gap-0.5 mt-2"
                              >
                                + Add Size Variant
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              {p.variants && p.variants.length > 0 ? (
                                p.variants.map((v: any, idx: number) => (
                                  <div key={idx} className="text-[11px]">
                                    <span className="font-bold uppercase text-slate-500">
                                      {v.size}:
                                    </span>{" "}
                                    {v.stock} pcs
                                  </div>
                                ))
                              ) : (
                                <span className="text-gray-400 italic text-[11px]">
                                  No variants configured
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Total Available Stock Flag */}
                        <td className="p-4 font-mono font-bold align-top">
                          {isEditing
                            ? `${liveEditingTotalStock} units`
                            : `${p.totalStock ?? 0} units`}
                        </td>

                        <td className="p-4 align-top">
                          {(isEditing
                            ? liveEditingTotalStock
                            : (p.totalStock ?? 0)) === 0 ? (
                            <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                              <HiOutlineExclamationCircle /> Out of Stock
                            </span>
                          ) : (
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                              Active
                            </span>
                          )}
                        </td>

                        {/* Actions Control Center Panel */}
                        <td className="p-4 text-center align-top">
                          {isEditing ? (
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleSaveProductEdit(p.id)}
                                className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded shadow-sm transition-colors"
                                title="Save Updates"
                              >
                                <HiOutlineCheck className="text-sm" />
                              </button>
                              <button
                                onClick={() => setEditingProductId(null)}
                                className="p-2 bg-gray-400 hover:bg-gray-500 text-white rounded shadow-sm transition-colors"
                                title="Cancel"
                              >
                                <HiOutlineX className="text-sm" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => startEditingProduct(p)}
                                className="p-2 border border-gray-200 text-gray-600 hover:bg-[#111E38] hover:text-white transition-all rounded"
                                title="Edit Row Values"
                              >
                                <HiOutlinePencilAlt className="text-sm" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteProduct(p.id, p.name)
                                }
                                className="p-2 border border-transparent text-red-600 hover:bg-red-50 transition-all rounded"
                                title="Delete Catalog entry"
                              >
                                <HiOutlineTrash className="text-sm" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Creation Form Workspace */}
        {activeTab === "ADD_PRODUCT" && (
          <div className="space-y-6">
            <AddProductForm onComplete={() => setActiveTab("PRODUCTS")} />
          </div>
        )}
      </main>
    </div>
  );
}
