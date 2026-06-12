import { db } from "@/src/db";
import {
  orders,
  wilayas,
  communes,
  orderItems,
  productVariants,
  products,
} from "@/src/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { checkAdminAuth } from "./auth";
import AdminDashboardClientHub from "./admin-dashboard";

export const metadata = {
  title: "GQ Control Panel — Gent's Quarter",
};

export default async function AdminPage() {
  const isAuthenticated = await checkAdminAuth();

  // Guard Boundary: If not authorized, return a clean login layout directly
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#111E38] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#F9F8F4] p-8 border border-white/10 shadow-2xl rounded-sm">
          <div className="text-center mb-8">
            <img
              src="https://i.postimg.cc/RZhBwYjF/navbar-logo.png"
              alt="GQ"
              className="h-6 mx-auto mb-4"
            />
            <h2 className="font-sans text-xs uppercase tracking-[0.2em] text-[#111E38] font-bold">
              Control Panel Access
            </h2>
          </div>

          <form
            action={async (formData) => {
              "use server";
              const { loginAdmin } = require("./auth");
              const res = await loginAdmin(formData);
              if (!res.success) throw new Error(res.error);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#111E38]/60 font-medium mb-1.5">
                Username
              </label>
              <input
                type="text"
                name="username"
                required
                className="w-full bg-white border border-[#111E38]/10 text-sm p-3 text-[#111E38] focus:outline-none focus:border-[#111E38]"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#111E38]/60 font-medium mb-1.5">
                Secret Key Password
              </label>
              <input
                type="password"
                name="password"
                required
                className="w-full bg-white border border-[#111E38]/10 text-sm p-3 text-[#111E38] focus:outline-none focus:border-[#111E38]"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#111E38] hover:bg-[#5A6049] text-[#F9F8F4] py-3.5 uppercase font-sans text-xs tracking-[0.2em] font-medium transition-colors"
            >
              Authorize System Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- PREPARING DATA FOR THE CLIENT HUB ---

  // 1. Fetch Orders joined with geographic strings
  const databaseOrders = await db
    .select({
      id: orders.id,
      customerName: orders.customerName,
      phone: orders.phone,
      address: orders.address,
      deliveryType: orders.deliveryType,
      shippingFee: orders.shippingFee,
      totalPrice: orders.totalPrice,
      status: orders.status,
      createdAt: orders.createdAt,
      wilayaName: wilayas.nameFr,
      communeName: communes.nameFr,
    })
    .from(orders)
    .leftJoin(wilayas, eq(orders.wilayaId, wilayas.id))
    .leftJoin(communes, eq(orders.communeId, communes.id))
    .orderBy(desc(orders.createdAt));

  const allOrderItems = await db
    .select({
      orderId: orderItems.orderId,
      quantity: orderItems.quantity,
      price: orderItems.price,
      size: productVariants.size,
      color: productVariants.color,
      productName: products.name,
    })
    .from(orderItems)
    .leftJoin(productVariants, eq(orderItems.variantId, productVariants.id))
    .leftJoin(products, eq(productVariants.productId, products.id));

  const masterOrdersList = databaseOrders.map((order) => ({
    ...order,
    items: allOrderItems.filter((item) => item.orderId === order.id),
  }));

  // 2. Fetch Master Products List with an aggregated count of all variants and total stock
  const masterProductsList = await db
    .select({
      id: products.id,
      name: products.name,
      basePrice: products.basePrice,
      category: products.category,
      images: products.images, // 👈 MAKE SURE THIS IS HERE TO FETCH FROM NEON
      totalStock: sql<number>`coalesce(sum(${productVariants.stock}), 0)::int`,
      variantCount: sql<number>`count(${productVariants.id})::int`,
    })
    .from(products)
    .leftJoin(
      productVariants,
      sql`${products.id} = ${productVariants.productId}`,
    )
    .groupBy(products.id)
    .orderBy(products.id);
  return (
    <AdminDashboardClientHub
      orders={masterOrdersList}
      products={masterProductsList}
    />
  );
}
