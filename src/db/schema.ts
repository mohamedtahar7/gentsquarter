import {
  pgTable,
  serial,
  varchar,
  integer,
  pgEnum,
  text,
  timestamp,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Order tracking lifecycle for the verification funnel
export const statusEnum = pgEnum("order_status", [
  "PENDING_CONFIRMATION", // Customer placed order, waiting for verification call
  "CONFIRMED", // Call completed, ready to package
  "SHIPPED", // Handed over to Yalidine/Zr/etc.
  "DELIVERED", // Received and paid
  "CANCELLED", // Rejected during call or refused at door
  "RETURNED", // Return to Origin (RTO) - courier returning package
]);

// 1. Geography Infrastructure
export const wilayas = pgTable("wilayas", {
  id: integer("id").primaryKey(), // 1 through 58 (or up to 69 depending on system)
  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  nameFr: varchar("name_fr", { length: 100 }).notNull(),
});

export const communes = pgTable("communes", {
  id: serial("id").primaryKey(),
  wilayaId: integer("wilaya_id")
    .references(() => wilayas.id, { onDelete: "cascade" })
    .notNull(),
  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  nameFr: varchar("name_fr", { length: 100 }).notNull(),
});

// 2. Apparel Inventory Management
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(), // Ensure this line exists!
  images: text("images").array().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  size: varchar("size", { length: 10 }).notNull(), // S, M, L, XL, XXL
  color: varchar("color", { length: 50 }).notNull(), // Black, Beige, White
  sku: varchar("sku", { length: 100 }).unique(), // Stock Keeping Unit
  stock: integer("stock").default(0).notNull(), // Crucial to prevent oversells
});

// 3. Checkout & COD Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 10 }).notNull(),
  address: text("address"),
  wilayaId: integer("wilaya_id")
    .references(() => wilayas.id)
    .notNull(),
  communeId: integer("commune_id")
    .references(() => communes.id)
    .notNull(),
  deliveryType: varchar("delivery_type", { length: 20 }).notNull(), // 'HOME' or 'STOP_DESK'
  shippingFee: decimal("shipping_fee", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  status: statusEnum("status").default("PENDING_CONFIRMATION").notNull(),
  trackingNumber: varchar("tracking_number", { length: 100 }),
  labelUrl: text("label_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  variantId: integer("variant_id")
    .references(() => productVariants.id)
    .notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

// Define structural relations for deep queries later
export const productRelations = relations(products, ({ many }) => ({
  variants: many(productVariants),
}));

export const variantRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
}));
